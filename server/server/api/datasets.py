import json
from http import HTTPStatus
from pathlib import Path
from typing import List

from elpis.datasets import Dataset
from elpis.datasets.dataset import CleaningOptions, ElanOptions
from flask import Blueprint, Response
from flask import current_app as app
from flask import jsonify, request
from humps.main import camelize, decamelize
from loguru import logger
from werkzeug.utils import secure_filename

from server.api.utils import bad_request
from server.interface import Interface
from server.managers.dataset_manager import FolderType

dataset_bp = Blueprint("dataset_bp", __name__, url_prefix="/datasets")


@dataset_bp.route("/", methods=["GET"])
def get_datasets():
    interface = Interface.from_app(app)
    datasets = interface.dataset_manager.serialize()
    data = camelize([dataset for dataset in datasets.values()])
    return jsonify(data)


@dataset_bp.route("/<dataset_name>", methods=["GET"])
def get_dataset(dataset_name: str):
    interface = Interface.from_app(app)
    manager = interface.dataset_manager

    if not dataset_name:
        return bad_request("Missing dataset name")

    if (dataset_name) not in manager.datasets:
        return Response("Dataset not found", status=HTTPStatus.NOT_FOUND)

    return jsonify({"dataset": manager.datasets[dataset_name]})


@dataset_bp.route("/", methods=["POST"])
def create_dataset():
    if "file" not in request.files:
        logger.error("Missing files in request")
        return Response("Missing files", status=HTTPStatus.BAD_REQUEST)

    files = request.files.getlist("file")
    names = [secure_filename(str(file.filename)) for file in files]

    form = dict(request.form)
    dataset_name = form.get("name")
    cleaning_options = form.get("cleaningOptions")
    elan_options = form.get("elanOptions")

    # Check required options
    if dataset_name is None:
        return bad_request("Missing dataset name.")
    if cleaning_options is None:
        return bad_request("Missing cleaning options.")

    # Attempt to convert from json
    try:
        cleaning_options = CleaningOptions.from_dict(
            decamelize(json.loads(cleaning_options))
        )
        if elan_options is not None:
            elan_options = ElanOptions.from_dict(decamelize(json.loads(elan_options)))
    except:
        return bad_request("Error deserializing options")

    # Copy all files to dataset folder
    interface = Interface.from_app(app)
    manager = interface.dataset_manager

    raw_folder = manager.dataset_folder(dataset_name, FolderType.Raw)
    raw_folder.mkdir(parents=True, exist_ok=True)

    raw_files: List[Path] = []
    for data_file, name in zip(files, names):
        path = raw_folder / name
        data_file.save(path)
        raw_files.append(path)

    # Build and add our dataset
    dataset = Dataset(
        name=dataset_name,
        files=raw_files,
        cleaning_options=cleaning_options,
        elan_options=elan_options,
    )

    if not dataset.is_valid():
        return bad_request("Dataset Invalid")

    manager.add_dataset(dataset=dataset)
    return Response(status=HTTPStatus.NO_CONTENT)


@dataset_bp.route("/<dataset_name>", methods=["DELETE"])
def delete_dataset(dataset_name: str):
    interface = Interface.from_app(app)
    manager = interface.dataset_manager

    if not dataset_name:
        return bad_request("Missing dataset name")

    if (dataset_name) not in manager.datasets:
        return Response(status=HTTPStatus.NOT_FOUND)

    manager.delete_dataset(dataset_name)
    return Response(status=HTTPStatus.NO_CONTENT)
