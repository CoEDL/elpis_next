import React, {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Prose({children, className}: Props) {
  return (
    <div className={'prose max-w-none lg:prose-xl ' + className ?? ''}>
      {children}
    </div>
  );
}
