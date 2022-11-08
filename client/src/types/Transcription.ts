export enum TranscriptionStatus {
  Waiting = 'waiting',
  Transcribing = 'transcribing',
  Finished = 'finished',
  Error = 'error',
}

export type Transcription = {
  modelLocation: string;
  audioName: string;
  isLocal: boolean;
  status: TranscriptionStatus;
};

export default Transcription;
