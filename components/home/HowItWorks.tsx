import Image from 'next/image';

const HowItWorks: React.FC = ({ children }) => {

  return (
    <section className="relative border-t border-transparent dark:border-gray-800">
    
      <div className="absolute inset-0 h-128 dark:opacity-25 bg-gradient-to-b from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 pointer-events-none" aria-hidden="true">
      </div>
    
      <div className="relative mx-auto px-12">
        <div className="pt-20">
          <div className="mx-auto text-center md:pb-8">
              <h2 className="h2 text-3xl text-legitBlue-500 mb-4">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="pt-4">
              <h3 className="h4 text-gray-600">1. Create your handwritten signature NFT</h3>

              <p className="mt-4 text-lg">
                Create an NFT of your handwritten signature using the signature pad, taking a photo,
                or uploading an image of your handwriting.
              </p>

              <p className="mt-4 text-lg">
                Link your social profile to the signature
                using the OAuth verification system.
              </p>
            </div>

            <div className="mt-2">
              <Image src="/images/legitimize-howitworks-create-sig.png"
                width="1200"
                height="900"
                className="rounded-lg"
                alt="How It Works - Create Signature NFT" />
            </div>
          </div>

          <div className="p-12">
            <hr className="hr" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="pt-4">
              <h3 className="h4 text-gray-600">2. Use your signature NFT to sign media files and documents</h3>

              <p className="mt-4 text-lg">
                Create a signed NFT of your file or document by attaching your handwritten signature NFT.
              </p>

              <p className="mt-4 text-lg">
                The signed NFT has a preview image of the file with the handwritten signature overlayed, the original file,
                and any legal terms and conditions you selected during the minting process.
              </p>

              <p className="mt-4 text-lg">
                Exif data is embedded in the signed preview image, storing the hash address and IPFS content id of the signed NFT file.
              </p>
            </div>

            <div className="mt-2">
              <Image src="/images/legitimize-howitworks-sign-nft.png"
                width="1200"
                height="900"
                className="rounded-lg"
                alt="How It Works - Sign NFT" />
            </div>
          </div>

          <div className="p-12">
            <hr className="hr" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="pt-4">
              <h3 className="h4 text-gray-600">3. Anyone can verify the signature</h3>

              <p className="mt-4 text-lg">
                Anyone can extract the hash address and CID of the signed image from the Exif data.
              </p>

              <p className="mt-4 text-lg">
                Given an NFT&apos;s hash address and content ID, the signature&apos;s smart contract returns any attached
                signatures and linked social profiles.
              </p>
            </div>

            <div className="mt-2">
              <Image src="/images/legitimize-howitworks-verify-nft.png"
                width="1200"
                height="900"
                className="rounded-lg"
                alt="How It Works - Verify Signed NFT" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
