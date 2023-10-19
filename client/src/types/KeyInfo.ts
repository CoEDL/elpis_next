import {ObjPred, pickWhere} from 'lib/manipulate';
import * as R from 'ramda';

/**
 * A type which provides some optional defaults, readable names, and descriptions
 * for usage in forms.
 */
export type KeyInfo<T extends Object> = {
  [Property in keyof Partial<T>]: {
    default?: T[Property];
    name?: string;
    advanced?: boolean;
    description?: string;
  };
};

export const getDefaults = <T extends Object>(info: KeyInfo<T>): Partial<T> => {
  const hasDefault: ObjPred<KeyInfo<T>> = (_, v) => v.default !== undefined;
  const withDefaults = pickWhere<KeyInfo<T>>(hasDefault, info);
  return R.map(v => v.default, withDefaults);
};
