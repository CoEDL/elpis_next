from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict

from elpis.models import Job


class JobStatus(Enum):
    WAITING = "waiting"
    TRAINING = "training"
    FINISHED = "finished"
    ERROR = "error"


@dataclass
class NamedJob:
    name: str
    job: Job
    status: JobStatus = JobStatus.WAITING

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "job": self.job.to_dict(),
            "status": self.status.value,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "NamedJob":
        return cls(
            name=data["name"],
            job=Job.from_dict(data["job"]),
            status=JobStatus(data.get("status", "waiting")),
        )
