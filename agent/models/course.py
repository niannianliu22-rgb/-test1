from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List


@dataclass
class CourseFile:
    name: str
    url: str
    size: int
    mime_type: str
    updated_at: datetime


@dataclass
class Course:
    id: str
    title: str
    source: str                        # 来源云盘名称
    folder_path: str
    files: List[CourseFile] = field(default_factory=list)
    description: Optional[str] = None
    updated_at: Optional[datetime] = None
    tags: List[str] = field(default_factory=list)
