
import { Button } from "@material-tailwind/react";
import Image from 'next/image';
import Link from '../shared/Link';

const HomeCTA: React.FC = ({ children }) => {

  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        <div className="dark relative bg-gray-800 px-4 py-4 md:py-8 md:px-8">
            <div className="relative flex flex-col lg:flex-row justify-between items-center">

                <div className="lg:mr-16 lg:mb-0 text-center lg:text-left lg:w-1/2">
                    <h3 className="h4 text-gray-100">Subscribe for Updates</h3>
                </div>

                <form className="w-full lg:w-1/2">
                    <div className="flex flex-col sm:flex-row justify-center max-w-xs mx-auto sm:max-w-md lg:max-w-none">
                        <input className="form-input text-white w-full mb-2 sm:mb-0 sm:mr-2" placeholder="Your email address" aria-label="email address" />
                        <Button className="btn text-white shrink-0 drop-shadow-lg">Subscribe</Button>
                    </div>
                </form>

            </div>

        </div>

    </div>
</section>
  );
}

export default HomeCTA;
