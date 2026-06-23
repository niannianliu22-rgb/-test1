"""
Agent 核心调度逻辑
"""

import asyncio
from typing import List
from config.settings import Settings
from connectors.base import BaseConnector
from connectors.google_drive import GoogleDriveConnector
from connectors.baidu_pan import BaiduPanConnector
from notifiers.base import BaseNotifier
from notifiers.dingtalk import DingTalkNotifier
from notifiers.wechat import WeChatNotifier
from notifiers.email import EmailNotifier
from schedulers.task_scheduler import TaskScheduler
from models.course import Course
from utils.logger import get_logger

logger = get_logger(__name__)


class CourseAgent:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.connectors: List[BaseConnector] = self._init_connectors()
        self.notifiers: List[BaseNotifier] = self._init_notifiers()
        self.scheduler = TaskScheduler(settings.schedule)

    def _init_connectors(self) -> List[BaseConnector]:
        connectors = []
        cfg = self.settings.connectors
        if cfg.get("google_drive", {}).get("enabled"):
            connectors.append(GoogleDriveConnector(cfg["google_drive"]))
        if cfg.get("baidu_pan", {}).get("enabled"):
            connectors.append(BaiduPanConnector(cfg["baidu_pan"]))
        return connectors

    def _init_notifiers(self) -> List[BaseNotifier]:
        notifiers = []
        cfg = self.settings.notifiers
        if cfg.get("dingtalk", {}).get("enabled"):
            notifiers.append(DingTalkNotifier(cfg["dingtalk"]))
        if cfg.get("wechat", {}).get("enabled"):
            notifiers.append(WeChatNotifier(cfg["wechat"]))
        if cfg.get("email", {}).get("enabled"):
            notifiers.append(EmailNotifier(cfg["email"]))
        return notifiers

    async def fetch_courses(self) -> List[Course]:
        all_courses = []
        for connector in self.connectors:
            try:
                courses = await connector.list_courses()
                all_courses.extend(courses)
                logger.info(f"[{connector.name}] 获取到 {len(courses)} 门课程")
            except Exception as e:
                logger.error(f"[{connector.name}] 获取课程失败: {e}")
        return all_courses

    async def push_courses(self, courses: List[Course]):
        for notifier in self.notifiers:
            try:
                await notifier.send(courses)
                logger.info(f"[{notifier.name}] 推送成功，共 {len(courses)} 门课程")
            except Exception as e:
                logger.error(f"[{notifier.name}] 推送失败: {e}")

    async def job(self):
        logger.info("开始执行课程推送任务...")
        courses = await self.fetch_courses()
        if not courses:
            logger.info("未发现新课程，跳过推送")
            return
        await self.push_courses(courses)
        logger.info("课程推送任务完成")

    async def run(self):
        await self.scheduler.start(self.job)
