import type {NextPage} from 'next';
import SideBar from 'components/train/Sidebar';
import DatasetTable from 'components/train/DatasetTable';
import {useAtom} from 'jotai';
import {datasetsAtom} from 'store';
import {useEffect} from 'react';
import {getDatasets} from 'lib/api/datasets';
import Link from 'next/link';
import urls from 'lib/urls';

const DatasetsPage: NextPage = () => {
  const [datasets, setDatasets] = useAtom(datasetsAtom);

  useEffect(() => {
    const fetchDatasets = async () => {
      const response = await getDatasets();
      if (response.ok) {
        const {datasets} = await response.json();
        setDatasets(datasets);
      }
      console.error("Couldn't download datasets!");
    };
    fetchDatasets();
  }, [setDatasets]);

  return (
    <div className="container py-8">
      <div className="flex space-x-8">
        <SideBar />
        <div className="flex-1">
          <h1 className="text-3xl text-secondary">Datasets</h1>
          <p className="mt-2 text-gray-800">Blah blah blah</p>

          <p className="text-xl font-semibold mt-8">Your Datasets</p>
          <DatasetTable />
          <div className="space-x-2 mt-2 flex justify-between">
            <Link href={urls.datasets.new}>
              <a>
                <button className="button">Create new</button>
              </a>
            </Link>
            <Link href={urls.datasets.new}>
              <a>
                <button className="button">Next</button>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetsPage;
