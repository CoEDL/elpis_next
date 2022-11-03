import json
import os
import shutil
from functools import wraps
from http import HTTPStatus
from pathlib import Path
from typing import Callable

from elpis.trainer import TrainingJob, TrainingOptions, TrainingStatus
from elpis.trainer.job import BASE_MODEL, SAMPLING_RATE
from flask import Blueprint, Response
from flask import current_app as app
from flask import jsonify, request, send_file
from humps.main import decamelize
from loguru import logger
from werkzeug.utils import secure_filename

from server.api.utils import bad_request
from server.interface import Interface
from server.managers.dataset_manager import FolderType

model_bp = Blueprint("model_bp", __name__, url_prefix="/models")

TEMP_DIR = Path("/tmp")


def requires_model(route: Callable[[str], Response]) -> Callable[[str], Response]:
    """Decorator which checks that the required model name is present on the
    request and exists in the model_manager.
    """

    @wraps(route)
    def function_wrapper(model_name: str) -> Response:
        if not model_name:
            return bad_request("Missing model name.")

        interface = Interface.from_app(app)
        manager = interface.model_manager

        if model_name not in manager.models:
            return Response("Model doesn't exist", status=HTTPStatus.NOT_FOUND)

        return route(model_name)

    return function_wrapper  # type: ignore


@model_bp.route("/", methods=["GET"])
def get_models():
    interface = Interface.from_app(app)
    models = [model for (_, model) in interface.model_manager.models.items()]
    data = [model.to_dict() for model in models]

    return jsonify({"models": data})


@model_bp.route("/", methods=["POST"])
def create_model():
    form = dict(request.form)

    model_name = form.get("modelName")
    dataset_name = form.get("datasetName")
    options = form.get("options")
    base_model = form.get("baseModel", BASE_MODEL)
    sampling_rate = int(form.get("samplingRate", SAMPLING_RATE))

    # Check required options
    if model_name is None:
        return bad_request("Missing model name.")
    if dataset_name is None:
        return bad_request("Missing dataset name.")
    if options is None:
        return bad_request("Missing training options.")

    # Attempt to convert from json
    try:
        options = TrainingOptions.from_dict(decamelize(json.loads(options)))
    except:
        return bad_request(f"Error deserializing training options: {options}")

    interface = Interface.from_app(app)
    manager = interface.model_manager

    # Build and add our model
    job = TrainingJob(
        model_name=model_name,
        dataset_name=dataset_name,
        options=options,
        base_model=base_model,
        sampling_rate=sampling_rate,
    )

    manager.add_job(job)
    return Response(status=HTTPStatus.NO_CONTENT)


@model_bp.route("/<model_name>", methods=["DELETE"])
@requires_model
def delete_model(model_name: str):
    interface = Interface.from_app(app)
    interface.model_manager.delete_model(model_name)
    return Response(status=HTTPStatus.NO_CONTENT)


@model_bp.route("/train/<model_name>", methods=["GET"])
@requires_model
def train_model(model_name: str):
    interface = Interface.from_app(app)
    job = interface.model_manager.models[model_name]

    processed_path = interface.dataset_manager.dataset_folder(
        job.dataset_name, FolderType.Processed
    )
    interface.model_manager.train(model_name, processed_path)
    return Response(status=HTTPStatus.NO_CONTENT)


@model_bp.route("/status/<model_name>", methods=["GET"])
@requires_model
def get_model_status(model_name: str):
    interface = Interface.from_app(app)
    status = interface.model_manager.status(model_name)
    if status is None:
        return Response("Missing model.", status=HTTPStatus.NOT_FOUND)

    return jsonify({"status": status.value})


@model_bp.route("/save/<model_name>", methods=["GET"])
@requires_model
def save_model(model_name: str):
    interface = Interface.from_app(app)
    interface.model_manager.upload_to_hugging_face_hub(model_name)

    return Response(status=HTTPStatus.NO_CONTENT)


@model_bp.route("/evaluate/<model_name>", methods=["GET"])
def evaluate_model(model_name: str):
    return ""


@model_bp.route("/upload", methods=["POST"])
def upload_model():
    logger.info("Upload endpoint started")
    interface = Interface.from_app(app)
    manager = interface.model_manager

    # Save files to model directory
    zip_file = request.files.getlist("file")[0]
    filename = secure_filename(str(zip_file.filename))

    if filename == "" or Path(filename).suffix != ".zip":
        return bad_request("Invalid filename or not a zip-file")

    zip_path = TEMP_DIR / filename
    zip_path.parent.mkdir(parents=True, exist_ok=True)
    logger.info(f"Saving the zipped model at {zip_path}")
    zip_file.save(zip_path)

    model_name = Path(filename).stem
    model_folder = manager.model_folder(model_name)
    model_folder.mkdir(parents=True, exist_ok=True)
    shutil.unpack_archive(zip_path, manager.model_folder(model_name))

    os.remove(zip_path)
    logger.info(f"Zipped model was unpacked and deleted")

    # Attempts to unpack a zip file if when unzipped, it resolves to a single directory.
    folder_path = model_folder / model_name
    if folder_path.exists and folder_path.is_dir():
        for file in os.listdir(folder_path):
            (folder_path / file).rename(folder_path.parent / file)
        folder_path.rmdir()

    # Create a dummy job to add
    job = TrainingJob(
        model_name=model_name,
        dataset_name="",
        options=TrainingOptions(),
        status=TrainingStatus.FINISHED,
    )
    manager.add_job(job)

    return Response(status=HTTPStatus.NO_CONTENT)


@model_bp.route("/download/<model_name>", methods=["GET"])
@requires_model
def download_model(model_name: str):
    interface = Interface.from_app(app)
    manager = interface.model_manager

    if manager.status(model_name) != TrainingStatus.FINISHED:
        return bad_request(f"Model {model_name} hasn't finished training!")

    zipped_model_path = TEMP_DIR / "model.zip"
    zipped_model_path.parent.mkdir(exist_ok=True, parents=True)
    logger.info(f"Creating zipped model at path: {zipped_model_path}")

    shutil.make_archive(
        str(zipped_model_path.parent / zipped_model_path.stem),
        "zip",
        manager.model_folder(model_name),
    )
    logger.info(f"Zipped model created at path: {zipped_model_path}")

    return send_file(zipped_model_path, as_attachment=True)
