import {Badge} from 'components/ui/badge';
import {Button} from 'components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from 'components/ui/card';
import {Input} from 'components/ui/input';
import {Label} from 'components/ui/label';
import {useAtom} from 'jotai';
import React, {useState} from 'react';
import {X} from 'react-feather';
import {cleaningOptionsAtom} from 'store';
import {CleaningOptions} from 'types/Dataset';

const ChooseCleaningOptions: React.FC = () => {
  const [cleaningOptions, setCleaningOptions] = useAtom(cleaningOptionsAtom);
  const [nextWord, setNextWord] = useState('');

  const changePunctuation =
    (type: keyof CleaningOptions) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCleaningOptions({...cleaningOptions, [type]: e.target.value});
    };

  const addWord = () => {
    const word = nextWord.trim();
    if (word !== '' && !cleaningOptions.wordsToRemove.includes(word)) {
      setCleaningOptions({
        ...cleaningOptions,
        wordsToRemove: [...cleaningOptions.wordsToRemove, word],
      });
    }
    setNextWord('');
  };

  const removeWord = (word: string) => {
    setCleaningOptions({
      ...cleaningOptions,
      wordsToRemove: cleaningOptions.wordsToRemove.filter(
        _word => word !== _word
      ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="subtitle">Choose Cleaning Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <Label htmlFor="puncRemove">Punctuation to Remove</Label>
            <Input
              id="puncRemove"
              type="text"
              value={cleaningOptions.punctuationToRemove}
              onChange={changePunctuation('punctuationToRemove')}
            />
          </div>
          <div>
            <Label htmlFor="puncExplode">Punctuation to Explode</Label>
            <Input
              id="puncExplode"
              type="text"
              value={cleaningOptions.punctuationToExplode}
              onChange={changePunctuation('punctuationToExplode')}
            />
          </div>

          <div>
            <Label htmlFor="word" className="mt-4">
              Words to Remove
            </Label>
            <div className="w-full flex gap-2 items-center">
              <Input
                id="word"
                type="text"
                value={nextWord}
                onChange={e => setNextWord(e.target.value)}
              />
              <Button onClick={addWord} className="w-32">
                Add Word
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-1">
          {cleaningOptions.wordsToRemove.map(word => (
            <Badge
              variant="secondary"
              key={word}
              onClick={() => removeWord(word)}
              className="cursor-pointer"
            >
              {word}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChooseCleaningOptions;
