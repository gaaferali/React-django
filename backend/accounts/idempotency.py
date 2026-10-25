import hashlib
import json
from datetime import timedelta

from django.conf import settings
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.utils import timezone
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken

from .models import IdempotencyRecord


UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


def _json_error(detail, status):
    return JsonResponse({"detail": detail}, status=status)


class IdempotencyMiddleware:
    """Replay completed API mutations that use the same Idempotency-Key."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        is_api_request = request.path.startswith("/api/") or request.path.startswith("/accounts/")
        if request.method not in UNSAFE_METHODS or not is_api_request:
            return self.get_response(request)

        key = request.headers.get("Idempotency-Key", "").strip()
        if not key:
            return self.get_response(request)
        if len(key) > 255:
            return _json_error("Idempotency-Key must be 255 characters or fewer.", 400)

        scope_hash = self._scope_hash(request)
        request_hash = self._request_hash(request)
        record, created = self._claim_record(
            key=key,
            scope_hash=scope_hash,
            request_hash=request_hash,
            request=request,
        )

        if not created:
            if record.request_hash != request_hash:
                return _json_error(
                    "This Idempotency-Key was already used for a different request.",
                    409,
                )

            if record.state == IdempotencyRecord.COMPLETED:
                response = JsonResponse(
                    record.response_body,
                    safe=isinstance(record.response_body, dict),
                    status=record.response_status,
                )
                response["Content-Type"] = record.content_type
                response["Idempotency-Replayed"] = "true"
                return response

            timeout = int(
                getattr(settings, "IDEMPOTENCY_PROCESSING_TIMEOUT_SECONDS", 300)
            )
            if record.updated_at < timezone.now() - timedelta(seconds=timeout):
                record.delete()
                return self.__call__(request)

            return _json_error(
                "A request with this Idempotency-Key is already being processed.",
                409,
            )

        try:
            response = self.get_response(request)
        except Exception:
            record.delete()
            raise

        content_type = response.get("Content-Type", "")
        if response.streaming or "application/json" not in content_type:
            record.delete()
            return response

        if response.status_code >= 500:
            record.delete()
            return response

        try:
            response_body = json.loads(response.content.decode(response.charset or "utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            record.delete()
            return response

        record.state = IdempotencyRecord.COMPLETED
        record.response_status = response.status_code
        record.response_body = response_body
        record.content_type = content_type
        record.save(
            update_fields=[
                "state",
                "response_status",
                "response_body",
                "content_type",
                "updated_at",
            ]
        )
        response["Idempotency-Replayed"] = "false"
        return response

    @staticmethod
    def _claim_record(*, key, scope_hash, request_hash, request):
        defaults = {
            "request_hash": request_hash,
            "method": request.method,
            "path": request.get_full_path(),
        }
        try:
            with transaction.atomic():
                return IdempotencyRecord.objects.get_or_create(
                    key=key,
                    scope_hash=scope_hash,
                    defaults=defaults,
                )
        except IntegrityError:
            return (
                IdempotencyRecord.objects.get(key=key, scope_hash=scope_hash),
                False,
            )

    @staticmethod
    def _request_hash(request):
        digest = hashlib.sha256()
        digest.update(request.method.encode())
        digest.update(b"\0")
        digest.update(request.get_full_path().encode())
        digest.update(b"\0")
        digest.update(request.body)
        return digest.hexdigest()

    @staticmethod
    def _scope_hash(request):
        identity = "anonymous"
        authorization = request.headers.get("Authorization", "")
        if authorization.lower().startswith("bearer "):
            token = authorization.split(" ", 1)[1]
            try:
                identity = f"user:{AccessToken(token).get('user_id')}"
            except (TokenError, KeyError):
                identity = "token:" + hashlib.sha256(token.encode()).hexdigest()
        return hashlib.sha256(identity.encode()).hexdigest()
