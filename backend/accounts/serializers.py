from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True)
   # email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, required=False)
    current_password = serializers.CharField(
    write_only=True,
    required=False
)

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "username",
            "email",
            "phone_number",
          #  "id_number",
            "role",
            "password",
            "confirm_password",
            "current_password",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        confirm_password = attrs.pop("confirm_password", None)
        if confirm_password is not None and attrs["password"] != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        full_name = validated_data.pop("full_name")
        password = validated_data.pop("password")
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
    
    def update_information (self, instance, validated_data):
        full_name = validated_data.pop("full_name", None)
        if full_name:
            name_parts = full_name.strip().split()
            instance.first_name = name_parts[0] if name_parts else ""
            instance.last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
        current_password = validated_data.pop("current_password", None)
        password = validated_data.pop("password", None)

        if password:
            if not current_password:
                raise serializers.ValidationError({
                "current_password": "Current password is required."
                })

            if not instance.check_password(current_password):
                raise serializers.ValidationError({
                    "current_password": "Current password is incorrect."
                    })

            instance.set_password(password)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
