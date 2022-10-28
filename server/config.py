"""Flask configuration."""
import os
from pathlib import Path

from server.interface import Interface

BASE_FOLDER = Path(__file__).parent
DEFAULT_DATA_DIR = BASE_FOLDER / "data"


class Config:
    """Base config."""

    SECRET_KEY = os.environ.get("SECRET_KEY")
    STATIC_FOLDER = "static"
    TEMPLATES_FOLDER = "templates"
    DATA_DIR = Path(os.environ.get("DATA_DIR", DEFAULT_DATA_DIR))
    INTERFACE = Interface(DATA_DIR)


class ProdConfig(Config):
    FLASK_ENV = "production"
    DEBUG = False
    TESTING = False


class DevConfig(Config):
    FLASK_ENV = "development"
    DEBUG = True
    TESTING = True
