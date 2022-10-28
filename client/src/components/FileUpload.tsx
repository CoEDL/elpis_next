import React, {useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import {Upload} from 'react-feather';

const DEFAULT_TEXT = 'Drag and drop some files here, or click to select files';

type Props = {
  callback(files: File[]): void;
  text?: string;
};

const FileDropper: React.FC<Props> = ({callback, text = DEFAULT_TEXT}) => {
  const onDrop = useCallback(callback, [callback]);
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

  return (
    <div
      {...getRootProps()}
      className="p-8 w-80 bg-gray-200 text-sm font-semibold text-gray-600 inline-block rounded"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <div className="cursor-pointer flex flex-col items-center justify-center space-y-2">
          <Upload size={40} />
          <p className="text-center">{text}</p>
        </div>
      )}
    </div>
  );
};

export default FileDropper;
