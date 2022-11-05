import React from 'react';
import {useAtom} from 'jotai';
import {newModelAtom, newModelStageAtom} from 'store';
import {NewModelStage} from 'types/Model';

type Stage = {
  stage: NewModelStage;
  name: string;
  isAvailable: boolean;
  hasCompleted: boolean;
};

const NewModelSidebar: React.FC = () => {
  const [model] = useAtom(newModelAtom);
  const [modelStage, setModelStage] = useAtom(newModelStageAtom);

  const stages: Stage[] = [
    {
      stage: NewModelStage.Name,
      name: 'Model Name',
      isAvailable: true,
      hasCompleted: (model?.modelName ?? '') !== '',
    },
    {
      stage: NewModelStage.Dataset,
      name: 'Dataset',
      isAvailable: model !== null,
      hasCompleted: model?.datasetName !== undefined,
    },
    {
      stage: NewModelStage.TrainingOptions,
      name: 'Training Options',
      isAvailable: model !== null,
      hasCompleted: model?.options !== undefined,
    },
    {
      stage: NewModelStage.ModelOptions,
      name: 'Model Options',
      isAvailable: model !== null,
      hasCompleted:
        model?.baseModel !== undefined && model?.samplingRate !== undefined,
    },
  ];

  return (
    <div className="border bg-slate-50 border-primary rounded overflow-hidden">
      <p className="py-2 px-4 bg-purple-200 font-semibold text-primary">
        New Model Creation
      </p>

      <div className="flex flex-col">
        {stages.map(({stage, name, isAvailable, hasCompleted}) => (
          <StageDisplay
            name={name}
            key={name}
            isActive={stage === modelStage}
            isAvailable={isAvailable}
            hasCompleted={hasCompleted}
            onClick={() => setModelStage(stage)}
          ></StageDisplay>
        ))}
      </div>
    </div>
  );
};

type DisplayProps = {
  name: string;
  isActive: boolean;
  isAvailable: boolean;
  hasCompleted: boolean;
  onClick: () => void;
};

const StageDisplay: React.FC<DisplayProps> = ({
  name,
  isAvailable,
  isActive,
  onClick,
}) => {
  let nameStyle = 'text-gray-400 text-sm';
  let bgStyle = 'px-4 py-3';
  if (isAvailable) {
    nameStyle += ' text-gray-800';
    bgStyle += '  transition hover:bg-purple-100';
  }
  if (isActive) {
    nameStyle += ' font-semibold';
  }
  return (
    <button className={bgStyle} onClick={onClick} disabled={!isAvailable}>
      <p className={nameStyle}>{name}</p>
    </button>
  );
};

export default NewModelSidebar;
