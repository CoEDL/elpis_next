import {Button} from 'components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'components/ui/card';
import {Input} from 'components/ui/input';
import {Label} from 'components/ui/label';
import {useAtom} from 'jotai';
import React, {useState} from 'react';
import {newModelAtom, newModelStageAtom} from 'store';
import {NewModelStage} from 'types/Model';

export default function ChooseModelName() {
  const [model, setModel] = useAtom(newModelAtom);
  const [, setStage] = useAtom(newModelStageAtom);
  const [name, setName] = useState('Model name');

  const save = () => {
    setModel({...model, modelName: name});
    setStage(NewModelStage.Dataset);
  };

  const hasName = name !== '';
  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Model Name</CardTitle>
      </CardHeader>

      <CardContent>
        <Label htmlFor="modelName">Name</Label>
        <Input
          type="text"
          id="modelName"
          value={name}
          onChange={e => setName(e.target.value)}
          className="rounded"
        />
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Button variant="outline" disabled>
          Back
        </Button>
        <Button className="button" disabled={!hasName} onClick={save}>
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}
