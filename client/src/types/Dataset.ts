export enum DatasetStage {
  AddFiles,
  CleaningOptions,
  ElanOptions,
  Name,
}

export type Dataset = {
  name: string;
  files: string[];
  cleaningOptions: CleaningOptions;
  elanOptions?: ElanOptions;
};

export type CleaningOptions = {
  punctuationToRemove: string;
  punctuationToExplode: string;
  wordsToRemove: string[];
};

export type ElanOptions = {
  selectionMechanism: ElanTierSelector;
  selectionValue: string;
};

export enum ElanTierSelector {
  Order = 'tier_order',
  Name = 'tier_name',
  Type = 'tier_type',
}

export default Dataset;
