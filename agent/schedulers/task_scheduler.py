"""
定时任务调度器（基于 APScheduler）
"""

import asyncio
from typing import Callable, Awaitable
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from utils.logger import get_logger

logger = get_logger(__name__)


class TaskScheduler:
    def __init__(self, config: dict):
        self.config = config
        self.scheduler = AsyncIOScheduler()

    async def start(self, job: Callable[[], Awaitable[None]]):
        cron = self.config.get("cron", "0 8 * * *")  # 默认每天早 8 点
        self.scheduler.add_job(
            job,
            CronTrigger.from_crontab(cron),
            id="course_push_job",
            replace_existing=True,
        )
        self.scheduler.start()
        logger.info(f"调度器启动，Cron 表达式: {cron}")

        # 启动时立即执行一次
        if self.config.get("run_on_start", True):
            logger.info("启动时立即执行一次...")
            await job()

        try:
            await asyncio.Event().wait()
        except (KeyboardInterrupt, SystemExit):
            self.scheduler.shutdown()
            logger.info("调度器已停止")
