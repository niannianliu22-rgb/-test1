from abc import ABC, abstractmethod
from typing import List
from models.course import Course


class BaseConnector(ABC):
    def __init__(self, config: dict):
        self.config = config

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    async def authenticate(self): ...

    @abstractmethod
    async def list_courses(self) -> List[Course]: ...

    @abstractmethod
    async def get_course_files(self, course_id: str) -> List: ...
