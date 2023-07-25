import {getElan, getText} from 'lib/api/transcribe';
import React from 'react';
import Transcription, {TranscriptionStatus} from 'types/Transcription';
import DownloadFileButton from 'components/DownloadFileButton';
import {ButtonProps} from 'components/ui/button';

type Props = {
  isIcon?: boolean;
  fileType: 'elan' | 'text';
  transcription: Transcription;
};

const DownloadTranscriptionFileButton: React.FC<Props & ButtonProps> = ({
  fileType,
  transcription,
  isIcon = false,
  ...rest
}) => {
  const suffix = fileType === 'elan' ? '.eaf' : '.txt';
  const fileName = transcription.audioName + suffix;

  const request = fileType === 'elan' ? getElan : getText;
  const text = fileType === 'elan' ? 'Download Elan' : 'Download Text';

  return (
    <DownloadFileButton
      downloadFile={() =>
        request(transcription.modelLocation, transcription.audioName)
      }
      text={isIcon ? undefined : text}
      filename={fileName}
      disabled={transcription.status !== TranscriptionStatus.Finished}
      {...rest}
    />
  );
};

export default DownloadTranscriptionFileButton;
