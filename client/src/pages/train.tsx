import type {NextPage} from 'next';
import SideBar from 'components/train/Sidebar';
import DatasetTable from 'components/train/DatasetTable';
import {useAtom} from 'jotai';
import {datasetsAtom} from 'store';

const TrainPage: NextPage = () => {
  const [datasets] = useAtom(datasetsAtom);

  return (
    <div className="container py-8">
      <div className="flex space-x-8">
        <SideBar />
        <div>
          <h1 className="text-3xl text-secondary">Train</h1>
          <p className="mt-2 text-gray-800">Blah blah blah</p>

          <p className="text-xl font-semibold mt-8">Datasets</p>
          <DatasetTable datasets={datasets} />
          <div className="space-x-2 mt-2">
            <button className="button">Create new</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainPage;
