"""
钉钉机器人推送
"""

import hmac
import hashlib
import base64
import time
import urllib.parse
import aiohttp
from typing import List
from notifiers.base import BaseNotifier
from models.course import Course
from utils.logger import get_logger

logger = get_logger(__name__)


class DingTalkNotifier(BaseNotifier):
    @property
    def name(self) -> str:
        return "钉钉"

    def _sign(self) -> tuple[str, str]:
        timestamp = str(round(time.time() * 1000))
        secret = self.config["secret"]
        string_to_sign = f"{timestamp}\n{secret}"
        hmac_code = hmac.new(
            secret.encode("utf-8"),
            string_to_sign.encode("utf-8"),
            digestmod=hashlib.sha256,
        ).digest()
        sign = urllib.parse.quote_plus(base64.b64encode(hmac_code))
        return timestamp, sign

    async def send(self, courses: List[Course]):
        webhook = self.config["webhook"]
        timestamp, sign = self._sign()
        url = f"{webhook}&timestamp={timestamp}&sign={sign}"

        payload = {
            "msgtype": "text",
            "text": {"content": self._format_message(courses)},
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as resp:
                result = await resp.json()
                if result.get("errcode") != 0:
                    raise RuntimeError(f"钉钉推送失败: {result}")
