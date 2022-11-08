import urls from 'lib/urls';
import type {NextPage} from 'next';
import Link from 'next/link';

const Home: NextPage = () => {
  return (
    <div className="container">
      <h1 className="text-center title">ELPIS</h1>
      <p className="text-center mt-2 text-gray-800">Blah blah blah</p>

      <p className="font-semibold text-center mt-12">Choose a Task</p>
      <div className="flex space-x-2 items-center justify-center mt-4">
        <TaskButton
          url={urls.models.index}
          title={'Train'}
          cardClassName="bg-primary border-blue-300 text-white"
        />
        <TaskButton
          url={urls.transcriptions.index}
          title={'Transcribe'}
          cardClassName="bg-secondary text-white"
        />
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
