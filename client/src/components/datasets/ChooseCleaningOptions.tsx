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
    <div className="p-4 border rounded">
      <h2 className="text-xl">Choose Cleaning Options</h2>

      <div className="mt-4 space-y-2">
        <div className="space-x-2">
          <label htmlFor="puncRemove">Punctuation to Remove:</label>
          <input
            id="puncRemove"
            className="rounded"
            type="text"
            value={cleaningOptions.punctuationToRemove}
            onChange={changePunctuation('punctuationToRemove')}
          />
        </div>
      </div>
      <div className="space-x-2 mt-2">
        <label htmlFor="puncExplode">Punctuation to Explode:</label>
        <input
          id="puncExplode"
          className="rounded"
          type="text"
          value={cleaningOptions.punctuationToExplode}
          onChange={changePunctuation('punctuationToExplode')}
        />
      </div>

      <p className="mt-4 font-semibold">Words to Remove</p>
      <div className="space-x-2 mt-2">
        <label htmlFor="word">Add Word: </label>
        <input
          id="word"
          className="rounded"
          type="text"
          value={nextWord}
          onChange={e => setNextWord(e.target.value)}
        />
        <button className="button" onClick={addWord}>
          Add
        </button>
      </div>
      <div className="mt-4 flex gap-1">
        {cleaningOptions.wordsToRemove.map(word => (
          <div key={word} className="border p-1 rounded flex space-x-2">
            <p>{word}</p>
            <button onClick={() => removeWord(word)}>
              <X />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChooseCleaningOptions;
