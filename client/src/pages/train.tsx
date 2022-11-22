import type {NextPage} from 'next';
import {useAtom} from 'jotai';
import {modelsAtom} from 'store';
import ModelTable from 'components/train/ModelTable';
import {useEffect} from 'react';
import {getModels} from 'lib/api/models';
import Link from 'next/link';
import urls from 'lib/urls';
import {TrainingStatus} from 'types/Model';

const TrainPage: NextPage = () => {
  const [models, setModels] = useAtom(modelsAtom);

  useEffect(() => {
    const fetchModels = async () => {
      const response = await getModels();
      if (response.ok) {
        const models = await response.json();
        setModels(models);
      } else {
        console.error("Couldn't download models!");
      }
    };
    fetchModels();
  }, [setModels]);

  return (
    <div className="container">
      <div className="flex space-x-8">
        <div className="w-full">
          <h1 className="title">Train Models</h1>
          <p className="mt-2 text-gray-800">Blah blah blah</p>

          <div className="space-y-4">
            <h2 className="subtitle mt-8 mb-2">Your Models</h2>
            <ModelTable />
            <div className="flex items-center justify-between">
              <div className="space-x-2">
                <Link href={urls.train.new}>
                  <a>
                    <button className="button">Create New</button>
                  </a>
                </Link>
                <Link href={urls.train.upload}>
                  <a>
                    <button className="button">Upload Model</button>
                  </a>
                </Link>
              </div>

              {models.filter(model => model.status === TrainingStatus.Finished)
                .length > 0 && (
                <div>
                  <Link href={urls.transcriptions.new}>
                    <a>
                      <button className="button">Transcribe Audio</button>
                    </a>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainPage;
