"""
Google Drive 连接器
依赖: google-api-python-client, google-auth
"""

from datetime import datetime
from typing import List
from google.oauth2 import service_account
from googleapiclient.discovery import build
from connectors.base import BaseConnector
from models.course import Course, CourseFile
from utils.logger import get_logger

logger = get_logger(__name__)

SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]


class GoogleDriveConnector(BaseConnector):
    def __init__(self, config: dict):
        super().__init__(config)
        self.service = None

    @property
    def name(self) -> str:
        return "Google Drive"

    async def authenticate(self):
        creds = service_account.Credentials.from_service_account_file(
            self.config["credentials_file"], scopes=SCOPES
        )
        self.service = build("drive", "v3", credentials=creds)
        logger.info("Google Drive 认证成功")

    async def list_courses(self) -> List[Course]:
        if not self.service:
            await self.authenticate()

        folder_id = self.config.get("root_folder_id")
        query = f"'{folder_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
        result = self.service.files().list(
            q=query,
            fields="files(id, name, modifiedTime, description)"
        ).execute()

        courses = []
        for item in result.get("files", []):
            course = Course(
                id=item["id"],
                title=item["name"],
                source=self.name,
                folder_path=item["name"],
                description=item.get("description"),
                updated_at=datetime.fromisoformat(item["modifiedTime"].replace("Z", "+00:00")),
            )
            course.files = await self.get_course_files(item["id"])
            courses.append(course)

        return courses

    async def get_course_files(self, course_id: str) -> List[CourseFile]:
        query = f"'{course_id}' in parents and trashed=false"
        result = self.service.files().list(
            q=query,
            fields="files(id, name, size, mimeType, modifiedTime, webViewLink)"
        ).execute()

        files = []
        for f in result.get("files", []):
            files.append(CourseFile(
                name=f["name"],
                url=f.get("webViewLink", ""),
                size=int(f.get("size", 0)),
                mime_type=f.get("mimeType", ""),
                updated_at=datetime.fromisoformat(f["modifiedTime"].replace("Z", "+00:00")),
            ))
        return files
