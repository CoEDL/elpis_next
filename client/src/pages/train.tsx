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
import {ArrowRight, Plus, Upload} from 'lucide-react';

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

          <ClientOnly className="mt-4 space-y-4">
            <div className="mb-8 flex items-center justify-between">
              <div className="space-x-2 flex items-center">
                <Link href={urls.train.new}>
                  <a>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create New
                    </Button>
                  </a>
                </Link>
                <Link href={urls.train.upload}>
                  <a>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Model
                    </Button>
                  </a>
                </Link>
              </div>

              {models.filter(model => model.status === TrainingStatus.Finished)
                .length > 0 && (
                <div>
                  <Link href={urls.transcriptions.new}>
                    <a>
                      <Button variant="link">
                        Transcribe Audio
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </Link>
                </div>
              )}
            </div>
            <section className="space-y-4">
              <h2 className="subtitle mt-8 mb-2">Your Models</h2>
              <ModelTable />
            </section>
          </ClientOnly>
        </div>
      </div>
    </div>
  );
};

export default TrainPage;
