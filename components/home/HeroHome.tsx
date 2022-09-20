import { useState } from 'react';

import Image from 'next/image';
import Link from '../shared/Link';
import DigitalSignatureImg from '../../public/images/digital-signature-3.jpeg';

const HeroHome: React.FC = ({ children }) => {

  return (
    <section style={{zIndex: 999}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-10 md:pt-40 md:pb-16">

          {/* Hero content */}
          <div className="md:grid md:grid-cols-12 md:gap-12 lg:gap-20 items-center">

            {/* Content */}
            <div className="md:col-span-6 lg:col-span-6 mb-8 md:mb-0 text-center md:text-left">
              <h1 className="h2 lg:text-3xl mb-4 text-legitBlue-600 dark:text-white font-extrabold">
                Your Handwritten<br/>Signatures as NFTs</h1>
              <p className="text-xl text-gray-800 dark:text-gray-400">Create an NFT of your handwritten signature and use it to sign assets and documents.</p>
              {/* CTA form */}
              <form className="mt-8">
                <div className="flex flex-col sm:flex-row justify-center max-w-sm mx-auto sm:max-w-md md:mx-0">
                  <Link className="btn text-white bg-legitBlue-500 hover:bg-legitBlue-400 shrink-0 drop-shadow-lg" href="/create-signature">Get Started</Link>
                </div>
                {/* Success message */}
                {/* <p className="text-center md:text-left mt-2 opacity-75 text-sm">Thanks for subscribing!</p> */}
              </form>

              <ul className="max-w-sm sm:max-w-md mx-auto text-left text-lg md:max-w-none text-gray-600 dark:text-gray-400 mt-8 -mb-2">
                <li className="flex items-top mb-2">
                  <svg className="w-3 h-3 fill-current text-teal-400 mr-2 mt-1.5 shrink-0" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <span>Create an NFT of your handwritten signature.</span>
                </li>
                <li className="flex items-top mb-2">
                  <svg className="w-3 h-3 fill-current text-teal-400 mr-2 mt-1.5 shrink-0" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <span>Link social profiles to your signature NFT for identity verification.</span>
                </li>
                <li className="flex items-top mb-2">
                  <svg className="w-3 h-3 fill-current text-teal-400 mt-1.5 mr-2 shrink-0" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <span>Create and sign any assets or documents.</span>
                </li>
                <li className="flex items-top mb-2">
                  <svg className="w-3 h-3 fill-current text-teal-400 mr-2 mt-1.5 shrink-0" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <span>Optionally embed usage terms, copyrights, licensing, and other contract agreements into the NFT for legal purposes.</span>
                </li>
                <li className="flex items-top mb-2">
                  <svg className="w-3 h-3 fill-current text-teal-400 mt-1.5 mr-2 shrink-0" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <span>Allow anyone to verify the authenticity of Signed NFTs by calling open-sourced smart contract functions.</span>
                </li>
              </ul>
            </div>

            {/* Mobile mockup */}
            <div className="md:col-span-6 lg:col-span-6 text-center md:text-right">
              <div className="inline-flex relative justify-center items-center">
                  <iframe width="560" height="315" src="https://www.youtube.com/embed/0fnYRakETDU" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroHome;
