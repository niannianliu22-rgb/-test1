import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from models.course import Course, CourseFile
from datetime import datetime


@pytest.fixture
def sample_courses():
    return [
        Course(
            id="1",
            title="Python 基础课程",
            source="Google Drive",
            folder_path="/courses/python",
            updated_at=datetime(2024, 1, 1, 10, 0),
            files=[
                CourseFile(
                    name="lesson1.pdf",
                    url="https://drive.google.com/file/1",
                    size=1024,
                    mime_type="application/pdf",
                    updated_at=datetime(2024, 1, 1, 10, 0),
                )
            ],
        )
    ]


@pytest.mark.asyncio
async def test_agent_fetch_and_push(sample_courses):
    from core.agent import CourseAgent
    from config.settings import Settings

    settings = MagicMock(spec=Settings)
    settings.schedule = {"cron": "0 8 * * *", "run_on_start": False}
    settings.connectors = {}
    settings.notifiers = {}

    agent = CourseAgent(settings)
    agent.connectors = [AsyncMock(name="MockConnector", list_courses=AsyncMock(return_value=sample_courses))]
    agent.notifiers = [AsyncMock(name="MockNotifier", send=AsyncMock())]

    await agent.job()

    agent.notifiers[0].send.assert_called_once_with(sample_courses)


@pytest.mark.asyncio
async def test_agent_skips_push_when_no_courses():
    from core.agent import CourseAgent
    from config.settings import Settings

    settings = MagicMock(spec=Settings)
    settings.schedule = {}
    settings.connectors = {}
    settings.notifiers = {}

    agent = CourseAgent(settings)
    agent.connectors = [AsyncMock(list_courses=AsyncMock(return_value=[]))]
    agent.notifiers = [AsyncMock(send=AsyncMock())]

    await agent.job()

    agent.notifiers[0].send.assert_not_called()
