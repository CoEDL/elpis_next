import json
import shutil
from pathlib import Path
from typing import Any, Dict, Optional

from elpis.trainer import TrainingJob, TrainingStatus, train
from loguru import logger
from typing_extensions import override

from server.managers.manager import Manager, ManagerType, auto_save


class ModelManager(Manager):

    _models: Dict[str, TrainingJob] = {}

    def __init__(
        self,
        data_dir: Path,
        overwrite: bool = False,
    ) -> None:
        super().__init__(ManagerType.MODEL.value, data_dir, overwrite)

    def __contains__(self, model_name: str) -> bool:
        return model_name in self.models

    @property
    def models(self) -> Dict[str, TrainingJob]:
        return ModelManager._models

    @models.setter
    def models(self, value: Dict[str, TrainingJob]):
        ModelManager._models = value

    @override
    def serialize(self):
        return {job.model_name: job.to_dict() for job in self.models.values()}

    @override
    def load_state(self, state_file: Path) -> None:
        with open(state_file) as state:
            raw_models: Dict[str, Dict[str, Any]] = json.load(state)

        self.models = {
            name: TrainingJob.from_dict(job) for (name, job) in raw_models.items()
        }

    @override
    def reset(self) -> None:
        super().reset()
        self.models = {}

    def model_folder(self, model_name: str) -> Path:
        return self.folder / model_name

    def logs_path(self, model_name: str) -> Path:
        return self.model_folder(model_name) / "logs.txt"

    @auto_save
    def add_job(self, job: TrainingJob, overwrite=True) -> None:
        if overwrite and job.model_name in self:
            return

        # Make sure folders exist
        self.model_folder(job.model_name).mkdir(exist_ok=True, parents=True)
        self.models[job.model_name] = job

    @auto_save
    def delete_model(self, model_name: str) -> None:
        folder = self.model_folder(model_name)
        if folder.exists() and folder.is_dir():
            shutil.rmtree(folder)

        if model_name in self.models:
            self.models.pop(model_name)

    @auto_save
    def train(self, model_name: str, processed_dataset_path: Path) -> None:
        if model_name not in self.models:
            return

        job = self.models[model_name]
        if job.status == TrainingStatus.TRAINING:
            logger.info(f"Model: {model_name} is already training!")
            return

        try:
            logger.info(f"Begin training model: {model_name}")
            job.status = TrainingStatus.TRAINING
            train(
                job,
                output_dir=self.model_folder(model_name),
                dataset_dir=processed_dataset_path,
                log_file=self.logs_path(model_name),
            )
        except:
            logger.error(f"Error in training model: {model_name}")
            job.status = TrainingStatus.ERROR
            return

        logger.success(f"Finished training model: {model_name}")
        job.status = TrainingStatus.FINISHED

    def status(self, model_name: str) -> Optional[TrainingStatus]:
        if model_name not in self.models:
            return None

        return self.models[model_name].status

    def upload_to_hugging_face_hub(self, model_name: str) -> None:
        ...
