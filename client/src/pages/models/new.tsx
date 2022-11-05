import React from 'react';
import {newModelStageAtom} from 'store';
import {useAtom} from 'jotai';
import ChooseModelName from 'components/models/ChooseModelName';
import ChooseTrainingOptions from 'components/models/ChooseTrainingOptions';
import {NewModelStage} from 'types/Model';
import NewModelSidebar from 'components/models/NewModelSidebar';
import ChooseDataset from 'components/models/ChooseDataset';
import ChooseModelOptions from 'components/models/ChooseModelOptions';

const NewModelPage: React.FC = () => {
  const [stage] = useAtom(newModelStageAtom);

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

  return (
    <div className="container space-y-4 flex space-x-8">
      <NewModelSidebar />
      <div className="flex-1">
        <h1 className="title">New Model</h1>
        <p>Blah</p>

        {renderStage()}
      </div>
    </div>
  );
};

export default NewModelPage;
