import Hamburger from 'components/Hamburger';
import Link from 'next/link';
import React from 'react';
import MenuLink from 'types/menuLink';
import Logo from './Logo';

type Props = {
  open: boolean;
  close(): void;
  urls: MenuLink[];
};

export default function SideBar({open, close, urls}: Props) {
  if (!open) return <div></div>;
  return (
    <div className="fixed top-0 left-0 z-50 flex h-full w-full">
      <div className="w-full bg-bgSecondary text-gray-700">
        <div className="container flex h-24 items-center justify-between">
          <div>
            <Logo type="text" className="h-20 cursor-pointer" />
          </div>
          <div className="flex w-16 items-center justify-end">
            <Hamburger isOpen={open} setOpen={() => close()} />
          </div>
        </div>
        <nav className="mt-10">
          <ul className="flex flex-col items-center justify-center">
            {[...urls].map(({url, name}) => (
              <Link href={url} key={url}>
                <a>
                  <li
                    className="cursor-pointer p-4 font-display text-2xl text-white"
                    onClick={close}
                  >
                    {name}
                  </li>
                </a>
              </Link>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
