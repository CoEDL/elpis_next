import clsx from 'clsx';
import fileDownload from 'js-file-download';
import {Download, Loader} from 'lucide-react';
import React, {FC, useState} from 'react';
import {Button, ButtonProps} from './ui/button';

export type DownloadFileButtonProps = {
  downloadFile: () => Promise<Response>;
  filename: string;
  text?: string;
  loadingText?: string;
  errorText?: string;
};

const DEFAULT_ERROR_TEXT = 'Error downloading files';

const DownloadFileButton: FC<DownloadFileButtonProps & ButtonProps> = ({
  downloadFile,
  text,
  filename,
  loadingText,
  errorText,
  disabled = false,
  ...rest
}) => {
  const [downloading, setDownloading] = useState<boolean>(false);

  const download = async () => {
    if (downloading) return;
    setDownloading(true);

    const response = await downloadFile();
    if (response.ok) {
      const blob = await response.blob();
      fileDownload(blob, filename);
    } else {
      console.error(errorText ?? DEFAULT_ERROR_TEXT);
    }

    setDownloading(false);
  };

  const Icon = downloading ? Loader : Download;

  const hasText = text !== undefined && text.length > 0;
  if (hasText) {
    return (
      <Button {...rest} onClick={download} disabled={disabled || downloading}>
        <Icon className={clsx('h-4 w-4 mr-2', {'animate-spin': downloading})} />
        {downloading ? loadingText ?? text : text}
      </Button>
    );
  }

  return (
    <button {...rest} onClick={download} disabled={disabled || downloading}>
      <Icon
        className={clsx({
          'animate-spin': downloading,
          'text-gray-300': disabled,
        })}
      />
    </button>
  );
};

export default DownloadFileButton;
