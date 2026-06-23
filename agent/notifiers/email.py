"""
邮件推送（SMTP）
"""

import aiosmtplib
from email.mime.text import MIMEText
from typing import List
from notifiers.base import BaseNotifier
from models.course import Course
from utils.logger import get_logger

logger = get_logger(__name__)


class EmailNotifier(BaseNotifier):
    @property
    def name(self) -> str:
        return "邮件"

    async def send(self, courses: List[Course]):
        cfg = self.config
        message = MIMEText(self._format_message(courses), "plain", "utf-8")
        message["Subject"] = "📚 云盘课程更新通知"
        message["From"] = cfg["sender"]
        message["To"] = ", ".join(cfg["recipients"])

        await aiosmtplib.send(
            message,
            hostname=cfg["smtp_host"],
            port=cfg.get("smtp_port", 587),
            username=cfg["username"],
            password=cfg["password"],
            use_tls=cfg.get("use_tls", True),
        )
