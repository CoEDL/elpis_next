import React from 'react';
import FileUpload from 'components/FileUpload';
import {transcriptionFilesAtom} from 'store';
import {useAtom} from 'jotai';
import {AlertTriangle, X} from 'react-feather';
import {FileType, parseFileType} from 'lib/dataset';

export default function TranscriptionFileUpload() {
  const [files, setFiles] = useAtom(transcriptionFilesAtom);

  return (
    <div className="section space-y-4">
      <div>
        <h2 className="text-xl">Upload Transcription Files</h2>
        <p className="mt-2">Some description.</p>
      </div>

      <FileUpload callback={_files => setFiles([...files, ..._files])} />
      {files.length > 0 && (
        <div>
          <p className="font-bold">Uploaded files</p>
          <div className="flex space-x-4">
            {files.map((file, index) => (
              <FileDisplay
                key={file.name}
                file={file}
                deleteFile={() =>
                  setFiles(files.filter((_, _index) => index !== _index))
                }
              />
            ))}
          </div>
        </div>
      )}
      <button className="button block" onClick={() => setFiles([])}>
        Reset
      </button>
    </div>
  );
}

type FileDisplayProps = {
  file: File;
  deleteFile(): void;
};

const FileDisplay: React.FC<FileDisplayProps> = ({file, deleteFile}) => {
  const invalid = parseFileType(file.name) !== FileType.Audio;
  return (
    <div className="flex space-x-3 items-center border p-2">
      <p key={file.name} className={invalid ? 'text-red-500' : ''}>
        {file.name}
      </p>
      {invalid && <AlertTriangle color="red" />}
      <button onClick={deleteFile}>
        <X />
      </button>
    </div>
  );
};
