import {ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const capitalise = (word: string) => {
  if (word.length === 0) return word;
  return word[0].toUpperCase() + word.slice(1);
};
