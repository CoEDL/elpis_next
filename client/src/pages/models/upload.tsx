import React, {useState} from 'react';
import FileUpload from 'components/FileUpload';
import {uploadModel} from 'lib/api/models';
import {useRouter} from 'next/router';
import urls from 'lib/urls';

export default function UploadModelPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);
    const response = await uploadModel(file);
    if (response.ok) {
      setUploading(false);
      setFile(null);
      router.push(urls.models.index);
    } else {
      console.error('Error uploading model.');
      setError('Error uploading model.');
    }
    setUploading(false);
  };

  return (
    <div className="container">
      <h1 className="title">Upload Model</h1>
      <p className="mt-2">Description</p>

      <div className="mt-8 space-y-4 section">
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
    </div>
  );
}
