import {getElan, getText} from 'lib/api/transcribe';
import fileDownload from 'js-file-download';
import React, {useState} from 'react';
import Transcription from 'types/Transcription';
import {Button} from 'components/ui/button';
import {Download} from 'lucide-react';

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
    setDownloading(false);
    if (response.ok) {
      const blob = await response.blob();
      fileDownload(blob, fileName);
    }
  };

  if (transcription.status !== 'finished') {
    return null;
  }

  if (variant === 'icon') {
    return (
      <button {...other} onClick={downloadFile} disabled={downloading}>
        <Download />
      </button>
    );
  }

  return (
    <Button variant="secondary" {...other} onClick={downloadFile}>
      <Download className="h-4 w-4 mr-2" />
      {text}
    </Button>
  );
};

export default DownloadTranscriptionFileButton;
