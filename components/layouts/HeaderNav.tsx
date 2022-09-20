import React, { useState, useRef, useEffect, useContext } from 'react';

import { signIn, signOut, useSession } from "next-auth/react";

import { useRouter } from 'next/router';

import Dropdown from '../shared/Dropdown';
import Transition from '../shared/Transition';
import Link from "../shared/Link";
import Image from 'next/image';

interface Props {

}

const HeaderNav: React.FC<Props> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const trigger = useRef(null);
  const mobileNav = useRef(null);

  // close the mobile menu on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!mobileNav.current || !trigger.current) return;
      if (!mobileNavOpen || mobileNav.current.contains(target) || trigger.current.contains(target)) return;
      setMobileNavOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close the mobile menu if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!mobileNavOpen || keyCode !== 27) return;
      setMobileNavOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  const handleLogout = async (event) =>  {
    await signOut();
    router.push("/login");
  }

  return (
    <header className="absolute w-full z-30">
      <div className="z-50 mx-auto px-4 sm:px-6 w-full" style={{position: "fixed", top: "0", background: "aliceblue"}}>
        <div className="flex items-center justify-between h-20">

          {/* Site branding */}
          <div className="shrink-0 mr-5">
            {/* Logo */}
            <Link href="/" className="block mt-2" aria-label="Cruip">
              <Image src="/images/stamp-checkmark.png" width="36" height="36" alt="Legitimize Logo" />
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:grow">

            {/* Desktop menu links */}
            <ul className="flex grow flex-wrap items-center font-medium text-lg">
              <li>
                <Link href="/create-signature" onClick={(e) => setMobileNavOpen(false)}
                  className="desktop-nav-link">Create a Signature</Link>
              </li>

              <li>
                <Link href="/sign-nft" onClick={(e) => setMobileNavOpen(false)}
                  className="desktop-nav-link">Sign an NFT</Link>
              </li>

              <li>
                <Link href="/verify" onClick={(e) => setMobileNavOpen(false)}
                  className="desktop-nav-link">Verify</Link>
              </li>

              <li>
                <Link href="/dashboard" onClick={(e) => setMobileNavOpen(false)}
                  className="desktop-nav-link">Dashboard</Link>
              </li>
            </ul>

            {/* Desktop CTA on the right */}
            <ul className="flex justify-end flex-wrap items-center">
              <li>
                {( (session) ?
                  <Link href="#" onClick={handleLogout} className="btn-sm text-white bg-legitBlue-500 hover:bg-legitBlue-400 ml-6 drop-shadow-lg">
                    Disconnect Wallet
                  </Link>
                  :
                  <Link href="/login" className="btn-sm text-white bg-legitBlue-500 hover:bg-legitBlue-400 ml-6 drop-shadow-lg">
                    Connect Wallet
                  </Link>
                )}
              </li>
            </ul>

          </nav>

          {/* Mobile menu */}
          <div className="inline-flex md:hidden">

            {/* Hamburger button */}
            <button ref={trigger} className={`hamburger ${mobileNavOpen && 'active'}`} aria-controls="mobile-nav" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(!mobileNavOpen)}>
              <span className="sr-only">Menu</span>
              <svg className="w-6 h-6 fill-current text-gray-900 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition duration-150 ease-in-out" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect y="4" width="24" height="2" rx="1" />
                <rect y="11" width="24" height="2" rx="1" />
                <rect y="18" width="24" height="2" rx="1" />
              </svg>
            </button>

            {/*Mobile navigation */}
            <Transition
              show={mobileNavOpen}
              appear={true}
              tag="ul"
              className="fixed top-0 h-screen z-20 left-0 w-full max-w-sm -ml-16 overflow-scroll bg-white dark:bg-gray-900 shadow-lg"
              enter="transition ease-out duration-200 transform"
              enterStart="opacity-0 -translate-x-full"
              enterEnd="opacity-100 translate-x-0"
              leave="transition ease-out duration-200"
              leaveStart="opacity-100"
              leaveEnd="opacity-0"
            >
              <nav id="mobile-nav" ref={mobileNav} className="fixed top-0 h-screen z-20 left-0 w-full max-w-sm -ml-16 overflow-scroll bg-white dark:bg-gray-900 shadow-lg no-scrollbar">
                <div className="py-6 pr-4 pl-20">

                  {/* Mobile Links */}
                  <ul>
                    <li>
                      <Link href="/create-signature" onClick={(e) => setMobileNavOpen(false)} className="mobile-nav-link">Create</Link>
                    </li>
                    <li>
                      <Link href="/sign-nft" onClick={(e) => setMobileNavOpen(false)} className="mobile-nav-link">Sign</Link>
                    </li>
                    <li>
                      <Link href="/verify" onClick={(e) => setMobileNavOpen(false)} className="mobile-nav-link">Verify</Link>
                    </li>

                    <li>
                      <Link href="/dashboard" onClick={(e) => setMobileNavOpen(false)} className="mobile-nav-link">Dashboard</Link>
                    </li>

                    <li>
                      {( (session) ?
                        <Link href="#" onClick={(e) => {setMobileNavOpen(false); handleLogout(e);}} className="font-medium w-full inline-flex items-center justify-center border border-transparent px-4 py-2 my-2 rounded text-white bg-legitBlue-500 hover:bg-legitBlue-400 transition duration-150 ease-in-out">Disconnect Wallet</Link>
                        :
                        <Link href="/login" onClick={(e) => setMobileNavOpen(false)} className="font-medium w-full inline-flex items-center justify-center border border-transparent px-4 py-2 my-2 rounded text-white bg-legitBlue-500 hover:bg-legitBlue-400 transition duration-150 ease-in-out">Connect Wallet</Link>
                      )}
                    </li>
                  </ul>
                </div>
              </nav>
            </Transition>

          </div>

        </div>
      </div>
    </header>
  )
}

export default HeaderNav;
