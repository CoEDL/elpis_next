import React, {useState} from 'react';
import FileUpload from 'components/FileUpload';
import {getModels, uploadModel} from 'lib/api/models';
import Model from 'types/Model';
import {useAtom} from 'jotai';
import {modelsAtom} from 'store';

export default function UploadModel() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [, setModels] = useAtom(modelsAtom);

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);
    const response = await uploadModel(file);
    if (response.ok) {
      setUploading(false);
      setFile(null);
      // Refetch all the models.
      const getModelsResponse = await getModels();
      if (getModelsResponse.ok) {
        const models: Model[] = await getModelsResponse.json();
        setModels(models);
      } else {
        console.error("Error updating model list. This shouldn't happen");
      }
    } else {
      console.error('Error uploading model.');
      setError('Error uploading model.');
    }
    setUploading(false);
  };

  return (
    <div className="mt-8 space-y-2 section">
      <p className="font-semibold text-xl">Upload model</p>

      {!uploading ? (
        <>
          <FileUpload
            text="Upload the zip file of your model"
            callback={files => setFile(files[0])}
          />

          {file && <p>Model zip: {file.name}</p>}
          {file && (
            <button
              className="button"
              onClick={uploadFile}
              disabled={!file || uploading}
            >
              Upload
            </button>
          )}
          {error && <p className="text-red-500">{error}</p>}
        </>
      ) : (
        <p>Uploading {file!.name}...</p>
      )}
    </div>
  );
}
