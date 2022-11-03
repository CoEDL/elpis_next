import shutil
from functools import wraps
from http import HTTPStatus
from pathlib import Path
from typing import Callable

from flask import Blueprint, Response
from flask import current_app as app
from flask import jsonify, request, send_file
from werkzeug.utils import secure_filename

from server.api.utils import bad_request
from server.interface import Interface

transcribe_bp = Blueprint("transcribe_bp", __name__, url_prefix="/transcribe")


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


@transcribe_bp.route("/", methods=["POST"])
def transcribe():
    files = request.files.getlist("file")
    if len(files) == 0:
        return bad_request("Missing audio files")

    form = dict(request.form)
    model_location = form.get("modelLocation")
    if model_location is None:
        return bad_request("Missing pretrained model location.")

    interface = Interface.from_app(app)
    manager = interface.transcription_manager

    for audio_file in files:
        file_name = secure_filename(str(audio_file.filename))
        folder = manager.transcription_folder(model_location, Path(file_name).stem)
        folder.mkdir(exist_ok=True, parents=True)
        # Save raw
        audio_path = folder / file_name
        audio_file.save(audio_path)

        # Transcribe
        manager.transcribe(model_location, audio_path)

    return Response(status=HTTPStatus.NO_CONTENT)


@transcribe_bp.route("/status/<model_location>/<audio_name>", methods=["GET"])
@requires_model_and_audio
def get_transcription_status(model_location: str, audio_name: str):
    interface = Interface.from_app(app)
    manager = interface.transcription_manager
    return jsonify(completed=manager.has_completed(model_location, audio_name))


@transcribe_bp.route("/text/<model_location>/<audio_name>", methods=["GET"])
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


@transcribe_bp.route("/elan/<model_location>/<audio_name>", methods=["GET"])
@requires_model_and_audio
def get_elan(model_location: str, audio_name: str):
    interface = Interface.from_app(app)
    manager = interface.transcription_manager

    completed = manager.has_completed(model_location, audio_name)
    if not completed:
        return bad_request("Asked for elan before transcription finished")

    folder = manager.transcription_folder(model_location, audio_name)
    return send_file(folder / f"{audio_name}.eaf", as_attachment=True)


@transcribe_bp.route("/download", methods=["GET"])
def download():
    interface = Interface.from_app(app)
    manager = interface.transcription_manager

    if not manager.folder.exists:
        return Response("Empty transcription folder", status=HTTPStatus.NOT_FOUND)

    # TODO standardize tmp folders
    zip_path = Path("/tmp") / "transcriptions.zip"
    shutil.make_archive(str(zip_path.parent / zip_path.stem), "zip", manager.folder)

    return send_file(zip_path, as_attachment=True)
