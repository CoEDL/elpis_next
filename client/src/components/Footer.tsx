import navLinks from 'lib/navLinks';
import Link from 'next/link';
import React from 'react';
import Logo from './Logo';
import ResetButton from './ResetButton';

const LINK_STYLE = 'font-display hover:underline';

export default function Footer() {
  return (
    <div className="bg-black">
      <div className="container flex flex-col md:flex-row items-center justify-between py-4 text-gray-400">
        <LogoSection className="mb-4 h-12 w-24" />

        <div className="flex flex-col space-y-2">
          <small className="text-center">©2022, CoEDL</small>
          <ResetButton />
        </div>
        <NavSection />
      </div>
    </div>
  );
}

type LogoProps = {
  className?: string;
};

const LogoSection = ({className}: LogoProps) => (
  <div className="flex flex-col">
    <Logo type="text" className={className} />
  </div>
);

const NavSection = () => {
  return (
    <nav>
      <ul>
        {navLinks.map(({url, name}) => (
          <li key={url}>
            <Link href={url}>
              <a className={LINK_STYLE}>{name}</a>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
