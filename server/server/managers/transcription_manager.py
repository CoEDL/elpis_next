from __future__ import annotations

import base64
import json
import shutil
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional

from elpis.transcriber.results import build_elan, build_text
from elpis.transcriber.transcribe import build_pipeline, transcribe
from loguru import logger
from transformers import AutomaticSpeechRecognitionPipeline as ASRPipeline
from typing_extensions import override

from server.managers import Manager
from server.managers.manager import Manager, ManagerType, auto_save


def transcription_key(model_location: str, audio_name: str) -> str:
    """Returns a unique key for a given model_location and audio_name"""
    return model_location + audio_name


class TranscriptionManager(Manager):
    _transcriptions: Dict[str, TranscriptionJob] = {}

    def __init__(
        self,
        data_dir: Path,
        models_dir: Path,
        overwrite: bool = False,
    ) -> None:
        super().__init__(ManagerType.TRANSCRIPTION.value, data_dir, overwrite)
        self._models_dir = models_dir
        self._pipelines: Dict[str, ASRPipeline] = {}

    @property
    def transcriptions(self):
        return TranscriptionManager._transcriptions

    @transcriptions.setter
    def transcriptions(self, value):
        TranscriptionManager._transcriptions = value

    @override
    def serialize(self) -> List[Dict[str, Any]]:
        return [job.to_dict() for job in self.transcriptions.values()]

    @override
    def load_state(self, state_file: Path) -> None:
        with open(state_file) as transcriptions:
            jobs = [
                TranscriptionJob.from_dict(data) for data in json.load(transcriptions)
            ]

        self.transcriptions = {job.key: job for job in jobs}

    @auto_save
    @override
    def reset(self) -> None:
        super().reset()
        self.transcriptions = {}
        self._pipelines = {}

    def get_transcription_job(
        self, model_location: str, audio_name: str
    ) -> Optional[TranscriptionJob]:
        key = transcription_key(model_location, audio_name)
        if key not in self.transcriptions:
            return
        return self.transcriptions[key]

    def transcription_folder(self, job: TranscriptionJob) -> Path:
        return job.transcription_folder(self.folder)

    @auto_save
    def add_transcription_job(self, job: TranscriptionJob) -> None:
        self.transcriptions[job.key] = job

    @auto_save
    def remove_job(self, job: TranscriptionJob) -> None:
        if job.key not in self.transcriptions:
            return

        self.transcriptions.pop(job.key)
        folder = self.transcription_folder(job)
        if folder.exists:
            shutil.rmtree(folder)

    def has_completed(self, model_location: str, audio_name: str) -> bool:
        job = self.get_transcription_job(model_location, audio_name)
        if job is None:
            return False

        folder = self.transcription_folder(job)
        text_file = folder / f"{audio_name}.txt"
        elan_file = folder / f"{audio_name}.eaf"
        return text_file.exists() and elan_file.exists()

    @auto_save
    def transcribe(
        self, model_location: str, audio_name: str
    ) -> Optional[TranscriptionStatus]:
        job = self.get_transcription_job(model_location, audio_name)
        if job is None:
            logger.error(
                f"{model_location} - {audio_name} not found in transcription jobs."
            )
            return

        if job.status == TranscriptionStatus.TRANSCRIBING:
            logger.error(f"Attempted to transcribe a job which is already in progress")
            return

        try:
            self._transcribe_job(job)
        except Exception as e:
            job.status = TranscriptionStatus.ERROR
            logger.error(e)

        return job.status

    def _transcribe_job(self, job: TranscriptionJob):
        if job.model_location in self._pipelines:
            logger.info("Using cached pipeline")
            asr = self._pipelines[job.model_location]
        else:
            logger.info("Building new pipeline")

            # Prefix local models with the path to their directory
            safe_model_location = job.model_location
            if job.is_local:
                safe_model_location = str(self._models_dir / job.model_location)

            asr = build_pipeline(safe_model_location, cache_dir=self.cache)
            self._pipelines[job.model_location] = asr

        folder = self.transcription_folder(job)
        audio_file = folder / (job.audio_name + ".wav")
        annotations = transcribe(audio_file, asr)

        # Build text file
        with open(folder / f"{job.audio_name}.txt", "w") as text_file:
            text_file.write(build_text(annotations))

        # Build elan file
        build_elan(annotations).to_file(folder / f"{job.audio_name}.eaf")
        job.status = TranscriptionStatus.FINISHED


class TranscriptionStatus(Enum):
    WAITING = "waiting"
    TRANSCRIBING = "transcribing"
    FINISHED = "finished"
    ERROR = "error"


@dataclass
class TranscriptionJob:
    model_location: str
    audio_name: str
    is_local: bool = True
    status: TranscriptionStatus = TranscriptionStatus.WAITING

    @property
    def key(self) -> str:
        return transcription_key(self.model_location, self.audio_name)

    @property
    def _location_prefix(self) -> str:
        if not self.is_local:
            return base64.b64encode(self.model_location.encode()).decode()
        return self.model_location

    def transcription_folder(self, base_folder: Path) -> Path:
        return base_folder / self._location_prefix / self.audio_name

    def to_dict(self) -> Dict[str, str]:
        result = dict(self.__dict__)
        result["status"] = self.status.value
        return result

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> TranscriptionJob:
        return cls(
            model_location=data["model_location"],
            audio_name=data["audio_name"],
            is_local=data["is_local"],
            status=TranscriptionStatus(data["status"]),
        )
