import {useAtom} from 'jotai';
import {deleteTranscription, transcribe} from 'lib/api/transcribe';
import React from 'react';
import {Check, Target, XCircle} from 'react-feather';
import {transcriptionsAtom} from 'store';
import Transcription, {TranscriptionStatus} from 'types/Transcription';
import DownloadTranscriptionFileButton from './DownloadTranscriptionFileButton';

const DatasetTable: React.FC = () => {
  const [transcriptions, setTranscriptions] = useAtom(transcriptionsAtom);

  if (transcriptions.length === 0) {
    return <p>No current transcriptions!</p>;
  }

  const updateTranscription = (index: number, transcription: Transcription) => {
    setTranscriptions([
      ...transcriptions.slice(0, index),
      transcription,
      ...transcriptions.slice(index + 1),
    ]);
  };

  const _transcribe = async (index: number) => {
    const transcription = transcriptions[index];
    const response = await transcribe(
      transcription.modelLocation,
      transcription.audioName
    );
    if (response.ok) {
      transcription.status = TranscriptionStatus.Finished;
    } else {
      transcription.status = TranscriptionStatus.Error;
      console.error('Could not train transcription!');
    }
    updateTranscription(index, transcription);
  };

  const transcribeEverything = () => {
    transcriptions.forEach((transcription, index) => {
      if (transcription.status !== 'finished') {
        _transcribe(index);
      }
    });
  };

  const removeTranscription = async (index: number) => {
    const transcription = transcriptions[index];
    const response = await deleteTranscription(
      transcription.modelLocation,
      transcription.audioName
    );
    if (response.ok) {
      setTranscriptions([
        ...transcriptions.slice(0, index),
        ...transcriptions.slice(index + 1),
      ]);
    } else {
      console.error('Could not delete transcription with index', index);
    }
  };

  const removeAll = async () => {
    const responses = transcriptions.map(transcription =>
      deleteTranscription(transcription.modelLocation, transcription.audioName)
    );
    await Promise.all(responses);
    setTranscriptions([]);
  };

  return (
    <>
      <div className="p-4 border text-left w-full">
        <table className="w-full">
          <thead>
            <tr>
              <th>Model Name</th>
              <th>Audio</th>
              <th>Status</th>
              <th>Text</th>
              <th>Elan</th>
              <th>Transcribe</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {transcriptions.map((transcription, index) => (
              <tr key={index}>
                <td>{transcription.modelLocation}</td>
                <td>{transcription.audioName}.wav</td>
                <td>{transcription.status}</td>

                <td>
                  <DownloadTranscriptionFileButton
                    transcription={transcription}
                    fileType="text"
                  />
                </td>
                <td>
                  <DownloadTranscriptionFileButton
                    transcription={transcription}
                    fileType="elan"
                  />
                </td>

                <td>
                  <button
                    className="px-2 py-1"
                    onClick={() => _transcribe(index)}
                    disabled={
                      transcription.status === TranscriptionStatus.Finished
                    }
                  >
                    {transcription.status === TranscriptionStatus.Finished ? (
                      <Check />
                    ) : (
                      <Target color="blue" />
                    )}
                  </button>
                </td>
                <td>
                  <button
                    className="px-2 py-1"
                    onClick={() => removeTranscription(index)}
                  >
                    <XCircle color="red" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2">
        <div className="flex justify-end space-x-2">
          <button className="button" onClick={transcribeEverything}>
            Transcribe All
          </button>
          <button className="button" onClick={removeAll}>
            Delete All
          </button>
        </div>
      </div>
    </>
  );
};

export default DatasetTable;
