import os
from pathlib import Path

import pytest
from elpis.datasets import Dataset
from elpis.datasets.dataset import CleaningOptions, ElanOptions
from elpis.models import ElanTierSelector

from server.managers import DatasetManager
from server.managers.dataset_manager import FolderType
from server.managers.manager import ManagerType

TEST_DATA_DIR = Path(__file__).parent.parent / "data"
ABUI_DIR = TEST_DATA_DIR / "abui"
ABUI_FILES = [ABUI_DIR / name for name in os.listdir(ABUI_DIR)]


@pytest.fixture()
def manager(tmp_path: Path) -> DatasetManager:
    return DatasetManager(tmp_path)


@pytest.fixture()
def dataset() -> Dataset:
    return Dataset(
        name="test",
        files=ABUI_FILES,
        cleaning_options=CleaningOptions(),
        elan_options=ElanOptions(ElanTierSelector.NAME, "Phrase"),
    )


def test_folders(tmp_path: Path):
    manager = DatasetManager(tmp_path)
    assert manager.data_dir == tmp_path
    assert manager.folder == tmp_path / ManagerType.DATASET.value


def test_dataset_manager_with_empty_dir_has_no_datasets(manager: DatasetManager):
    assert len(manager.datasets) == 0


def test_add_dataset(manager: DatasetManager, dataset: Dataset):
    manager.add_dataset(dataset)
    assert len(manager.datasets) == 1
    assert dataset.name in manager.datasets

    assert manager.state_file.exists()

    raw_folder = manager.dataset_folder(dataset.name, FolderType.Raw)
    assert raw_folder.exists()
    assert len(os.listdir(raw_folder)) == len(ABUI_FILES)

    processed_folder = manager.dataset_folder(dataset.name, FolderType.Processed)
    assert processed_folder.exists
    assert len(os.listdir(processed_folder)) >= len(ABUI_FILES)


def test_dataset_managers_share_state(
    tmp_path: Path, manager: DatasetManager, dataset: Dataset
):
    manager.add_dataset(dataset)
    other_manager = DatasetManager(tmp_path)
    assert manager.datasets == other_manager.datasets

    other_manager.delete_dataset(dataset.name)
    assert len(manager.datasets) == 0
    assert len(other_manager.datasets) == 0
