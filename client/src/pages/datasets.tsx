import type {NextPage} from 'next';
import DatasetTable from 'components/train/DatasetTable';
import {useAtom} from 'jotai';
import {datasetsAtom} from 'store';
import {useEffect} from 'react';
import {getDatasets} from 'lib/api/datasets';
import Link from 'next/link';
import urls from 'lib/urls';
import ClientOnly from 'components/ClientOnly';
import {Button} from 'components/ui/button';
import {Plus} from 'lucide-react';
import {ArrowRight} from 'react-feather';

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
      <p className="mt-2 page-description">Blah blah blah</p>

      <ClientOnly className="mt-8 space-y-4">
        <div className="space-x-2 mt-2 flex justify-between">
          <Link href={urls.datasets.new}>
            <a>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create new
              </Button>
            </a>
          </Link>
          {datasets.length > 0 && (
            <Link href={urls.train.new}>
              <a>
                <Button variant="link">
                  Train Model
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </Link>
          )}
        </div>
        <p className="subtitle">Your Datasets</p>
        <DatasetTable />
      </ClientOnly>
    </div>
  );
};

export default DatasetsPage;
