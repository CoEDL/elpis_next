import FileDropper from 'components/FileUpload';
import {useAtom} from 'jotai';
import React from 'react';
import {filesAtom} from 'store';
import {XCircle, Check, X, AlertTriangle} from 'react-feather';
import {FileType, hasMatch, parseFileType} from 'lib/dataset';

const DatasetFiles: React.FC = () => {
  const [files, setFiles] = useAtom(filesAtom);

  const fileTypes: FileType[] = [
    FileType.Audio,
    FileType.Transcription,
    FileType.Unsupported,
  ];
  const [audioFiles, transcriptionFiles, unsupportedFiles] = fileTypes.map(
    type => files.filter(file => parseFileType(file.name) === type)
  );

  const deleteFile = (name: string) =>
    setFiles(files.filter(file => file.name !== name));

  const fileRows = (selectedFiles: File[], type: string) =>
    selectedFiles.map((file, index) => (
      <tr key={index} className="text-gray-600 text-sm">
        <td>{file.name}</td>
        <td>{type}</td>
        <td>
          {hasMatch(
            file.name,
            files.map(file => file.name)
          ) ? (
            <Check color="green" />
          ) : (
            <X color="red" />
          )}
        </td>
        <td>
          <button className="px-2 py-1" onClick={() => deleteFile(file.name)}>
            <XCircle color="red" />
          </button>
        </td>
      </tr>
    ));

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl mb-2">Upload Dataset Files</h2>
      <FileDropper callback={_files => setFiles([...files, ..._files])} />
      {files.length > 0 && (
        <div className="p-4 mt-8 rounded border">
          <p className="text-lg">Uploaded Files:</p>
          <table className="w-full mt-2">
            <thead className="text-sm">
              <tr>
                <th className="text-left">File name</th>
                <th className="text-left">Type</th>
                <th className="text-left">Has match</th>
                <th className="text-left">Delete</th>
              </tr>
            </thead>
            <tbody>
              {fileRows(transcriptionFiles, 'Transcription')}
              {fileRows(audioFiles, 'Audio')}
            </tbody>
          </table>
        </div>
      )}

      {unsupportedFiles.length > 0 && (
        <div className="mt-4 p-4 border border-orange-300 rounded">
          <div className="flex space-x-2">
            <AlertTriangle></AlertTriangle>
            <p>Unsupported Files:</p>
          </div>
          <div className="mt-2 flex text-sm">
            {unsupportedFiles.map(file => (
              <p key={file.name}>{file.name}</p>
            ))}
          </div>
          <button
            className="mt-4 button text-sm"
            onClick={() =>
              unsupportedFiles.forEach(file => deleteFile(file.name))
            }
          >
            Delete all Unsupported
          </button>
        </div>
      )}
    </div>
  );
};

export default DatasetFiles;
