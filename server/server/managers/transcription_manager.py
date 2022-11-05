from __future__ import annotations

import base64
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from elpis.transcriber.results import build_elan, build_text
from elpis.transcriber.transcribe import build_pipeline, transcribe
from loguru import logger
from transformers import AutomaticSpeechRecognitionPipeline as ASRPipeline
from typing_extensions import override

from server.managers import Manager
from server.managers.manager import Manager, ManagerType, auto_save


class TranscriptionManager(Manager):
    _transcriptions: Dict[Tuple[str, str], Path] = {}

    def __init__(
        self,
        data_dir: Path,
        overwrite: bool = False,
    ) -> None:
        super().__init__(ManagerType.TRANSCRIPTION.value, data_dir, overwrite)
        self._pipelines: Dict[str, ASRPipeline] = {}

    @property
    def transcriptions(self) -> Dict[Tuple[str, str], Path]:
        return TranscriptionManager._transcriptions

    @transcriptions.setter
    def transcriptions(self, value: Dict[Tuple[str, str], Path]):
        TranscriptionManager._transcriptions = value

    @override
    def serialize(self) -> List[Dict[str, str]]:
        return [
            TranscriptionJob(model_location, audio_name, path).to_dict()
            for ((model_location, audio_name), path) in self.transcriptions.items()
        ]

    @override
    def load_state(self, state_file: Path) -> None:
        with open(state_file) as state:
            jobs: List[TranscriptionJob] = [
                TranscriptionJob.from_dict(job) for job in json.load(state)
            ]

        result = {}
        for job in jobs:
            result[(job.model_location, job.audio_name)] = job.path

        self.transcriptions = result

    @override
    def reset(self) -> None:
        super().reset()
        self._pipelines = {}
        self._transcriptions = {}

    def transcription_folder(
        self, model_location: str, audio_name: str, is_local: bool = True
    ) -> Path:
        # HF models have forwardslashes, let's standardize the folder paths.
        if not is_local:
            model_location = base64.b64encode(model_location.encode()).decode()

        return self.folder / model_location / audio_name

    def add_transcription_job(
        self, model_location: str, audio_file: Path, is_local: bool = True
    ) -> None:
        folder = self.transcription_folder(model_location, audio_file.stem, is_local)
        self.transcriptions[(model_location, audio_file.stem)] = folder

    def has_completed(self, model_location: str, audio_name: str) -> bool:
        key = (model_location, audio_name)
        if key not in self.transcriptions:
            return False

        folder = self.transcriptions[key]
        text_file = folder / f"{audio_name}.txt"
        elan_file = folder / f"{audio_name}.eaf"
        return text_file.exists() and elan_file.exists()

    @auto_save
    def transcribe(self, model_location: str, audio_name: str) -> None:
        key = (model_location, audio_name)
        if key not in self.transcriptions:
            logger.error(f"{key} not found in transcription jobs.")
            return

        if model_location in self._pipelines:
            logger.info("Using cached pipeline")
            asr = self._pipelines[model_location]
        else:
            logger.info("Building new pipeline")
            asr = build_pipeline(model_location)
            self._pipelines[model_location] = asr

        folder = self.transcriptions[key]
        audio_file = folder / (audio_name + ".wav")
        annotations = transcribe(audio_file, asr)

        # Build text file
        with open(folder / f"{audio_file.stem}.txt", "w") as text_file:
            text_file.write(build_text(annotations))

        # Build elan file
        build_elan(annotations).to_file(folder / f"{audio_file.stem}.eaf")


@dataclass
class TranscriptionJob:
    model_location: str
    audio_name: str
    path: Path

    def to_dict(self) -> Dict[str, str]:
        result = dict(self.__dict__)
        result["path"] = str(self.path)
        return result

    @classmethod
    def from_dict(cls, data: Dict[str, str]) -> TranscriptionJob:
        return cls(
            model_location=data["model_location"],
            audio_name=data["audio_name"],
            path=Path(data["path"]),
        )
