from flask import Blueprint

from server.api.datasets import dataset_bp
from server.api.models import model_bp
from server.api.transcribe import transcribe_bp

api_bp = Blueprint("api_bp", __name__, url_prefix="/api")

for bp in dataset_bp, model_bp, transcribe_bp:
    api_bp.register_blueprint(bp)
