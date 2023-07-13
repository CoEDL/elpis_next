import type {NextPage} from 'next';
import {useAtom} from 'jotai';
import {modelsAtom} from 'store';
import ModelTable from 'components/train/ModelTable';
import {useEffect} from 'react';
import {getModels} from 'lib/api/models';
import Link from 'next/link';
import urls from 'lib/urls';
import {TrainingStatus} from 'types/Model';
import ClientOnly from 'components/ClientOnly';
import {Button} from 'components/ui/button';

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
          <p className="mt-2 page-description">Blah blah blah</p>

          <ClientOnly className="space-y-4">
            <h2 className="subtitle mt-8 mb-2">Your Models</h2>
            <ModelTable />
            <div className="flex items-center justify-between">
              <div className="space-x-2">
                <Link href={urls.train.new}>
                  <a>
                    <Button>Create New</Button>
                  </a>
                </Link>
                <Link href={urls.train.upload}>
                  <a>
                    <Button variant="outline">Upload Model</Button>
                  </a>
                </Link>
              </div>

              {models.filter(model => model.status === TrainingStatus.Finished)
                .length > 0 && (
                <div>
                  <Link href={urls.transcriptions.new}>
                    <a>
                      <Button variant="outline">Transcribe Audio</Button>
                    </a>
                  </Link>
                </div>
              )}
            </div>
          </ClientOnly>
        </div>
      </div>
    </div>
  );
};

export default TrainPage;
