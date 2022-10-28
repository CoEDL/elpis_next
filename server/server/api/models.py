from flask import Blueprint
from flask import current_app as app

model_bp = Blueprint("model_bp", __name__, url_prefix="/models")


@model_bp.route("/", methods=["GET"])
def get_models():
    return ""


@model_bp.route("/", methods=["POST"])
def create_model():
    return ""


@model_bp.route("/", methods=["DELETE"])
def delete_model():
    return ""


@model_bp.route("/train", methods=["GET"])
def train_model():
    return ""


@model_bp.route("/status", methods=["GET"])
def get_model_status():
    return ""


@model_bp.route("/save", methods=["GET"])
def save_model():
    return ""


@model_bp.route("/evaluate", methods=["GET"])
def evaluate_model():
    return ""


@model_bp.route("/upload", methods=["POST"])
def upload_model():
    return ""


@model_bp.route("/download", methods=["GET"])
def download_model():
    return ""
