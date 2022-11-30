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
    <div className="section">
      <h2 className="subtitle">Choose Elan Options</h2>

      <div className="mt-4 space-y-2">
        <div className="space-x-2">
          <label htmlFor="selectionMechanism">Selection Mechanism:</label>
          <select
            className="rounded"
            name="selectionMechanism"
            id="selectionMechanism"
            value={elanOptions.selectionMechanism}
            onChange={e => {
              const mechanism = e.target.value as ElanTierSelector;
              setElanOptions({
                selectionMechanism: mechanism,
                selectionValue: DEFAULT_VALUES.get(mechanism) ?? 'Phrase',
              });
            }}
          >
            {[
              ElanTierSelector.Name,
              ElanTierSelector.Order,
              ElanTierSelector.Type,
            ].map(selector => (
              <option key={selector} value={selector}>
                {selector}
              </option>
            ))}
          </select>
        </div>
        <div className="space-x-2">
          <label htmlFor="selectionValue">Selection Value*:</label>
          <input
            className="rounded"
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
      </div>
    </div>
  );
};

export default ChooseElanOptions;
