/**
 * A type which provides some optional defaults, readable names, and descriptions
 * for usage in forms.
 */
export type KeyInfo<T> = {
  [Property in keyof Partial<T>]: {
    default?: T[Property];
    name?: string;
    advanced?: boolean;
    description?: string;
  };
};
