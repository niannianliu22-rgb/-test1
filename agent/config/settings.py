"""
配置加载器：优先读取环境变量，其次读取 config.yaml
"""

import os
import yaml
from pathlib import Path
from utils.logger import get_logger

logger = get_logger(__name__)

DEFAULT_CONFIG_PATH = Path(__file__).parent / "config.yaml"


class Settings:
    def __init__(self, config_path: Path = DEFAULT_CONFIG_PATH):
        raw = self._load(config_path)
        self.schedule: dict = raw.get("schedule", {})
        self.connectors: dict = raw.get("connectors", {})
        self.notifiers: dict = raw.get("notifiers", {})

    def _load(self, path: Path) -> dict:
        if not path.exists():
            logger.warning(f"配置文件不存在: {path}，使用默认配置")
            return {}
        with open(path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
        return self._override_from_env(data)

    def _override_from_env(self, data: dict) -> dict:
        # 支持通过环境变量覆盖关键配置
        overrides = {
            "GOOGLE_CREDENTIALS_FILE": ["connectors", "google_drive", "credentials_file"],
            "GOOGLE_ROOT_FOLDER_ID": ["connectors", "google_drive", "root_folder_id"],
            "BAIDU_ACCESS_TOKEN": ["connectors", "baidu_pan", "access_token"],
            "DINGTALK_WEBHOOK": ["notifiers", "dingtalk", "webhook"],
            "DINGTALK_SECRET": ["notifiers", "dingtalk", "secret"],
            "WECHAT_WEBHOOK": ["notifiers", "wechat", "webhook"],
            "EMAIL_SMTP_HOST": ["notifiers", "email", "smtp_host"],
            "EMAIL_USERNAME": ["notifiers", "email", "username"],
            "EMAIL_PASSWORD": ["notifiers", "email", "password"],
            "SCHEDULE_CRON": ["schedule", "cron"],
        }
        for env_key, path in overrides.items():
            val = os.environ.get(env_key)
            if val:
                obj = data
                for key in path[:-1]:
                    obj = obj.setdefault(key, {})
                obj[path[-1]] = val
        return data
