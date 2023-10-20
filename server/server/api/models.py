import json
import os
import shutil
from functools import wraps
from http import HTTPStatus
from pathlib import Path
from typing import Any, Callable, Dict, Optional

from elpis.models import DataArguments, Job, ModelArguments
from flask import Blueprint, Response
from flask import current_app as app
from flask import jsonify, request, send_file
from humps.main import camelize, decamelize
from loguru import logger
from transformers import TrainingArguments
from werkzeug.utils import secure_filename

from server.api.utils import bad_request
from server.interface import Interface
from server.managers.dataset_manager import FolderType
from server.named_job import JobStatus, NamedJob

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
    data = camelize([model.to_dict() for model in models])
    return jsonify(data)


@model_bp.route("/", methods=["POST"])
def create_model():
    data = request.get_json(silent=True)
    if data is None:
        return bad_request("Request not json.")

    data = decamelize(data)
    logger.info(f"Request Data: {data}")
    if not isinstance(data, dict):
        return bad_request("Request data should be a dictionary.")

    interface = Interface.from_app(app)

    error = validate_raw_model(interface, data)
    if error is not None:
        return bad_request(error)

    data = correct_raw_model(interface, data)

    try:
        job = NamedJob.from_dict(data)
    except Exception as e:
        logger.error(e)
        return bad_request("Failed to deserialize model")

    interface.model_manager.add_job(job)
    return Response(status=HTTPStatus.NO_CONTENT)


def validate_raw_model(interface: Interface, data: Dict[str, Any]) -> Optional[str]:
    """Returns the string of the error, if encountered, else None."""

    required_fields = "name", "job"
    for field in required_fields:
        if field not in data:
            return f"Missing `{field}` in data"

    # Check local dataset exists
    if data.get("is_dataset_local"):
        job = data.get("job", {})
        dataset_name: str = job.get("dataset_name_or_path", "")

        if dataset_name not in interface.dataset_manager:
            return f"Couldn't find dataset: {dataset_name}."


def correct_raw_model(interface: Interface, data: Dict[str, Any]) -> Dict[str, Any]:
    """Adds some extra information to the raw incoming model for it to
    play nicely with the model and dataset managers.

    Injects the model dir and dataset dirs if necessary.
    """
    # Resolve local datasets
    if data.get("is_dataset_local"):
        dataset_name: str = data["job"]["dataset_name_or_path"]
        dataset_folder = str(
            interface.dataset_manager.dataset_folder(
                dataset_name, FolderType.Processed
            ).absolute()
        )
        data["job"]["dataset_name_or_path"] = dataset_folder

        # Correct text and audio columns
        data["job"]["text_column_name"] = "transcript"
        data["job"]["audio_column_name"] = "audio"

    # Add would-be model dir to job
    model_dir = interface.model_manager.model_folder(data["name"])
    data["job"]["output_dir"] = str(model_dir.absolute())

    return data


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
    interface.model_manager.train(model_name)
    return Response(status=HTTPStatus.NO_CONTENT)


@model_bp.route("/logs/<model_name>", methods=["GET"])
@requires_model
def get_model_logs(model_name: str):
    interface = Interface.from_app(app)

    status = interface.model_manager.status(model_name)
    if status is None:
        return Response("Missing model.", status=HTTPStatus.NOT_FOUND)

    log_file = interface.model_manager.logs_path(model_name)
    if not log_file.exists():
        return Response("No logs found for training job.", status=HTTPStatus.NOT_FOUND)

    return send_file(log_file, as_attachment=True)


@model_bp.route("/status/<model_name>", methods=["GET"])
@requires_model
def get_model_status(model_name: str):
    interface = Interface.from_app(app)
    status = interface.model_manager.status(model_name)
    if status is None:
        return Response("Missing model.", status=HTTPStatus.NOT_FOUND)

    return jsonify(status.value)


@model_bp.route("/save/<model_name>", methods=["GET"])
@requires_model
def save_model(model_name: str):
    interface = Interface.from_app(app)
    interface.model_manager.upload_to_hugging_face_hub(model_name)

    return Response(status=HTTPStatus.NO_CONTENT)


@model_bp.route("/evaluate/<model_name>", methods=["GET"])
def evaluate_model(model_name: str):
    interface = Interface.from_app(app)

    status = interface.model_manager.status(model_name)
    if status is None:
        return Response("Missing model.", status=HTTPStatus.NOT_FOUND)

    if status is not JobStatus.FINISHED:
        return Response("Model not finished training.", status=HTTPStatus.NOT_FOUND)

    # Pull out the evaluation results file
    folder = interface.model_manager.model_folder(model_name)
    file_name = "eval_results.json"
    results = folder / file_name

    if not results.exists():
        return Response(
            f"Error locating {file_name} within model folder.",
            status=HTTPStatus.NOT_FOUND,
        )

    with open(results) as results_file:
        return jsonify(json.load(results_file))


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
    # TODO should save Job args in model folder when training.
    job = NamedJob(
        name=model_name,
        job=Job(
            ModelArguments(str(model_folder)),
            DataArguments(""),
            TrainingArguments(str(model_folder)),
        ),
        status=JobStatus.FINISHED,
    )
    manager.add_job(job)

    return Response(status=HTTPStatus.NO_CONTENT)


@model_bp.route("/download/<model_name>", methods=["GET"])
@requires_model
def download_model(model_name: str):
    interface = Interface.from_app(app)
    manager = interface.model_manager

    if manager.status(model_name) != JobStatus.FINISHED:
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
