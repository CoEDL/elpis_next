import shutil
from functools import wraps
from http import HTTPStatus
from pathlib import Path
from typing import Callable

from flask import Blueprint, Response
from flask import current_app as app
from flask import jsonify, request, send_file
from humps.main import camelize
from loguru import logger
from werkzeug.utils import secure_filename

from server.api.utils import bad_request
from server.interface import Interface

transcription_bp = Blueprint("transcription_bp", __name__, url_prefix="/transcriptions")


def requires_model_and_audio(
    route: Callable[[str, str], Response]
) -> Callable[[str, str], Response]:
    """Decorator which checks that the required model location and audio name
    are preset on the request.
    """

    @wraps(route)
    def function_wrapper(model_location: str, audio_name: str) -> Response:
        if not model_location:
            return bad_request("Missing pretrained model location.")

        if not audio_name:
            return bad_request("Missing audio name.")

        return route(model_location, audio_name)

    return function_wrapper  # type: ignore


@transcription_bp.route("/", methods=["GET"])
def get_transcriptions():
    interface = Interface.from_app(app)
    transcription_manager = interface.transcription_manager
    return jsonify(transcription_manager.transcriptions.keys())


@transcription_bp.route("/", methods=["POST"])
def create_transcription_jobs():
    files = request.files.getlist("file")
    if len(files) == 0:
        return bad_request("Missing audio files")

    form = dict(request.form)
    model_location = form.get("modelLocation")
    if model_location is None:
        return bad_request("Missing pretrained model location.")

    logger.info(model_location)
    interface = Interface.from_app(app)
    model_manager = interface.model_manager
    transcription_manager = interface.transcription_manager

    # Convert to path if it's a local model
    is_local = False
    if model_location in model_manager.models:
        is_local = True
        model_location = str(model_manager.model_folder(model_location))

    for audio_file in files:
        file_name = secure_filename(str(audio_file.filename))
        folder = transcription_manager.transcription_folder(
            model_location, Path(file_name).stem
        )
        folder.mkdir(exist_ok=True, parents=True)
        # Save raw audio
        audio_path = folder / file_name
        audio_file.save(audio_path)

        transcription_manager.add_transcription_job(
            model_location, audio_path, is_local
        )

    return Response(status=HTTPStatus.NO_CONTENT)


@transcription_bp.route(
    "/transcribe/<model_location>/<audio_name>", methods=["GET", "POST"]
)
@requires_model_and_audio
def transcribe(model_location: str, audio_name: str):
    interface = Interface.from_app(app)
    manager = interface.transcription_manager
    if (model_location, audio_name) not in manager.transcriptions:
        return bad_request("Model Location and Audio name pair not found.")

    manager.transcribe(model_location, audio_name)
    return Response(status=HTTPStatus.NO_CONTENT)


@transcription_bp.route("/status/<model_location>/<audio_name>", methods=["GET"])
@requires_model_and_audio
def get_transcription_status(model_location: str, audio_name: str):
    interface = Interface.from_app(app)
    manager = interface.transcription_manager
    return jsonify(completed=manager.has_completed(model_location, audio_name))


@transcription_bp.route("/text/<model_location>/<audio_name>", methods=["GET"])
@requires_model_and_audio
def get_text(model_location: str, audio_name: str):
    interface = Interface.from_app(app)
    manager = interface.transcription_manager

    completed = manager.has_completed(model_location, audio_name)
    if not completed:
        return bad_request("Asked for text before transcription finished")

    folder = manager.transcription_folder(model_location, audio_name)
    with open(folder / f"{audio_name}.txt") as text_file:
        text = text_file.read()

    return jsonify(text=text)


@transcription_bp.route("/elan/<model_location>/<audio_name>", methods=["GET"])
@requires_model_and_audio
def get_elan(model_location: str, audio_name: str):
    interface = Interface.from_app(app)
    manager = interface.transcription_manager

    completed = manager.has_completed(model_location, audio_name)
    if not completed:
        return bad_request("Asked for elan before transcription finished")

    folder = manager.transcription_folder(model_location, audio_name)
    return send_file(folder / f"{audio_name}.eaf", as_attachment=True)


@transcription_bp.route("/download", methods=["GET"])
def download():
    interface = Interface.from_app(app)
    manager = interface.transcription_manager

    if not manager.folder.exists:
        return Response("Empty transcription folder", status=HTTPStatus.NOT_FOUND)

    # TODO standardize tmp folders
    zip_path = Path("/tmp") / "transcriptions.zip"
    shutil.make_archive(str(zip_path.parent / zip_path.stem), "zip", manager.folder)

    return send_file(zip_path, as_attachment=True)
