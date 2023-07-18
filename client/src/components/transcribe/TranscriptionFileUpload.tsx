import React from 'react';
import FileUpload from 'components/FileUpload';
import {transcriptionFilesAtom} from 'store';
import {useAtom} from 'jotai';
import {Check, X, Trash2} from 'react-feather';
import {FileType, parseFileType} from 'lib/dataset';
import colours from 'lib/colours';
import {Button} from 'components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'components/ui/card';
import DataTable, {Section} from 'components/DataTable';

export default function TranscriptionFileUpload() {
  const [files, setFiles] = useAtom(transcriptionFilesAtom);

  const removeUnsupported = () =>
    setFiles(files.filter(file => parseFileType(file.name) === FileType.Audio));

  const sections: Section<File>[] = [
    {name: 'File Name', display: file => file.name},
    {
      name: 'Is Valid',
      display: file =>
        parseFileType(file.name) === FileType.Audio ? (
          <Check color={colours.success} />
        ) : (
          <X color={colours.warning} />
        ),
    },
    {
      name: 'Delete',
      display: (_, index) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setFiles(files.filter((_, _index) => index !== _index))
          }
        >
          <Trash2 color={colours.delete} />
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Transcription Files</CardTitle>
        <CardDescription>Some description.</CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload callback={_files => setFiles([...files, ..._files])} />
        {files.length > 0 && (
          <>
            <section className="space-y-4 mt-8">
              <p className="font-bold">Uploaded files</p>
              <div className="flex space-x-2 items-center">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setFiles([])}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={removeUnsupported}
                  disabled={
                    files.filter(
                      file => parseFileType(file.name) !== FileType.Audio
                    ).length === 0
                  }
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Unsupported Files
                </Button>
              </div>
              <DataTable data={files} sections={sections} />
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}
