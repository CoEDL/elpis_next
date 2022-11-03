export const AUDIO_FORMATS = ['.wav'];
export const TRANSCRIPTION_FORMATS = ['.eaf', '.txt'];

export enum FileType {
  Audio,
  Transcription,
  Unsupported,
}

export const extensions = new Map<FileType, string[]>([
  [FileType.Audio, AUDIO_FORMATS],
  [FileType.Transcription, TRANSCRIPTION_FORMATS],
]);

export const isValidForDataset = (fileNames: string[]): boolean => {
  if (fileNames.length === 0) return false;
  if (fileNames.length % 2 !== 0) return false;
  return fileNames.every(name => hasMatch(name, fileNames));
};

export const parseFileType = (fileName: string): FileType => {
  if (AUDIO_FORMATS.some(extension => fileName.endsWith(extension))) {
    return FileType.Audio;
  }
  if (TRANSCRIPTION_FORMATS.some(extension => fileName.endsWith(extension))) {
    return FileType.Transcription;
  }
  return FileType.Unsupported;
};

export const hasMatch = (fileName: string, fileNames: string[]): boolean => {
  const fileType = parseFileType(fileName);
  if (fileType === FileType.Unsupported) return false;

  const matchingType =
    fileType === FileType.Transcription
      ? FileType.Audio
      : FileType.Transcription;

  const prefix = fileName.split('.').slice(0, -1).join('.');
  const potentialNames = (extensions.get(matchingType) ?? []).map(
    extension => prefix + extension
  );

  return fileNames.some(name => potentialNames.includes(name));
};
