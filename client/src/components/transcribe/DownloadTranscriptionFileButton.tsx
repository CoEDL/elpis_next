import {getElan, getText} from 'lib/api/transcribe';
import fileDownload from 'js-file-download';
import React, {useState} from 'react';
import Transcription from 'types/Transcription';
import {Button} from 'components/ui/button';
import {Download, Loader} from 'lucide-react';
import clsx from 'clsx';

type Props = {
  variant?: 'full' | 'icon';
  fileType: 'elan' | 'text';
  transcription: Transcription;
};

const DownloadTranscriptionFileButton: React.FC<
  Props & React.HTMLAttributes<HTMLButtonElement>
> = ({fileType, variant = 'full', transcription, ...other}) => {
  const request = fileType === 'elan' ? getElan : getText;
  const suffix = fileType === 'elan' ? '.eaf' : '.txt';
  const fileName = transcription.audioName + suffix;
  const text = fileType === 'elan' ? 'Download Elan' : 'Download Text';
  const [downloading, setDownloading] = useState(false);

  const downloadFile = async () => {
    if (downloading) return;
    setDownloading(true);
    const response = await request(
      transcription.modelLocation,
      transcription.audioName
    );
    if (response.ok) {
      const blob = await response.blob();
      fileDownload(blob, fileName);
    }
    setDownloading(false);
  };

  if (transcription.status !== 'finished') {
    return null;
  }

  const Icon = downloading ? Loader : Download;

  if (variant === 'icon') {
    return (
      <button {...other} onClick={downloadFile} disabled={downloading}>
        <Icon className={clsx({'animate-spin': downloading})} />
      </button>
    );
  }

  return (
    <Button
      variant="secondary"
      {...other}
      onClick={downloadFile}
      disabled={downloading}
    >
      <Icon className={clsx('h-4 w-4 mr-2', {'animate-spin': downloading})} />
      {text}
    </Button>
  );
};

export default DownloadTranscriptionFileButton;
