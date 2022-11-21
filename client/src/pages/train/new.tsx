import React from 'react';
import {newModelAtom, newModelStageAtom} from 'store';
import {useAtom} from 'jotai';
import ChooseModelName from 'components/train/ChooseModelName';
import ChooseTrainingOptions from 'components/train/ChooseTrainingOptions';
import {NewModelStage} from 'types/Model';
import NewModelSidebar from 'components/train/NewModelSidebar';
import ChooseDataset from 'components/train/ChooseDataset';
import ChooseModelOptions from 'components/train/ChooseModelOptions';

const NewModelPage: React.FC = () => {
  const [stage] = useAtom(newModelStageAtom);
  const [model] = useAtom(newModelAtom);

  const renderStage = () => {
    switch (stage) {
      case NewModelStage.Name:
        return <ChooseModelName />;
      case NewModelStage.Dataset:
        return <ChooseDataset />;
      case NewModelStage.TrainingOptions:
        return <ChooseTrainingOptions />;
      case NewModelStage.ModelOptions:
        return <ChooseModelOptions />;
      default:
        return <ChooseModelName />;
    }
  };

  const title = () => {
    const base = 'New Model';
    if (!model) {
      return base;
    }
    return `${base}: ${model.modelName}`;
  };

  return (
    <div className="container space-y-4 flex space-x-8">
      <NewModelSidebar />
      <div className="flex-1 space-y-4">
        <h1 className="title">{title()}</h1>
        <p>Blah</p>

        {renderStage()}
      </div>
    </div>
  );
};

export default NewModelPage;
