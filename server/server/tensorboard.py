from flask import Flask
from loguru import logger
from tensorboard.program import TensorBoard
from werkzeug.serving import is_running_from_reloader

from server.interface import Interface

HOST = "0.0.0.0"
DEFAULT_TENSORBOARD_PORT = "6006"
RUNNING = "tensorboard_running"


def setup_tensorboard(app: Flask) -> None:
    interface = Interface.from_app(app)
    model_dir = interface.model_manager.folder

    if _is_running(app):
        logger.info("Tensorboard already running!")
        return

    logger.info("Starting tensorboard")
    tensorboard = TensorBoard()
    tensorboard.configure(
        argv=[
            "tensorboard",
            f"--logdir={model_dir}",
            f"--port={app.config.get('TENSORBOARD_PORT', DEFAULT_TENSORBOARD_PORT)}",
            f"--host={HOST}",
        ]
    )
    url = tensorboard.launch()
    logger.info(f"Tensorboard running on {url}")


def _is_running(app: Flask) -> bool:
    return is_running_from_reloader()
