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
              <h1 className="h2 lg:text-4xl mb-4 font-red-hat-display font-extrabold">Legitimize your <br/>digital assets</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">Sign and link your handwritten signature to your NFTs for authenticity verification.</p>
              {/* CTA form */}
              <form className="mt-8">
                <div className="flex flex-col sm:flex-row justify-center max-w-sm mx-auto sm:max-w-md md:mx-0">
                  <Link className="btn text-white bg-teal-500 hover:bg-teal-400 shrink-0" href="/create-signature">Get Started</Link>
                </div>
                {/* Success message */}
                {/* <p className="text-center md:text-left mt-2 opacity-75 text-sm">Thanks for subscribing!</p> */}
              </form>
              <ul className="max-w-sm sm:max-w-md mx-auto md:max-w-none text-gray-600 dark:text-gray-400 mt-8 -mb-2" data-aos="fade-down" data-aos-delay="450">
                <li className="flex items-top mb-2">
                  <svg className="w-3 h-3 fill-current text-teal-400 mr-2 mt-1.5 shrink-0" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <span>Create an NFT of your handwritten signature.</span>
                </li>
                <li className="flex items-top mb-2">
                  <svg className="w-3 h-3 fill-current text-teal-400 mt-1.5 mr-2 shrink-0" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <span>Upload and create assets and documents with attached handwritten signatures.</span>
                </li>
                <li className="flex items-top mb-2">
                  <svg className="w-3 h-3 fill-current text-teal-400 mr-2 mt-1.5 shrink-0" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <span>Optionally embed usage terms, copyrights, licensing and other contract agreements into the NFT for legal purposes.</span>
                </li>
              </ul>
            </div>

            {/* Mobile mockup */}
            <div className="md:col-span-6 lg:col-span-6 text-center md:text-right">
              <div className="inline-flex relative justify-center items-center">
                  <Image className="relative rounded-lg max-w-full mx-auto md:mr-0 md:max-w-none h-auto opacity-80" src={DigitalSignatureImg} alt="Digital Signature" aria-hidden="true" />
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroHome;
