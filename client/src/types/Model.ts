export const BASE_MODEL = 'facebook/wav2vec2-base-960h';
export const DEFAULT_TRAINING_OPTIONS: TrainingOptions = {
  batchSize: 4,
  epochs: 2,
  learningRate: 1e-4,
  minDuration: 0,
  maxDuration: 60,
  wordDelimiterToken: ' ',
  testSize: 0.2,
  freezeFeatureExtractor: true,
};

export enum TrainingStatus {
  Waiting = 'waiting',
  Training = 'training',
  Finished = 'finished',
  Error = 'error',
}

export type TrainingOptions = {
  batchSize?: number;
  epochs?: number;
  learningRate?: number;
  minDuration?: number;
  maxDuration?: number;
  wordDelimiterToken?: string;
  testSize?: number;
  freezeFeatureExtractor?: boolean;
};

export type Model = {
  modelName: string;
  datasetName?: string;
  options?: TrainingOptions;
  status?: TrainingStatus;
  baseModel?: string;
  samplingRate?: number;
};

export enum NewModelStage {
  Name,
  Dataset,
  TrainingOptions,
  ModelOptions,
}

export default Model;
