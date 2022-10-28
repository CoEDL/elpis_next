import {atom} from 'jotai';
import {
  Dataset,
  CleaningOptions,
  ElanOptions,
  ElanTierSelector,
} from 'types/Dataset';
import TrainingStage from 'types/TrainingStage';

export const trainingStageAtom = atom(TrainingStage.CreateDataset);
export const activeStageAtom = atom(TrainingStage.CreateDataset);

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

export const datasetsAtom = atom<Dataset[]>([]);
export const filesAtom = atom<File[]>([]);
export const elanOptionsAtom = atom<ElanOptions>(DEFAULT_ELAN_OPTIONS);
export const cleaningOptionsAtom = atom<CleaningOptions>(
  DEFAULT_CLEANING_OPTONS
);
export const datasetNameAtom = atom<string>('Dataset');
