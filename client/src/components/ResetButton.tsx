import {useAtom} from 'jotai';
import {resetApp} from 'lib/api/reset';
import React from 'react';
import {datasetsAtom, modelsAtom, transcriptionsAtom} from 'store';

export default function ResetButton() {
  const [, setDatasets] = useAtom(datasetsAtom);
  const [, setModels] = useAtom(modelsAtom);
  const [, setTranscriptions] = useAtom(transcriptionsAtom);

  const reset = async () => {
    const response = await resetApp();
    if (response.ok) {
      setDatasets([]);
      setModels([]);
      setTranscriptions([]);
    } else {
      console.error('Error resetting app');
    }
  };

  return (
    <button className="button" onClick={reset}>
      Reset
    </button>
  );
}
