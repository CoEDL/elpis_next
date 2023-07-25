import FileDropper from 'components/FileUpload';
import {useAtom} from 'jotai';
import React, {useMemo} from 'react';
import {filesAtom} from 'store';
import {Trash2, Check, X, AlertTriangle} from 'react-feather';
import {FileType, hasMatch, parseFileType} from 'lib/dataset';
import colours from 'lib/colours';
import {Card, CardContent, CardHeader, CardTitle} from 'components/ui/card';
import DataTable, {Section} from 'components/DataTable';
import {Button} from 'components/ui/button';

type DatasetFile = {
  file: File;
  type: string;
};

const DatasetFiles: React.FC = () => {
  const [files, setFiles] = useAtom(filesAtom);
  const fileNames = useMemo(() => files.map(file => file.name), [files]);

  const fileTypes: FileType[] = [
    FileType.Audio,
    FileType.Transcription,
    FileType.Unsupported,
  ];
  const [audioFiles, transcriptionFiles, unsupportedFiles] = fileTypes.map(
    type => files.filter(file => parseFileType(file.name) === type)
  );

  const deleteFile = (name: string) =>
    setFiles(files.filter(file => file.name !== name));

  const deleteMismatchedFiles = () => {
    setFiles(files.filter(file => hasMatch(file.name, fileNames)));
  };

  const hasMismatchedFiles = useMemo(() => {
    return files.some(file => !hasMatch(file.name, fileNames));
  }, [files, fileNames]);

  const data = [
    ...transcriptionFiles.map(file => ({file, type: 'Transcription'})),
    ...audioFiles.map(file => ({file, type: 'Audio'})),
  ];

  const sections: Section<DatasetFile>[] = [
    {name: 'File name', display: item => item.file.name},
    {name: 'Type', display: item => item.type},
    {
      name: 'Has match',
      display: item =>
        hasMatch(item.file.name, fileNames) ? (
          <Check color={colours.success} />
        ) : (
          <X color={colours.warning} />
        ),
    },
    {
      name: 'Delete',
      display: item => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteFile(item.file.name)}
        >
          <Trash2 color={colours.delete} />
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Dataset Files</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileDropper callback={_files => setFiles([...files, ..._files])} />
        {hasMismatchedFiles && (
          <Button size="sm" variant="outline" onClick={deleteMismatchedFiles}>
            Delete Mismatched Files
          </Button>
        )}
        {files.length > 0 && <DataTable data={data} sections={sections} />}

        {unsupportedFiles.length > 0 && (
          <div className="mt-4 p-4 border border-orange-300 rounded space-y-4">
            <div className="flex space-x-2">
              <AlertTriangle color={colours.warning}></AlertTriangle>
              <p className="text-amber-500 font-bold">Unsupported Files</p>
            </div>
            <div className="mt-2 flex text-sm">
              {unsupportedFiles.map(file => (
                <code key={file.name}>{file.name}</code>
              ))}
            </div>
            <Button
              className="mt-2"
              variant="destructive"
              onClick={() =>
                unsupportedFiles.forEach(file => deleteFile(file.name))
              }
            >
              Delete all Unsupported
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatasetFiles;
