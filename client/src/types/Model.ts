export enum TrainingStatus {
  Waiting = 'waiting',
  Training = 'training',
  Finished = 'finished',
  Error = 'error',
}

export type ModelArguments = {
  modelNameOrPath: string;
  tokenizerNameOrPath?: string;
  freezeFeatureEncoder?: boolean;
  attentionDropout?: number;
  activationDropout?: number;
  featProjDropout?: number;
  hiddenDropout?: number;
  finalDropout?: number;
  maskTimeProb?: number;
  maskTimeLength?: number;
  maskFeatureProb?: number;
  maskFeatureLength?: number;
  layerdrop?: number;
  ctcLossReduction?: 'mean' | 'sum';
  ctcZeroInfinity?: boolean;
};

export type DataArguments = {
  datasetNameOrPath: string;
  datasetConfigName?: string;
  // streamDataset?: boolean; // Not ready yet
  trainSplitName?: string;
  evalSplitName?: string;
  audioColumnName?: string;
  textColumnName?: string;
  overwriteCache?: boolean;
  maxTrainSamples?: number;
  maxEvalSamples?: number;
  doClean?: boolean;
  wordsToRemove?: string[];
  charsToRemove?: string[];
  charsToExplode?: string[];
  doLowerCase?: boolean;
  evalMetrics?: string[];
  maxDurationInSeconds?: number;
  minDurationInSeconds?: number;
  token?: string;
  trustRemoteCode?: boolean;
  unkToken?: string;
  padToken?: string;
  wordDelimiterToken?: string;
  phonemeLanguage?: string;
};

export type IntervalStrategy = 'no' | 'steps' | 'epoch';

export type TrainingArguments = {
  numTrainEpochs?: number;
  learningRate?: number;
  weightDecay?: number;
  perDeviceTrainBatchSize?: number;
  perDeviceEvalBatchSize?: number;
  gradientAccumulationSteps?: number;
  evaluationStrategy?: IntervalStrategy;
  loggingStrategy?: IntervalStrategy;
  saveStrategy?: IntervalStrategy;
  // evalAccumulationSteps?: number;
  maxSteps?: number;
  warmupSteps?: number;
  loggingSteps?: number;
  saveSteps?: number;
  evalSteps?: number;
  saveTotalLimit?: number;
  seed?: number;
  greaterIsBetter?: boolean;
  pushToHub?: boolean;
  dataloaderDropLast?: boolean;
};

export type Model = {
  name: string;
  modelArgs: ModelArguments;
  dataArgs: DataArguments;
  trainingArgs: TrainingArguments;
  status: TrainingStatus;
  isDatasetLocal: boolean;
};

export type RawModel = Omit<
  Model,
  'modelArgs' | 'dataArgs' | 'trainingArgs'
> & {
  job: ModelArguments | TrainingArguments | DataArguments;
};

export enum NewModelStage {
  Name,
  Dataset,
  TrainingOptions,
  ModelOptions,
}

export default Model;
