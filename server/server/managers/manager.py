import json
import shutil
from abc import ABC, abstractmethod
from enum import Enum
from functools import wraps
from pathlib import Path
from typing import Any


def auto_save(func):
    @wraps(func)
    def function_wrapper(self, *args, **kwargs):
        result = func(self, *args, **kwargs)
        if self.save:
            self.save()
        return result

    return function_wrapper


class ManagerType(Enum):
    DATASET = "datasets"
    MODEL = "models"
    TRANSCRIPTION = "transcriptions"


class Manager(ABC):
    """A manager handles operations over its child data type"""

    def __init__(self, name: str, data_dir: Path, overwrite: bool = False) -> None:
        self.name = name
        self.data_dir = data_dir
        self.data_dir.mkdir(parents=True, exist_ok=True)

        if not overwrite and self.state_file.exists():
            self.load_state(self.state_file)

    @property
    def state_file(self) -> Path:
        return self.data_dir / (self.name + ".json")

    @property
    def folder(self) -> Path:
        return self.data_dir / self.name

    @property
    def cache(self) -> Path:
        return self.data_dir / "cache"

    @abstractmethod
    def serialize(self) -> Any:
        ...

    @abstractmethod
    def load_state(self, state_file: Path) -> None:
        ...

    def save(self) -> None:
        with open(self.state_file, "w") as state_file:
            json.dump(self.serialize(), state_file)

    @abstractmethod
    def reset(self) -> None:
        if self.folder.exists() and self.folder.is_dir():
            shutil.rmtree(self.folder)
