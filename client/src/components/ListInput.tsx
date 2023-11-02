import React, {FC, useState} from 'react';
import {Badge} from './ui/badge';
import {Button} from './ui/button';
import {Input, InputProps} from './ui/input';

type ListInputProps = {
  value?: string[];
  buttonText?: string;
  onAdd: (word: string) => void;
  onRemove: (word: string) => void;
};

const ListInput: FC<ListInputProps & Omit<InputProps, 'value'>> = ({
  value = [],
  buttonText,
  onAdd,
  onRemove,
  ...rest
}) => {
  const [word, setWord] = useState<string>('');

  const addWord = () => {
    if (word.length === 0) return;
    if (value.includes(word)) return;
    onAdd(word);
    setWord('');
  };

  const removeWord = (word: string) => {
    if (!value.includes(word)) return;
    onRemove(word);
  };

  return (
    <div>
      <div className="flex items-center space-x-2">
        <Input {...rest} value={word} onChange={e => setWord(e.target.value)} />
        <Button onClick={addWord} type="button" className="flex-shrink-0">
          {buttonText ?? 'Add'}
        </Button>
      </div>
      <div className="mt-2 space-x-1">
        {value.map(word => (
          <Badge
            key={word}
            variant="secondary"
            onClick={() => removeWord(word)}
            className="cursor-pointer"
          >
            {word}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ListInput;
