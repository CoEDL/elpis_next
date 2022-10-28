import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

type Props = {
  type: 'short' | 'long' | 'text';
  className?: string;
};

export default function Logo({type = 'long', className}: Props) {
  const getSrc = () => {
    switch (type) {
      case 'short':
        return '/logo.svg';
      case 'long':
        return '/logo.png';
      case 'text':
        return '/logo.png';
    }
  };

  return (
    <div className="relative w-32 h-12">
      <Link href="/">
        <a>
          <Image
            className={className}
            src={getSrc()}
            layout="fill"
            objectFit="contain"
            alt="Beds with Benefits logo"
          />
        </a>
      </Link>
    </div>
  );
}
