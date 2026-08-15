import os
import asyncio

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from channels.layers import get_channel_layer


async def test():
    layer = get_channel_layer()

    print("Channel layer:", layer)

    await layer.group_add(
        "test_group",
        "test_channel",
    )

    print("GROUP ADD OK")

    await layer.group_discard(
        "test_group",
        "test_channel",
    )

    print("GROUP DISCARD OK")


asyncio.run(test())