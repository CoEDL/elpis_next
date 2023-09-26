import json
import shutil
from pathlib import Path
from typing import Any, Dict, Optional

from elpis.trainer import run_job
from loguru import logger
from typing_extensions import override

from server.managers.manager import Manager, ManagerType, auto_save
from server.named_job import JobStatus, NamedJob

LOGS_FILE = "logs.txt"


class ModelManager(Manager):
    _models: Dict[str, NamedJob] = {}

    def __init__(
        self,
        data_dir: Path,
        overwrite: bool = False,
    ) -> None:
        super().__init__(ManagerType.MODEL.value, data_dir, overwrite)

    def __contains__(self, model_name: str) -> bool:
        return model_name in self.models

    @property
    def models(self) -> Dict[str, NamedJob]:
        return ModelManager._models

    @models.setter
    def models(self, value: Dict[str, NamedJob]):
        ModelManager._models = value

    @override
    def serialize(self):
        return {job.name: job.to_dict() for job in self.models.values()}

    @override
    def load_state(self, state_file: Path) -> None:
        with open(state_file) as state:
            raw_models: Dict[str, Dict[str, Any]] = json.load(state)

        self.models = {
            name: NamedJob.from_dict(job) for (name, job) in raw_models.items()
        }

    @override
    def reset(self) -> None:
        super().reset()
        self.models = {}

    def model_folder(self, model_name: str) -> Path:
        return self.folder / model_name

    def logs_path(self, model_name: str) -> Path:
        return self.model_folder(model_name) / LOGS_FILE

    @auto_save
    def add_job(self, job: NamedJob, overwrite=True) -> None:
        if overwrite and job.name in self:
            return

        # Make sure folders exist
        self.model_folder(job.name).mkdir(exist_ok=True, parents=True)
        self.models[job.name] = job

    @auto_save
    def delete_model(self, model_name: str) -> None:
        folder = self.model_folder(model_name)
        if folder.exists() and folder.is_dir():
            shutil.rmtree(folder)

        if model_name in self.models:
            self.models.pop(model_name)

    @auto_save
    def train(self, model_name: str) -> None:
        if model_name not in self.models:
            return

        job = self.models[model_name]
        if job.status == JobStatus.TRAINING:
            logger.info(f"Model: {model_name} is already training!")
            return

        try:
            logger.info(f"Begin training model: {model_name}")
            job.status = JobStatus.TRAINING
            run_job(
                job=job.job,
                log_file=self.logs_path(model_name),
            )
        except Exception as e:
            logger.error(f"Error training model: {model_name}")
            logger.error(f"Error: {e}")
            job.status = JobStatus.ERROR
            return

        logger.success(f"Finished training model: {model_name}")
        job.status = JobStatus.FINISHED

    def status(self, model_name: str) -> Optional[JobStatus]:
        if model_name not in self.models:
            return None

        return self.models[model_name].status

    def upload_to_hugging_face_hub(self, model_name: str) -> None:
        ...
