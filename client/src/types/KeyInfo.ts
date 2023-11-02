import {ObjEntry, ObjPred, mapObj, pickWhere} from 'lib/manipulate';

/**
 * A type which provides some optional defaults, readable names, and descriptions
 * for usage in forms.
 */
export type KeyInfo<T extends object> = {
  [Property in keyof Partial<T>]: {
    default?: T[Property];
    name?: string;
    advanced?: boolean;
    description?: string;
  };
};

export const getDefaults = <T extends object>(info: KeyInfo<T>): Partial<T> => {
  const hasDefault: ObjPred<KeyInfo<T>> = (_, v) => v.default !== undefined;
  const withDefaults = pickWhere<typeof info>(hasDefault, info);
  const defaults = mapObj(
    ([k, v]) => [k, v!.default],
    withDefaults
  ) as ObjEntry<T>[];
  return Object.fromEntries(defaults) as Partial<T>;
};
