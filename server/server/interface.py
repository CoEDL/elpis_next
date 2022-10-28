from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from flask import Flask

from server.managers.dataset_manager import DatasetManager

FALLBACK_PATH = Path("/tmp/elpis")
INTERFACE_KEY = "INTERFACE"


@dataclass
class Interface:
    path: Path
    overwrite: bool = False
    dataset_manager: DatasetManager = field(init=False)

    def __post_init__(self):
        self.dataset_manager = DatasetManager(path=self.path, overwrite=self.overwrite)

    @classmethod
    def from_app(cls, app: Flask):
        interface: cls = app.config.get(INTERFACE_KEY, cls(FALLBACK_PATH))
        return interface

    def reset(self):
        self.dataset_manager.reset()
