"""
云盘课程定时推送 Agent 入口
"""

import asyncio
import signal
import sys
from core.agent import CourseAgent
from config.settings import Settings
from utils.logger import get_logger

logger = get_logger(__name__)


def handle_shutdown(sig, frame):
    logger.info("收到退出信号，正在关闭 Agent...")
    sys.exit(0)


async def main():
    signal.signal(signal.SIGINT, handle_shutdown)
    signal.signal(signal.SIGTERM, handle_shutdown)

    settings = Settings()
    agent = CourseAgent(settings)

    logger.info("云盘课程定时推送 Agent 启动")
    await agent.run()


if __name__ == "__main__":
    asyncio.run(main())
