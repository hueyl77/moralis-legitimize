const FeaturesHome: React.FC = ({ children }) => {

  return (
    <section className="relative border-t border-transparent dark:border-gray-800">
    
      <div className="absolute inset-0 h-128 dark:opacity-25 bg-gradient-to-b from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 pointer-events-none" aria-hidden="true">
      </div>
    
      <div className="relative mx-auto px-12">
        <div className="pt-20">
          <div className="mx-auto text-center md:pb-8">
              <h2 className="h2 text-3xl text-legitBlue-500 mb-4">Your signature is uniquely your own.</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Your signature should be unique, immutable, and verifiable.  NFTs are the perfect medium
                to represent your handwritten signature in the digital space.  Legitimize provides an open-sourced
                system that allows anyone to create their signatures as NFTs, linking social profiles
                using OAuth credentials for proof of identity.
              </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesHome;
