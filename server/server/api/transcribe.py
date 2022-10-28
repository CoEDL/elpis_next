from flask import Blueprint
from flask import current_app as app

transcribe_bp = Blueprint("transcribe_bp", __name__, url_prefix="/transcribe")


@transcribe_bp.route("/", methods=["POST"])
def transcribe():
    return ""


@transcribe_bp.route("/status", methods=["GET"])
def get_transcription_status():
    return ""


@transcribe_bp.route("/text", methods=["GET"])
def get_text():
    return ""


@transcribe_bp.route("/elan", methods=["GET"])
def get_elan():
    return ""
