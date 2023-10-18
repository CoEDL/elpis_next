import {getModelLogs} from 'lib/api/models';
import fileDownload from 'js-file-download';
import React, {useEffect, useState} from 'react';
import Model, {TrainingStatus} from 'types/Model';
import Link from 'next/link';
import {tensorboard} from 'lib/urls';
import TrainingStatusIndicator from 'components/train/TrainingStatusIndicator';
import {Button} from 'components/ui/button';
import {Download} from 'react-feather';

type Props = {
  model: Model;
};

const LOGS_REFRESH_RATE = 2000;

const ViewTraining: React.FC<Props> = ({model}) => {
  const [logs, setLogs] = useState<string[]>([]);

  // Continuously pull model logs if it's training.
  useEffect(() => {
    const fetchModelLogs = async () => {
      const response = await getModelLogs(model.name);
      if (response.ok) {
        const blob = await response.blob();
        const logs = await blob.text();
        setLogs(logs.split('\n'));
      } else {
        const error = await response.text();
        console.error('Error fetching model logs: ', error);
      }
    };
    fetchModelLogs();
    const interval =
      model.status === TrainingStatus.Training
        ? setInterval(() => {
            fetchModelLogs();
          }, LOGS_REFRESH_RATE)
        : undefined;

    return () => clearInterval(interval);
  }, [model.status, model.name]);

  const downloadLogs = async () => {
    const response = await getModelLogs(model.name);
    if (response.ok) {
      const blob = await response.blob();
      fileDownload(blob, `${model.name}_training_logs.txt`);
    }
  };

  if (model.status === TrainingStatus.Waiting) return <></>;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <p className="subtitle">Training Logs</p>
        <div className="flex space-x-2">
          <p className="capitalize font-semibold">
            {model.status ?? TrainingStatus.Training}
          </p>
          <TrainingStatusIndicator
            status={model.status ?? TrainingStatus.Training}
          />
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto bg-slate-800 text-white font-mono text-xs rounded p-3">
        {logs.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>
      <div className="flex space-x-2">
        <Button
          variant="secondary"
          className="space-x-2"
          onClick={downloadLogs}
        >
          <Download size={20} />
          <span>Download Logs</span>
        </Button>
        <Link href={tensorboard}>
          <a target="_blank">
            <Button variant="link">Tensorboard</Button>
          </a>
        </Link>
      </div>
    </div>
  );
};

export default ViewTraining;
