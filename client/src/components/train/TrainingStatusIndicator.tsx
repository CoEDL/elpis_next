import React from 'react';
import {TrainingStatus} from 'types/Model';
import {Play, Loader, Check, AlertTriangle} from 'react-feather';
import colours from 'lib/colours';

type Status = {
  status: TrainingStatus;
};

const TrainingStatusIndicator: React.FC<Status> = ({status}) => {
  switch (status) {
    case TrainingStatus.Waiting:
      return <Play color={colours.start} />;
    case TrainingStatus.Training:
      return <Loader color={colours.unavailable} className="animate-spin" />;
    case TrainingStatus.Finished:
      return <Check color={colours.grey} />;
    case TrainingStatus.Error:
      return <AlertTriangle color={colours.warning} />;
  }
};

export default TrainingStatusIndicator;
