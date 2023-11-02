import * as R from 'ramda';

export const t = R.always(true);

export type ObjEntry<T> = [k: keyof T, v: T[keyof T]];

/**
 * A predicate function to run on a (key, value) item within an object.
 */
export type ObjPred<T> = (k: keyof T, v: T[keyof T]) => boolean;

export const pickWhere = <T>(
  pred: ObjPred<T>,
  mother: Readonly<T>
): Partial<T> => {
  const filterEntries = R.filter(([k, v]: ObjEntry<T>) => pred(k, v));
  const entries = filterEntries(Object.entries(mother) as ObjEntry<T>[]);
  const entryToObject = ([k, v]: ObjEntry<T>) => R.objOf(k as string, v);
  const merge = R.reduce(R.mergeRight, {});
  return merge(R.map(entryToObject, entries));
};

/**
 * Returns a copy of the object, only containing the specified keys.
 */
export const pick = <T extends object>(
  keys: (keyof T)[],
  mother: Readonly<T>
) => pickWhere(k => keys.includes(k), mother);

/**
 * Opposite of @see pick, returns an object without the supplied keys
 */
export const omit = <T extends object>(keys: (keyof T)[], mother: T) =>
  pickWhere(k => !keys.includes(k), mother);

export const mapObj = <A extends object, B>(
  f: (entry: ObjEntry<A>) => B,
  m: A
) => {
  const entries = Object.entries(m) as ObjEntry<A>[];
  return entries.map(f);
};
