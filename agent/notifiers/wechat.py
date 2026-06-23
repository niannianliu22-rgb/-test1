"""
企业微信机器人推送
"""

import aiohttp
from typing import List
from notifiers.base import BaseNotifier
from models.course import Course
from utils.logger import get_logger

logger = get_logger(__name__)


class WeChatNotifier(BaseNotifier):
    @property
    def name(self) -> str:
        return "企业微信"

    async def send(self, courses: List[Course]):
        webhook = self.config["webhook"]
        payload = {
            "msgtype": "text",
            "text": {"content": self._format_message(courses)},
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(webhook, json=payload) as resp:
                result = await resp.json()
                if result.get("errcode") != 0:
                    raise RuntimeError(f"企业微信推送失败: {result}")
