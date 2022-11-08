import type {NextPage} from 'next';
import {useAtom} from 'jotai';
import {modelsAtom} from 'store';
import ModelTable from 'components/models/ModelTable';
import {useEffect} from 'react';
import {getModels} from 'lib/api/models';
import Link from 'next/link';
import urls from 'lib/urls';
import UploadModel from 'components/models/UploadModel';

const TrainPage: NextPage = () => {
  const [, setModels] = useAtom(modelsAtom);

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
          <h1 className="title">Models</h1>
          <p className="mt-2 text-gray-800">Blah blah blah</p>

          <p className="text-xl font-semibold mt-8">Your Models</p>
          <ModelTable />
          <div className="space-x-2 mt-2">
            <Link href={urls.models.new}>
              <button className="button">Create new</button>
            </Link>
          </div>
          <UploadModel />
        </div>
      </div>
    </div>
  );
};

export default TrainPage;
