import {KeyInfo} from 'types/KeyInfo';
import * as R from 'ramda';

import Model, {
  DataArguments,
  ModelArguments,
  RawModel,
  TrainingArguments,
} from 'types/Model';
import {omit, pick} from './manipulate';

export const BASE_MODEL = 'facebook/wav2vec2-base';
export const DEFAULT_MODEL_ARGS: KeyInfo<ModelArguments> = {
  modelNameOrPath: {
    name: 'Model Name',
    default: BASE_MODEL,
    description: 'Path to model identifier from huggingface.co/models',
  },
  tokenizerNameOrPath: {
    name: 'Tokenizer Name',
    advanced: true,
  },
  freezeFeatureEncoder: {
    default: true,
    advanced: true,
  },
  attentionDropout: {
    default: 0.0,
    advanced: true,
  },
  activationDropout: {
    default: 0.0,
    advanced: true,
  },
  featProjDropout: {
    default: 0.0,
    advanced: true,
  },
  hiddenDropout: {
    default: 0.0,
    advanced: true,
  },
  finalDropout: {
    default: 0.0,
    advanced: true,
  },
  maskTimeProb: {
    default: 0.05,
    advanced: true,
  },
  maskTimeLength: {
    default: 10,
    advanced: true,
  },
  maskFeatureProb: {
    default: 0.0,
    advanced: true,
  },
  maskFeatureLength: {
    default: 10,
    advanced: true,
  },
  layerdrop: {
    default: 0.0,
    advanced: true,
  },
  ctcLossReduction: {
    default: 'mean',
    advanced: true,
  },
  ctcZeroInfinity: {
    default: false,
    advanced: true,
  },
};

export const DEFAULT_DATA_ARGS: KeyInfo<DataArguments> = {
  datasetNameOrPath: {
    name: 'Dataset Name',
    description:
      'The name of the dataset on which to train. Can be a local dataset or from huggingface',
  },
  trainSplitName: {
    default: 'train',
  },
  evalSplitName: {
    default: 'test',
  },
  audioColumnName: {
    default: 'audio',
  },
  textColumnName: {
    default: 'text',
  },
  maxTrainSamples: {},
  maxEvalSamples: {},
  doClean: {
    default: true,
    description: 'True iff the dataset should be cleaned before use.',
  },
  wordsToRemove: {},
  charsToRemove: {},
  charsToExplode: {
    advanced: true,
    description: 'Characters to replace with spaces in the training dataset.',
  },
  doLowerCase: {},
  evalMetrics: {
    default: ['wer', 'cer'],
  },
  maxDurationInSeconds: {
    default: 20,
  },
  minDurationInSeconds: {
    default: 0,
  },
  token: {},
  unkToken: {
    default: '[UNK]',
  },
  padToken: {
    default: '[PAD]',
  },
  wordDelimiterToken: {
    default: ' ',
  },
  phonemeLanguage: {
    advanced: true,
  },
};

export const DEFAULT_TRAINING_ARGS: KeyInfo<TrainingArguments> = {
  numTrainEpochs: {
    default: 20,
  },
  learningRate: {
    default: 3e-4,
  },
  weightDecay: {
    advanced: true,
  },
  perDeviceTrainBatchSize: {
    default: 16,
  },
  perDeviceEvalBatchSize: {
    default: 8,
  },
  gradientAccumulationSteps: {
    default: 1,
    advanced: true,
  },
  seed: {
    default: 42,
  },
  evaluationStrategy: {
    default: 'steps',
    advanced: true,
  },
  loggingStrategy: {
    default: 'steps',
    advanced: true,
  },
  saveStrategy: {
    default: 'steps',
    advanced: true,
  },
  maxSteps: {
    advanced: true,
  },
  warmupSteps: {
    advanced: true,
  },
  loggingSteps: {
    advanced: true,
  },
  evalSteps: {
    advanced: true,
  },
  saveSteps: {
    advanced: true,
  },
  saveTotalLimit: {
    advanced: true,
    default: 2,
  },
  greaterIsBetter: {
    advanced: true,
    default: true,
  },
  pushToHub: {
    advanced: true,
    default: false,
  },
  dataloaderDropLast: {
    advanced: true,
    default: true,
  },
} as const;

export const serializeModel = (model: Model) => {
  const {name, status, trainingArgs, dataArgs, modelArgs} = model;
  const job = {...trainingArgs, ...dataArgs, ...modelArgs};
  return {
    name,
    job,
    status,
  };
};

const extractModelArgs = R.partial(pick, Object.keys(DEFAULT_MODEL_ARGS));
const extractDataArgs = R.partial(pick, Object.keys(DEFAULT_DATA_ARGS));
const extractTrainingArgs = R.partial(pick, Object.keys(DEFAULT_TRAINING_ARGS));

export const deserializeModel = (raw: RawModel): Model => {
  const modelArgs = extractModelArgs(raw.job) as ModelArguments;
  const dataArgs = extractDataArgs(raw.job) as DataArguments;
  const trainingArgs = extractTrainingArgs(raw.job) as TrainingArguments;

  return {
    ...(omit(['job'], raw) as Omit<RawModel, 'job'>),
    modelArgs,
    dataArgs,
    trainingArgs,
  };
};
