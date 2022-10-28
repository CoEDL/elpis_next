import React from 'react';
import {useAtom} from 'jotai';
import {activeStageAtom, trainingStageAtom} from 'store';
import TrainingStage from 'types/TrainingStage';

const STAGE_NAMES: Map<TrainingStage, string> = new Map([
  [TrainingStage.CreateDataset, 'Create Dataset'],
  [TrainingStage.Train, 'Train'],
  [TrainingStage.Evaluate, 'Evaluate'],
]);

const Sidebar: React.FC = () => {
  const [trainingStage] = useAtom(trainingStageAtom);
  const [stage, setStage] = useAtom(activeStageAtom);

  return (
    <div className="border bg-slate-50 border-primary rounded overflow-hidden">
      <p className="py-2 px-4 bg-purple-200 font-semibold text-primary">
        Training Stage
      </p>

      <div className="flex flex-col">
        {[...STAGE_NAMES.entries()].map(([_stage, name]) => (
          <StageDisplay
            name={name}
            key={name}
            isActive={_stage === stage}
            isAvailable={_stage <= trainingStage}
            onClick={() => setStage(_stage)}
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

export default Sidebar;
