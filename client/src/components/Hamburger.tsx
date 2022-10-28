import React from 'react';

type Props = {
  isOpen: boolean;
  setOpen(open: boolean): void;
};

export default function Hamburger({isOpen, setOpen}: Props) {
  const line =
    'absolute block h-px w-6 transform bg-current transition duration-500 ease-in-out rounded-sm ';

  return (
    <button
      className={`relative h-10 w-10 text-${
        isOpen ? 'white' : 'gray-700'
      } focus:outline-none`}
      onClick={() => setOpen(!isOpen)}
    >
      <span className="sr-only">Open main menu</span>
      <div className="absolute left-1/2 top-1/2 block w-5 -translate-x-1/2 -translate-y-1/2 transform">
        <span
          aria-hidden="true"
          className={line + (isOpen ? 'rotate-45' : '-translate-y-1.5')}
        ></span>
        <span
          aria-hidden="true"
          className={line + (isOpen && 'opacity-0')}
        ></span>
        <span
          aria-hidden="true"
          className={line + (isOpen ? '-rotate-45' : 'translate-y-1.5')}
        ></span>
      </div>
    </button>
  );
}
