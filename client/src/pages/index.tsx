import urls from 'lib/urls';
import type {NextPage} from 'next';
import Link from 'next/link';

const Home: NextPage = () => {
  return (
    <div className="container">
      <h1 className="text-center title">ELPIS</h1>
      <div className="mt-12">
        <div className="flex space-x-2 items-center justify-center mt-4">
          <TaskButton
            url={urls.datasets.index}
            title={'Build a dataset'}
            cardClassName="bg-primary text-white"
          />
          <TaskButton
            url={urls.train.index}
            title={'Train a Model'}
            cardClassName="bg-primary text-white"
          />
          <TaskButton
            url={urls.transcriptions.index}
            title={'Transcribe Audio'}
            cardClassName="bg-secondary text-white"
          />
        </div>
      </div>
    </div>
  );
};

type Task = {
  url: string;
  title: string;
  cardClassName?: string;
};

const TaskButton: React.FC<Task> = ({url, title, cardClassName}) => {
  return (
    <Link href={url}>
      <a>
        <div
          className={
            'w-40 h-20 border rounded p-2 hover:shadow-md flex flex-col items-center justify-center ' +
            cardClassName
          }
        >
          <p className="text-center font-semibold">{title}</p>
        </div>
      </a>
    </Link>
  );
};

export default Home;
