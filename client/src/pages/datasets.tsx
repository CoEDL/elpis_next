import type {NextPage} from 'next';
import DatasetTable from 'components/train/DatasetTable';
import {useAtom} from 'jotai';
import {datasetsAtom} from 'store';
import {useEffect} from 'react';
import {getDatasets} from 'lib/api/datasets';
import Link from 'next/link';
import urls from 'lib/urls';
import ClientOnly from 'components/ClientOnly';

const DatasetsPage: NextPage = () => {
  const [datasets, setDatasets] = useAtom(datasetsAtom);

  useEffect(() => {
    const fetchDatasets = async () => {
      const response = await getDatasets();
      if (response.ok) {
        const datasets = await response.json();
        setDatasets(datasets);
      } else {
        console.error("Couldn't download datasets!");
      }
    };
    fetchDatasets();
  }, [setDatasets]);

  return (
    <div className="container">
      <h1 className="title">Datasets</h1>
      <p className="mt-2 text-gray-800">Blah blah blah</p>

      <ClientOnly className="mt-8 space-y-4">
        <p className="subtitle">Your Datasets</p>
        <DatasetTable />
        <div className="space-x-2 mt-2 flex justify-between">
          <Link href={urls.datasets.new}>
            <a>
              <button className="button">Create new</button>
            </a>
          </Link>
          {datasets.length > 0 && (
            <Link href={urls.train.index}>
              <a>
                <button className="button">Train Model</button>
              </a>
            </Link>
          )}
        </div>
      </ClientOnly>
    </div>
  );
};

export default DatasetsPage;
