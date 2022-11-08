import {getElan, getText} from 'lib/api/transcribe';
import fileDownload from 'js-file-download';
import React from 'react';
import Transcription from 'types/Transcription';
import {Download} from 'react-feather';

type Props = {
  fileType: 'elan' | 'text';
  transcription: Transcription;
};

const DownloadTranscriptionFileButton: React.FC<Props> = ({
  fileType,
  transcription,
}) => {
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
    <button className="px-2 py-1" onClick={downloadFile}>
      <Download />
    </button>
  );
};

export default DownloadTranscriptionFileButton;
