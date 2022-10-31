import json
import shutil
from enum import Enum
from pathlib import Path
from typing import Any, Dict

from elpis.datasets.dataset import Dataset
from elpis.datasets.preprocessing import process_batch
from typing_extensions import override

from server.managers.manager import Manager, ManagerType, auto_save


class FolderType(Enum):
    Raw = "raw"
    Processed = "processed"


class DatasetManager(Manager):

    _datasets: Dict[str, Dataset] = {}

    def __init__(self, data_dir: Path, overwrite: bool = False) -> None:
        super().__init__(ManagerType.DATASET.value, data_dir, overwrite)

    def __contains__(self, name: str) -> bool:
        return name in self.datasets

    @property
    def datasets(self) -> Dict[str, Dataset]:
        return DatasetManager._datasets

    @datasets.setter
    def datasets(self, value: Dict[str, Dataset]):
        DatasetManager._datasets = value

    @override
    def serialize(self):
        return {dataset.name: dataset.to_dict() for dataset in self._datasets.values()}

    @override
    def load_state(self, state_file: Path) -> None:
        with open(state_file) as state:
            raw_datasets: Dict[str, Dict[str, Any]] = json.load(state)

        self.datasets = {
            name: Dataset.from_dict(dataset) for (name, dataset) in raw_datasets.items()
        }

    @override
    def clean(self) -> None:
        return super().clean()

    @override
    def reset(self) -> None:
        return super().reset()

    def dataset_folder(self, name: str, folder_type: FolderType) -> Path:
        return self.folder / name / folder_type.value

    @auto_save
    def add_dataset(self, dataset: Dataset, overwrite=True) -> None:
        if overwrite and dataset.name in self:
            return

        # Make sure folders exist
        raw_folder = self.dataset_folder(dataset.name, FolderType.Raw)
        processed_folder = self.dataset_folder(dataset.name, FolderType.Processed)
        for folder in [raw_folder, processed_folder]:
            folder.mkdir(exist_ok=True, parents=True)

        # Copy files if needed
        for file in dataset.files:
            if file.parent != raw_folder:
                shutil.copy2(file, raw_folder)

        # Update dataset paths
        raw_files = list(map(lambda file: raw_folder / file.name, dataset.files))
        dataset.files = raw_files

        # Preprocessing
        batches = dataset.to_batches()
        for batch in batches:
            process_batch(batch=batch, output_dir=processed_folder)

        self.datasets[dataset.name] = dataset

    @auto_save
    def delete_dataset(self, name: str) -> None:
        folder = self.folder / name
        if folder.exists() and folder.is_dir():
            shutil.rmtree(folder)

        if name in self.datasets:
            self.datasets.pop(name)
