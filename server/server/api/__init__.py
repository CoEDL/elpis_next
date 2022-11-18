from flask import Blueprint

from server.api.datasets import dataset_bp
from server.api.models import model_bp
from server.api.reset import reset_bp
from server.api.transcribe import transcription_bp

api_bp = Blueprint("api_bp", __name__, url_prefix="/api")

for bp in dataset_bp, model_bp, transcription_bp, reset_bp:
    api_bp.register_blueprint(bp)
