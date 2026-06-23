from abc import ABC, abstractmethod
from typing import List
from models.course import Course


class BaseNotifier(ABC):
    def __init__(self, config: dict):
        self.config = config

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    async def send(self, courses: List[Course]): ...

    def _format_message(self, courses: List[Course]) -> str:
        lines = ["📚 云盘课程更新通知", ""]
        for c in courses:
            lines.append(f"▶ {c.title}（来源：{c.source}）")
            lines.append(f"  📁 路径：{c.folder_path}")
            if c.updated_at:
                lines.append(f"  🕒 更新：{c.updated_at.strftime('%Y-%m-%d %H:%M')}")
            if c.files:
                lines.append(f"  📄 文件数：{len(c.files)}")
            lines.append("")
        return "\n".join(lines)
