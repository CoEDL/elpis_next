import ViewModelInfo from 'components/train/ViewModelInfo';
import ViewTraining from 'components/train/ViewTraining';
import {useAtom} from 'jotai';
import urls from 'lib/urls';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {useState} from 'react';
import {modelsAtom} from 'store';

export default function ViewModelPage() {
  const router = useRouter();
  const [models] = useAtom(modelsAtom);
  const [showInfo, setShowInfo] = useState(true);

  const {modelName} = router.query;
  if (!modelName) {
    return (
      <div className="container">
        <h1 className="title">No Model Name Supplied.</h1>
      </div>
    );
  }

  const model = models.find(model => model.modelName === modelName);
  if (!model) {
    return (
      <div className="container space-y-2">
        <h1 className="title">Model not Found</h1>
        <p>
          No model found with name {modelName}. Either create one or try visting
          the models page first:
        </p>
        <Link href={urls.train.index}>
          <a>
            <button className="button mt-4">Models Page</button>
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="title mb-4">View Model: {modelName}</h1>

      {/** Model info section */}
      <div className={'section space-y-4 ' + (!showInfo && 'hidden')}>
        <ViewModelInfo model={model} />
      </div>

      <button className="button mt-2" onClick={() => setShowInfo(!showInfo)}>
        {showInfo ? 'Hide Model Info' : 'Show Model Info'}
      </button>

      <ViewTraining model={model} />
    </div>
  );
}
