import {Card, CardContent, CardHeader, CardTitle} from 'components/ui/card';
import {Input} from 'components/ui/input';
import {Label} from 'components/ui/label';
import {useAtom} from 'jotai';
import React from 'react';
import {datasetNameAtom} from 'store';

export default function ChooseDatasetName() {
  const [name, setName] = useAtom(datasetNameAtom);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Dataset Name</CardTitle>
      </CardHeader>
      <CardContent>
        <Label>Name</Label>
        <Input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="rounded"
        />
      </CardContent>
    </Card>
  );
}
