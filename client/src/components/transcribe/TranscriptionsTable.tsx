import {useAtom} from 'jotai';
import React from 'react';
import {Download, XCircle} from 'react-feather';
import {transcriptionsAtom} from 'store';
import TranscriptionStatus from './TranscriptionStatus';
import fileDownload from 'js-file-download';
import {getElan, getText} from 'lib/api/transcribe';

const DatasetTable: React.FC = () => {
  const [transcriptions] = useAtom(transcriptionsAtom);

  if (transcriptions.length === 0) {
    return <p>No current transcriptions!</p>;
  }

  const downloadFile = async (name: string, request: Promise<Response>) => {
    const response = await request;
    if (response.ok) {
      const blob = await response.blob();
      fileDownload(blob, name);
    }
  };

  return (
    <div className="p-4 border text-left w-full">
      <table className="w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Audio</th>
            <th>Status</th>
            <th>Text</th>
            <th>Elan</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {transcriptions.map(({modelLocation, audioName}, index) => (
            <tr key={index}>
              <td>{modelLocation}</td>
              <td>{audioName}.wav</td>
              <td>
                <TranscriptionStatus
                  modelLocation={modelLocation}
                  audioName={audioName}
                />
              </td>

              <td>
                <button
                  className="px-2 py-1"
                  onClick={() =>
                    downloadFile(
                      'transcription.txt',
                      getText(modelLocation, audioName)
                    )
                  }
                >
                  txt
                  <Download />
                </button>
              </td>

              <td>
                <button
                  className="px-2 py-1"
                  onClick={() =>
                    downloadFile(
                      'transcription.eaf',
                      getElan(modelLocation, audioName)
                    )
                  }
                >
                  elan
                  <Download />
                </button>
              </td>

              <td>
                <button className="px-2 py-1">
                  <XCircle color="red" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DatasetTable;
