import React, { useState, useRef, useEffect, useContext } from 'react';

import { signIn, signOut, useSession } from "next-auth/react";

import { useRouter } from 'next/router';

import Dropdown from '../shared/Dropdown';
import Transition from '../shared/Transition';
import Link from "../shared/Link";

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

  // Handle light modes
  const [darkMode, setDarkMode] = useState(() => {
    const dark = typeof window !== "undefined" ? localStorage.getItem('dark-mode') : true;
    if (dark === null) {
      return true;
    } else {
      return dark === 'true';
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem('dark-mode', darkMode ? 'true' : 'false')
    }

    if (darkMode) {
      document.querySelector('html').classList.add('dark');
    } else {
      document.querySelector('html').classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = async (event) =>  {
    await signOut();
    router.push("/login");
  }

  return (
    <header className="absolute w-full z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">

          {/* Site branding */}
          <div className="shrink-0 mr-5">
            {/* Logo */}
            <Link href="/" className="block" aria-label="Cruip">
              <svg className="w-8 h-8" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient x1="26%" y1="100%" x2="100%" y2="100%" id="logo_a">
                    <stop stopColor="#3ABAB4" offset="0%" />
                    <stop stopColor="#7F9CF5" offset="100%" />
                  </linearGradient>
                  <linearGradient x1="26%" y1="100%" x2="100%" y2="100%" id="logo_b">
                    <stop stopColor="#3ABAB4" offset="0%" />
                    <stop stopColor="#3ABAB4" stopOpacity="0" offset="100%" />
                  </linearGradient>
                </defs>
                <path d="M32 16h-8a8 8 0 10-16 0H0C0 7.163 7.163 0 16 0s16 7.163 16 16z" fill="url(#logo_a)" />
                <path d="M32 16c0 8.837-7.163 16-16 16S0 24.837 0 16h8a8 8 0 1016 0h8z" fill="url(#logo_b)" />
              </svg>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:grow">

            {/* Desktop menu links */}
            <ul className="flex grow flex-wrap items-center font-medium">
              <li>
                <Link href="/dashboard" onClick={(e) => setMobileNavOpen(false)}
                  className="desktop-nav-link">Dashboard</Link>
              </li>

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

              {/* 1st level: hover */}
              <Dropdown title="Resources">
                {/* 2nd level: hover */}
                <li>
                  <Link href="/help" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-500 flex py-2 px-4 leading-tight">Help center</Link>
                </li>
                <li>
                  <Link href="/docs" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-500 flex py-2 px-4 leading-tight">Documentation</Link>
                </li>
              </Dropdown>
            </ul>

            {/* Desktop lights switch */}
            <div className="form-switch flex flex-col justify-center ml-3">
              <input type="checkbox" name="light-switch" id="light-switch-desktop" className="light-switch sr-only" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              <label className="relative" htmlFor="light-switch-desktop">
                <span className="relative bg-gradient-to-t from-gray-100 to-white dark:from-gray-800 dark:to-gray-700 shadow-sm z-10" aria-hidden="true"></span>
                <svg className="absolute inset-0" width="44" height="24" viewBox="0 0 44 24" xmlns="http://www.w3.org/2000/svg">
                  <g className="fill-current text-white" fillRule="nonzero" opacity=".88">
                    <path d="M32 8a.5.5 0 00.5-.5v-1a.5.5 0 10-1 0v1a.5.5 0 00.5.5zM35.182 9.318a.5.5 0 00.354-.147l.707-.707a.5.5 0 00-.707-.707l-.707.707a.5.5 0 00.353.854zM37.5 11.5h-1a.5.5 0 100 1h1a.5.5 0 100-1zM35.536 14.829a.5.5 0 00-.707.707l.707.707a.5.5 0 00.707-.707l-.707-.707zM32 16a.5.5 0 00-.5.5v1a.5.5 0 101 0v-1a.5.5 0 00-.5-.5zM28.464 14.829l-.707.707a.5.5 0 00.707.707l.707-.707a.5.5 0 00-.707-.707zM28 12a.5.5 0 00-.5-.5h-1a.5.5 0 100 1h1a.5.5 0 00.5-.5zM28.464 9.171a.5.5 0 00.707-.707l-.707-.707a.5.5 0 00-.707.707l.707.707z" />
                    <circle cx="32" cy="12" r="3" />
                    <circle fillOpacity=".4" cx="12" cy="12" r="6" />
                    <circle fillOpacity=".88" cx="12" cy="12" r="3" />
                  </g>
                </svg>
                <span className="sr-only">Switch to light / dark version</span>
              </label>
            </div>

            {/* Desktop CTA on the right */}
            <ul className="flex justify-end flex-wrap items-center">
              <li>
                {( (session) ?
                  <Link href="#" onClick={handleLogout} className="btn-sm text-white bg-teal-500 hover:bg-teal-400 ml-6">Logout</Link>
                  :
                  <Link href="/login" className="btn-sm text-white bg-teal-500 hover:bg-teal-400 ml-6">Login</Link>
                )}
              </li>
            </ul>

          </nav>

          {/* Mobile menu */}
          <div className="inline-flex md:hidden">

            {/* Mobile lights switch */}
            <div className="form-switch flex flex-col justify-center mr-6 -mt-0.5">
              <input type="checkbox" name="light-switch" id="light-switch-mobile" className="light-switch sr-only" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              <label className="relative" htmlFor="light-switch-mobile">
                <span className="relative bg-gradient-to-t from-gray-100 to-white dark:from-gray-800 dark:to-gray-700 shadow-sm z-10" aria-hidden="true"></span>
                <svg className="absolute inset-0" width="44" height="24" viewBox="0 0 44 24" xmlns="http://www.w3.org/2000/svg">
                  <g className="fill-current text-white" fillRule="nonzero" opacity=".88">
                    <path d="M32 8a.5.5 0 00.5-.5v-1a.5.5 0 10-1 0v1a.5.5 0 00.5.5zM35.182 9.318a.5.5 0 00.354-.147l.707-.707a.5.5 0 00-.707-.707l-.707.707a.5.5 0 00.353.854zM37.5 11.5h-1a.5.5 0 100 1h1a.5.5 0 100-1zM35.536 14.829a.5.5 0 00-.707.707l.707.707a.5.5 0 00.707-.707l-.707-.707zM32 16a.5.5 0 00-.5.5v1a.5.5 0 101 0v-1a.5.5 0 00-.5-.5zM28.464 14.829l-.707.707a.5.5 0 00.707.707l.707-.707a.5.5 0 00-.707-.707zM28 12a.5.5 0 00-.5-.5h-1a.5.5 0 100 1h1a.5.5 0 00.5-.5zM28.464 9.171a.5.5 0 00.707-.707l-.707-.707a.5.5 0 00-.707.707l.707.707z" />
                    <circle cx="32" cy="12" r="3" />
                    <circle fillOpacity=".4" cx="12" cy="12" r="6" />
                    <circle fillOpacity=".88" cx="12" cy="12" r="3" />
                  </g>
                </svg>
                <span className="sr-only">Switch to light / dark version</span>
              </label>
            </div>

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
                  {/* Logo */}
                  <svg className="w-8 h-8" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient x1="26%" y1="100%" x2="100%" y2="100%" id="menulogo_a">
                        <stop stopColor="#3ABAB4" offset="0%" />
                        <stop stopColor="#7F9CF5" offset="100%" />
                      </linearGradient>
                      <linearGradient x1="26%" y1="100%" x2="100%" y2="100%" id="menulogo_b">
                        <stop stopColor="#3ABAB4" offset="0%" />
                        <stop stopColor="#3ABAB4" stopOpacity="0" offset="100%" />
                      </linearGradient>
                    </defs>
                    <path d="M32 16h-8a8 8 0 10-16 0H0C0 7.163 7.163 0 16 0s16 7.163 16 16z" fill="url(#menulogo_a)" />
                    <path d="M32 16c0 8.837-7.163 16-16 16S0 24.837 0 16h8a8 8 0 1016 0h8z" fill="url(#menulogo_b)" />
                  </svg>

                  {/* Mobile Links */}
                  <ul>
                    <li>
                      <Link href="/dashboard" onClick={(e) => setMobileNavOpen(false)} className="mobile-nav-link">Dashboard</Link>
                    </li>
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
                      <Link href="/about" onClick={(e) => setMobileNavOpen(false)} className="mobile-nav-link">About</Link>
                    </li>
                    <li className="py-2 my-2 border-t border-b border-gray-200 dark:border-gray-800">
                      <span className="flex text-gray-600 dark:text-gray-400 py-2">Resources</span>
                      <ul className="pl-4">
                        <li>
                          <Link href="/help" className="text-sm font-medium dark:text-gray-400 mobile-nav-link">Help center</Link>
                        </li>
                        <li>
                          <Link href="/404" className="text-sm font-medium dark:text-gray-400 mobile-nav-link">404</Link>
                        </li>
                      </ul>
                    </li>
                    <li>
                      {( (session) ?
                        <Link href="#" onClick={(e) => {setMobileNavOpen(false); handleLogout(e);}} className="font-medium w-full inline-flex items-center justify-center border border-transparent px-4 py-2 my-2 rounded text-white bg-teal-500 hover:bg-teal-400 transition duration-150 ease-in-out">Logout</Link>
                        :
                        <Link href="/login" onClick={(e) => setMobileNavOpen(false)} className="font-medium w-full inline-flex items-center justify-center border border-transparent px-4 py-2 my-2 rounded text-white bg-teal-500 hover:bg-teal-400 transition duration-150 ease-in-out">Login</Link>
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