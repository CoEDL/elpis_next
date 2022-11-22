import React from 'react';
import FileUpload from 'components/FileUpload';
import {transcriptionFilesAtom} from 'store';
import {useAtom} from 'jotai';
import {Check, X, Trash2} from 'react-feather';
import {FileType, parseFileType} from 'lib/dataset';
import colours from 'lib/colours';

export default function TranscriptionFileUpload() {
  const [files, setFiles] = useAtom(transcriptionFilesAtom);

  const removeUnsupported = () =>
    setFiles(files.filter(file => parseFileType(file.name) === FileType.Audio));

  return (
    <div className="section space-y-4">
      <div>
        <h2 className="subtitle">2. Upload Transcription Files</h2>
        <p className="mt-2">Some description.</p>
      </div>

      <FileUpload callback={_files => setFiles([...files, ..._files])} />
      {files.length > 0 && (
        <>
          <div className="space-y-4 mt-8">
            <p className="font-bold">Uploaded files</p>
            <table className="w-full table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Is Valid</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, index) => (
                  <tr key={index}>
                    <td>{file.name}</td>
                    <td>
                      {parseFileType(file.name) === FileType.Audio ? (
                        <Check color={colours.success} />
                      ) : (
                        <X color={colours.error} />
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          setFiles(
                            files.filter((_, _index) => index !== _index)
                          )
                        }
                      >
                        <Trash2 color={colours.delete} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex space-x-2 items-center justify-between">
            <button className="button block" onClick={() => setFiles([])}>
              Reset
            </button>
            <button
              className="button block"
              onClick={removeUnsupported}
              disabled={
                files.filter(
                  file => parseFileType(file.name) !== FileType.Audio
                ).length === 0
              }
            >
              Remove Unsupported Files
            </button>
          </div>
        </>
      )}
    </div>
  );
}
