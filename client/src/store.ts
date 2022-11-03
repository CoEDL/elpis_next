import {atom} from 'jotai';
import {atomWithReset} from 'jotai/utils';
import {
  Dataset,
  CleaningOptions,
  ElanOptions,
  ElanTierSelector,
} from 'types/Dataset';
import TrainingStage from 'types/TrainingStage';

export const trainingStageAtom = atomWithReset(TrainingStage.CreateDataset);
export const activeStageAtom = atomWithReset(TrainingStage.CreateDataset);

// Datasets
const DEFAULT_ELAN_OPTIONS: ElanOptions = {
  selectionMechanism: ElanTierSelector.Name,
  selectionValue: 'Phrase',
};
const DEFAULT_CLEANING_OPTONS: CleaningOptions = {
  punctuationToRemove: '',
  punctuationToExplode: '',
  wordsToRemove: [],
};
const DEFAULT_DATASET_NAME = 'Dataset';

export const datasetsAtom = atom<Dataset[]>([]);
export const filesAtom = atomWithReset<File[]>([]);
export const elanOptionsAtom = atomWithReset<ElanOptions>(DEFAULT_ELAN_OPTIONS);
export const cleaningOptionsAtom = atomWithReset<CleaningOptions>(
  DEFAULT_CLEANING_OPTONS
);
export const datasetNameAtom = atomWithReset<string>(DEFAULT_DATASET_NAME);
export const selectedDataset = atom<Dataset | null>(null);
