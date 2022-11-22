import {getElan, getText} from 'lib/api/transcribe';
import fileDownload from 'js-file-download';
import React from 'react';
import Transcription from 'types/Transcription';

type Props = {
  children: React.ReactNode;
  fileType: 'elan' | 'text';
  transcription: Transcription;
};

const DownloadTranscriptionFileButton: React.FC<
  Props & React.HTMLAttributes<HTMLButtonElement>
> = ({fileType, transcription, children, ...other}) => {
  const request = fileType === 'elan' ? getElan : getText;
  const suffix = fileType === 'elan' ? '.eaf' : '.txt';
  const fileName = transcription.audioName + suffix;

  const downloadFile = async () => {
    const response = await request(
      transcription.modelLocation,
      transcription.audioName
    );
    if (response.ok) {
      const blob = await response.blob();
      fileDownload(blob, fileName);
    }
  };

  if (transcription.status !== 'finished') {
    return <p>-</p>;
  }

  return (
    <button className="px-2 py-1" {...other} onClick={downloadFile}>
      {children}
    </button>
  );
};

export default DownloadTranscriptionFileButton;
