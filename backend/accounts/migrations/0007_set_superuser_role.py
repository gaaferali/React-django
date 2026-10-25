from django.db import migrations


def set_superuser_role(apps, schema_editor):
    user_model = apps.get_model("accounts", "User")
    user_model.objects.filter(is_superuser=True).exclude(role="Admin").update(
        role="Admin"
    )


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0006_idempotencyrecord"),
    ]

    operations = [
        migrations.RunPython(set_superuser_role, migrations.RunPython.noop),
    ]
