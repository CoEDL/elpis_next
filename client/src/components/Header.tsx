import React, {useState} from 'react';
import Link from 'next/link';
import Hamburger from 'components/Hamburger';
import Logo from 'components/Logo';
import SideBar from 'components/Sidebar';
import navLinks from 'lib/navLinks';

type Props = {
  className?: string;
};

function Header({className = ''}: Props) {
  const [sideBarOpen, setSideBarOpen] = useState(false);

  return (
    <div className={'z-50 h-24 ' + (className ?? 'bg-transparent')}>
      <nav className="container flex h-full items-center justify-between text-gray-700">
        <Logo type="text" className="h-12 cursor-pointer" />

        <div className="flex w-16 items-center justify-end md:hidden">
          <Hamburger isOpen={sideBarOpen} setOpen={setSideBarOpen} />
        </div>

        {/* Right Menu */}
        <div className="hidden items-center space-x-2 md:flex">
          <ul className="flex text-gray-800">
            {navLinks.map(({name, url}) => (
              <Link key={name} href={url}>
                <a
                  className={
                    'cursor-pointer px-4 decoration-secondary decoration-2 ' +
                    'font-display underline-offset-2 first:pl-0 hover:underline'
                  }
                >
                  {name}
                </a>
              </Link>
            ))}
          </ul>
        </div>
      </nav>
      <SideBar
        open={sideBarOpen}
        close={() => setSideBarOpen(false)}
        urls={navLinks}
      />
    </div>
  );
}

export default Header;
