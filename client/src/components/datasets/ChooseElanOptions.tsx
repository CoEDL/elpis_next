import {Card, CardContent, CardHeader, CardTitle} from 'components/ui/card';
import {Input} from 'components/ui/input';
import {Label} from 'components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from 'components/ui/select';
import {useAtom} from 'jotai';
import React from 'react';
import {elanOptionsAtom, filesAtom} from 'store';
import {ElanTierSelector} from 'types/Dataset';

const DEFAULT_VALUES = new Map<ElanTierSelector, string>([
  [ElanTierSelector.Order, '1'],
  [ElanTierSelector.Name, 'Phrase'],
  [ElanTierSelector.Type, 'default-lt'],
]);

const ChooseElanOptions: React.FC = () => {
  const [files] = useAtom(filesAtom);
  const [elanOptions, setElanOptions] = useAtom(elanOptionsAtom);

  // Require some elan files before displaying
  if (!files.some(file => file.name.endsWith('.eaf'))) {
    return <></>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Elan Options</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        <div>
          <Label htmlFor="selectionMechanism">Selection Mechanism</Label>
          <Select
            value={elanOptions.selectionMechanism}
            onValueChange={value => {
              const mechanism = value as ElanTierSelector;
              setElanOptions({
                selectionMechanism: mechanism,
                selectionValue: DEFAULT_VALUES.get(mechanism) ?? 'Phrase',
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Selection Mechanisms</SelectLabel>
                {[
                  ElanTierSelector.Name,
                  ElanTierSelector.Order,
                  ElanTierSelector.Type,
                ].map(selector => (
                  <SelectItem key={selector} value={selector}>
                    {selector}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="selectionValue">Selection Value</Label>
          <Input
            type={
              elanOptions.selectionMechanism === ElanTierSelector.Order
                ? 'number'
                : 'text'
            }
            min={1}
            id="selectionValue"
            value={elanOptions.selectionValue}
            onChange={e =>
              setElanOptions({...elanOptions, selectionValue: e.target.value})
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ChooseElanOptions;
