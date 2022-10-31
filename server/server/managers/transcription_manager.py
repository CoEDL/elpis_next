import json
from pathlib import Path
from typing import Any, Dict

from elpis.transcriber.results import build_elan, build_text
from elpis.transcriber.transcribe import build_pipeline, transcribe
from loguru import logger
from transformers import AutomaticSpeechRecognitionPipeline as ASRPipeline
from typing_extensions import override

from server.managers import Manager
from server.managers.manager import Manager, ManagerType, auto_save


class TranscriptionManager(Manager):
    _pipelines: Dict[str, ASRPipeline] = {}

    def __init__(
        self,
        data_dir: Path,
        overwrite: bool = False,
    ) -> None:
        super().__init__(ManagerType.TRANSCRIPTION.value, data_dir, overwrite)

    @property
    def pipelines(self) -> Dict[str, ASRPipeline]:
        return TranscriptionManager._pipelines

    @pipelines.setter
    def pipelines(self, value: Dict[str, ASRPipeline]):
        TranscriptionManager._datasets = value

    @override
    def serialize(self):
        return {}

    @override
    def load_state(self, state_file: Path) -> None:
        pass

    @override
    def clean(self) -> None:
        return super().clean()

    @override
    def reset(self) -> None:
        return super().reset()

    def transcription_folder(self, model_location: str, audio_name: str) -> Path:
        return self.folder / model_location / audio_name

    def has_completed(self, model_location: str, audio_name: str) -> bool:
        folder = self.transcription_folder(model_location, audio_name)
        text_file = folder / f"{audio_name}.txt"
        elan_file = folder / f"{audio_name}.eaf"
        return text_file.exists() and elan_file.exists()

    def transcribe(self, model_location: str, audio_file: Path) -> None:
        if model_location in self.pipelines:
            asr = self.pipelines[model_location]
        else:
            asr = build_pipeline(model_location)
            self.pipelines[model_location] = asr

        annotations = transcribe(audio_file, asr)
        folder = self.transcription_folder(model_location, audio_file.stem)

        # Build text file
        with open(folder / f"{audio_file.stem}.txt", "w") as text_file:
            text_file.write(build_text(annotations))

        # Build elan file
        build_elan(annotations).to_file(folder / f"{audio_file.stem}.eaf")
