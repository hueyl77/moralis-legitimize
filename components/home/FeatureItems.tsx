import { useState } from 'react';

import Image from 'next/image';
import Link from '../shared/Link';

const FeatureItems: React.FC = ({ children }) => {

  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12">
          <div className="max-w-sm mx-auto grid grid-cols-2 gap-4 gap-y-8 sm:gap-8 md:grid-cols-4 items-start md:max-w-5xl">

                {/*<!-- 1st item -->*/}
                <div className="relative flex flex-col items-center">
                    <div aria-hidden="true" className="absolute h-0.5 bg-gradient-to-r from-white via-gray-300 to-white dark:from-gray-900 dark:via-gray-700 dark:to-gray-900 hidden md:block">

                    </div>
                    <div className="relative w-20 h-20 mb-3">
                        <div className="absolute inset-0 rounded-full opacity-30 bg-gradient-to-tr from-teal-500 -z-1" aria-hidden="true"></div>
                        <Image src="/images/legal-doc-pink.svg" width="200" height="200" className="drop-shadow-lg" alt="Legal Document Icon" />
                    </div>
                    <div className="sm:text-lg font-medium dark:text-gray-300">Legal Documents</div>
                </div>

                {/*<!-- 2nd item -->*/}
                <div className="relative flex flex-col items-center">
                    <div aria-hidden="true" className="absolute h-0.5 bg-gradient-to-r from-white via-gray-300 to-white dark:from-gray-900 dark:via-gray-700 dark:to-gray-900 hidden md:block">

                    </div>

                    <div className="relative w-20 h-20 mb-3">
                        <div className="absolute inset-0 rounded-full opacity-30 bg-gradient-to-tr from-purple-500 -z-1" aria-hidden="true"></div>
                        <Image src="/images/artwork-icon-yellow.svg" width="200" height="200" className="drop-shadow-lg" alt="Artwork Icon" />
                    </div>
                    <div className="sm:text-lg font-medium dark:text-gray-300">Artworks</div>
                </div>

                {/*<!-- 3rd item -->*/}
                <div className="relative flex flex-col items-center">
                    <div aria-hidden="true" className="absolute h-0.5 bg-gradient-to-r from-white via-gray-300 to-white dark:from-gray-900 dark:via-gray-700 dark:to-gray-900 hidden md:block">

                    </div>
                    <div className="relative w-20 h-20 mb-3">
                        <div className="absolute inset-0 rounded-full opacity-30 bg-gradient-to-tr from-legitBlue-500 -z-1" aria-hidden="true"></div>
                        <Image src="/images/music-icon-green.svg" width="200" height="200" className="drop-shadow-lg" alt="Music Icon" />
                    </div>
                    <div className="sm:text-lg font-medium dark:text-gray-300">Music</div>
                </div>

                {/*<!-- 4th item -->*/}
                <div className="relative flex flex-col items-center">
                    <div className="relative w-20 h-20 mb-3">
                        <div className="absolute inset-0 rounded-full opacity-30 bg-gradient-to-tr from-pink-500 -z-1" aria-hidden="true"></div>
                        <Image src="/images/books-icon-purple.svg" width="200" height="200" className="drop-shadow-lg" alt="Books Icon" />
                    </div>
                    <div className="sm:text-lg font-medium dark:text-gray-300">Writings</div>
                </div>

            </div>
        </div>
      </div>
    </section>
  );
}

export default FeatureItems;
