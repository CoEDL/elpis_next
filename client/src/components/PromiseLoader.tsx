import React, {useEffect, useState} from 'react';

type Props<T> = {
  promise: Promise<T>;
  onResolve(promise: T): React.ReactElement;
  loader?: React.ReactElement;
};

export default function PromiseLoader<T>({
  promise,
  onResolve,
  loader,
}: Props<T>) {
  const [result, setResult] = useState<T>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    promise.then((result: T) => {
      setResult(result);
      setLoaded(true);
    });
  }, []);

  return loaded ? onResolve(result!) : loader ?? <></>;
}
