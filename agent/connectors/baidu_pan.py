"""
百度网盘连接器
依赖: requests
"""

import aiohttp
from datetime import datetime
from typing import List
from connectors.base import BaseConnector
from models.course import Course, CourseFile
from utils.logger import get_logger

logger = get_logger(__name__)

BAIDU_PCS_BASE = "https://pan.baidu.com/rest/2.0/xpan"


class BaiduPanConnector(BaseConnector):
    def __init__(self, config: dict):
        super().__init__(config)
        self.access_token: str = config.get("access_token", "")

    @property
    def name(self) -> str:
        return "百度网盘"

    async def authenticate(self):
        # 百度网盘使用 OAuth2 access_token，由用户提前配置
        if not self.access_token:
            raise ValueError("百度网盘 access_token 未配置")
        logger.info("百度网盘 Token 已就绪")

    async def list_courses(self) -> List[Course]:
        if not self.access_token:
            await self.authenticate()

        root_path = self.config.get("root_path", "/课程")
        url = f"{BAIDU_PCS_BASE}/file"
        params = {
            "method": "list",
            "access_token": self.access_token,
            "dir": root_path,
            "order": "time",
            "desc": 1,
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as resp:
                data = await resp.json()

        courses = []
        for item in data.get("list", []):
            if item.get("isdir") == 1:
                course = Course(
                    id=str(item["fs_id"]),
                    title=item["server_filename"],
                    source=self.name,
                    folder_path=item["path"],
                    updated_at=datetime.fromtimestamp(item["server_mtime"]),
                )
                course.files = await self.get_course_files(item["path"])
                courses.append(course)

        return courses

    async def get_course_files(self, folder_path: str) -> List[CourseFile]:
        url = f"{BAIDU_PCS_BASE}/file"
        params = {
            "method": "list",
            "access_token": self.access_token,
            "dir": folder_path,
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as resp:
                data = await resp.json()

        files = []
        for f in data.get("list", []):
            if f.get("isdir") == 0:
                files.append(CourseFile(
                    name=f["server_filename"],
                    url=f"https://pan.baidu.com/s/{f.get('fs_id', '')}",
                    size=f.get("size", 0),
                    mime_type="",
                    updated_at=datetime.fromtimestamp(f["server_mtime"]),
                ))
        return files
