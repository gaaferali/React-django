from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8, required=False, allow_blank=False)
    confirm_password = serializers.CharField(write_only=True, required=False, allow_blank=False)
    current_password = serializers.CharField(write_only=True, required=False, allow_blank=False)

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "username",
            "email",
            "phone_number",
            "role",
            "password",
            "confirm_password",
            "current_password",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")
        current_password = attrs.get("current_password")

        if self.instance is None:
            if not password:
                raise serializers.ValidationError({"password": "Password is required."})
            if not confirm_password:
                raise serializers.ValidationError({"confirm_password": "Please confirm the password."})
            if password != confirm_password:
                raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        elif password:
            if not current_password:
                raise serializers.ValidationError({"current_password": "Current password is required."})
            if not self.instance.check_password(current_password):
                raise serializers.ValidationError({"current_password": "Current password is incorrect."})
            if confirm_password and password != confirm_password:
                raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        return attrs

    def create(self, validated_data):
        full_name = validated_data.pop("full_name")
        password = validated_data.pop("password")
        validated_data.pop("confirm_password", None)
        validated_data.pop("current_password", None)

        name_parts = full_name.strip().split()
        first_name = name_parts[0] if name_parts else ""
        last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

        user = User(first_name=first_name, last_name=last_name, **validated_data)
        user.set_password(password)
        user.save()
        return user

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["full_name"] = instance.get_full_name()
        return data

    def update_information(self, instance, validated_data):
        full_name = validated_data.pop("full_name", None)
        if full_name:
            name_parts = full_name.strip().split()
            instance.first_name = name_parts[0] if name_parts else ""
            instance.last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

        current_password = validated_data.pop("current_password", None)
        password = validated_data.pop("password", None)
        validated_data.pop("confirm_password", None)

        if password:
            if not current_password:
                raise serializers.ValidationError({"current_password": "Current password is required."})
            if not instance.check_password(current_password):
                raise serializers.ValidationError({"current_password": "Current password is incorrect."})
            instance.set_password(password)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance



class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data["role"] = self.user.role
        data["user"] = UserSerializer(self.user).data
        return data
