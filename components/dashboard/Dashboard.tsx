import { ethers, providers } from "ethers";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import Image from 'next/image';
import Link from "../shared/Link";

import {
  Button,
  Card, CardHeader, CardBody, CardFooter,
  Dialog, DialogHeader, DialogBody, DialogFooter,
  Textarea,
  Typography,
  Tooltip,
} from "@material-tailwind/react";

import axios from 'axios';

import {
  legitSignatureAddress,
  legitNFTAddress
} from '../../_ethereum/config';

import LegitSignature from '../../_ethereum/artifacts/contracts/LegitSignature.sol/LegitSignature.json';
import LegitNFT from '../../_ethereum/artifacts/contracts/LegitNFT.sol/LegitNFT.json';

import { license1 } from "../../lib/licenses";

const NFT_Type = {
  SIGNATURE: 'signature',
  ALL_SIGNED: 'all_signed',
  MEDIA: 'media',
  DOCUMENTS: 'documents'
}

const Dashboard: React.FC = ({ children }) => {
  const router = useRouter();

  const [sigNfts, setSigNfts] = useState([]);
  const [assetNfts, setAssetNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');

  const [selectedNftType, setSelectedNftType] = useState(NFT_Type.SIGNATURE);
  const [selectedSig, setSelectedSig] = useState(null);

  const [selectedSignedNft, setSelectedSignNft] = useState(null);

  const [showSigDialog, setShowSigDialog] = useState(false);
  const [showSignedNftDialog, setShowSignedNftDialog] = useState(false);

  const noImageSrc = '/images/stamp-checkmark.png';

  useEffect(() => {
      loadNFTs()
  }, [])

  async function loadNFTs() {
    try {

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();

      const sigContract = new ethers.Contract(legitSignatureAddress, LegitSignature.abi, signer);
      const sigData = await sigContract.fetchMySignatures();

      const sigItems = await Promise.all(sigData.map(async i => {
        let tokenUri = await sigContract.tokenURI(i.tokenId)
        try {
          const meta = await axios.get(tokenUri)

          let item = {
            tokenId: i.tokenId.toNumber(),
            name: meta.data.name,
            description: meta.data.description,
            image: meta.data.image,
            socialAuth: meta.data.socialAuth,
            metadataUri: tokenUri,
          }
          return item;
        }
        catch(err) {
          // ignore bad URIs
          console.log("Ignoring bad token URI: ", tokenUri)
          return  {
            tokenId: i.tokenId.toNumber(),
            name: "",
            description: "",
            image: "",
          }
        }
      }))

      setSigNfts(sigItems)

      const legitContract = new ethers.Contract(legitNFTAddress, LegitNFT.abi, signer);
      const assetsData = await legitContract.fetchMyLegitItems();

      const legitItems = await Promise.all(assetsData.map(async i => {
        let tokenUri = await legitContract.tokenURI(i.tokenId)

        try {
          const meta = await axios.get(tokenUri)

          let item = {
            metadataUri: tokenUri,
            tokenId: i.tokenId.toNumber(),
            name: meta.data.name,
            description: meta.data.description,
            image: meta.data.previewImage,
            originalFile: meta.data.originalFile,
            legalTerms: meta.data.legalTerms,
            origFileType: meta.data.origFileType || "image"
          }
          return item
        }
        catch(err) {
          // ignore bad URIs
          console.log("Ignoring bad token URI: ", tokenUri)
          return  {
            metadataUri: "",
            tokenId: 0,
            name: "",
            description: "",
            image: "",
            originalFile: "",
            legalTerms: "",
            origFileType: ""
          }
        }
      }))

      setAssetNfts(legitItems)

      setLoadingState('loaded')
    }
    catch (error) {
      console.log("errored calling loadNFTs: ", error);
    }
  }

  const isMedia = (item) => {
    if (['audio', 'image', 'video'].indexOf(item.origFileType) >= 0) {
      return true;
    }

    return false;
  }

  const isDocument = (item) => {
    if (['audio', 'image', 'video'].indexOf(item.origFileType) < 0) {
      return true;
    }

    return false;
  }

  /*
   * Get render components for one signature
   */
  const getSocialAuthRender = (socialAuth) => {

    if (!socialAuth) {
      return (<></>);
    }

    let socialLink = "/verify";

    try {
      if (socialAuth.authType == "twitter") {
        socialLink = `https://twitter.com/${socialAuth.socialHandle}`;
      }
      else if (socialAuth.authType == "facebook") {
        socialLink = `https://facebook.com/${socialAuth.socialHandle}`;
      }
      else if (socialAuth.authType == "linkedin") {
        socialLink = `https://linkedin.com/${socialAuth.socialHandle}`;
      }
    }
    catch (err) {
      console.log("Error parsing socialAuth in getSocialAuthRender: ", err);
      return (<></>);
    }

    return (
      <div className="flex items-center">
        <Link className="relative h-12 w-12 mx-1 border-0" href={socialLink} target="_blank">
          <Image src={socialAuth?.authType ? `/images/social/${socialAuth?.authType}.svg` : ``} layout="fill" alt='Social Icon' className="drop-shadow-lg" />
        </Link>

        <Link className="mx-2 hover:underline" href={socialLink} target="_blank">
          {socialAuth?.socialName || socialAuth?.authType }
        </Link>
      </div>
    )
  }

  /******************
   * event handlers
   ********************/

  const handleNftTypeClicked = (event, nftType) => {
    setSelectedNftType(nftType);
  }

  const handleSigClicked = (event, sig) => {
    setSelectedSig(sig);
    setShowSigDialog(true);
  }

  const handleSignedNftClicked = (event, sig) => {
    setSelectedSignNft(sig);
    setShowSignedNftDialog(true);
  }

  return (
    <section className="max-w-4xl mx-auto">
      <Card>
        <CardBody className="">
          {/*nav bar*/}
          <div className="grid grid-cols-12">

            <aside className="col-span-12 lg:col-span-3 flex flex-wrap justify-center lg:justify-start -m-1 lg:mx-0 text-sm md:text-lg">

              <button
                onClick={e => { handleNftTypeClicked(e, NFT_Type.SIGNATURE) }}
                className={`lg:w-full font-medium px-4 pt-3 pb-2 shadow
                  transition duration-150 ease-in-out rounded
                  flex items-center justify-center lg:justify-start m-1 lg:mx-0

                  ${selectedNftType == NFT_Type.SIGNATURE ? 'bg-gray-600 text-white' : 'bg-white hover:bg-gray-50'}
                  `}
              >
                Your Signatures
              </button>

              <button
                onClick={e => { handleNftTypeClicked(e, NFT_Type.ALL_SIGNED) }}
                className={`lg:w-full font-medium px-4 pt-3 pb-2 shadow
                  transition duration-150 ease-in-out rounded
                  flex items-center justify-center lg:justify-start m-1 lg:mx-0

                  ${selectedNftType == NFT_Type.ALL_SIGNED ? 'bg-gray-600 text-white' : 'bg-white hover:bg-gray-50'}
                  `}
              >
                All Signed NFTs
              </button>

              <button
                onClick={e => { handleNftTypeClicked(e, NFT_Type.MEDIA) }}
                className={`lg:w-full font-medium px-4 pt-3 pb-2 shadow
                  transition duration-150 ease-in-out rounded
                  flex items-center justify-center lg:justify-start m-1 lg:mx-0

                  ${selectedNftType == NFT_Type.MEDIA ? 'bg-gray-600 text-white' : 'bg-white hover:bg-gray-50'}
                  `}
              >
                Media NFTs
              </button>

              <button
                onClick={e => { handleNftTypeClicked(e, NFT_Type.DOCUMENTS) }}
                className={`lg:w-full font-medium px-4 pt-3 pb-2 shadow
                  transition duration-150 ease-in-out rounded
                  flex items-center justify-center lg:justify-start m-1 lg:mx-0

                  ${selectedNftType == NFT_Type.DOCUMENTS ? 'bg-gray-600 text-white' : 'bg-white hover:bg-gray-50'}
                  `}
              >
                Signed Documents
              </button>
            </aside>

            <div className="col-span-12 lg:col-span-9 ml-0 lg:ml-8 mt-4 lg:mt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-4">

              { /*render signatures*/
                selectedNftType == NFT_Type.SIGNATURE && sigNfts.filter(sig => sig.image).map((nft, i) => (
                  <Card key={`sig-nft-${i}`} className="cursor-pointer hover:bg-gray-50 border" onClick={e => { handleSigClicked(e, nft)}}>
                    <CardBody className="text-center p-2 relative">
                      <Image src={nft.image || noImageSrc} className="rounded" alt="nft-image" width="300" height="200" />

                      <Typography className="mb-2">
                        {nft.name}
                      </Typography>
                    </CardBody>
                  </Card>)
                )
              }

              { /* render all signed NFTs */
                (selectedNftType == NFT_Type.ALL_SIGNED) && assetNfts.filter(item => item.image).map((nft, i) => (
                  <Card key={`sig-nft-${i}`} className="cursor-pointer hover:bg-gray-50 border" onClick={e => { handleSignedNftClicked(e, nft) }}>
                    <CardBody className="text-center p-2 relative">
                      <Image src={nft.image || noImageSrc} className="rounded" objectFit="cover" alt="nft-image" width="300" height="250" />

                      <Typography className="mb-2">
                        {nft.name}
                      </Typography>
                    </CardBody>
                  </Card>)
                )
              }

              { /* render media  NFTs */
                (selectedNftType == NFT_Type.MEDIA) && assetNfts.filter(item => item.image && isMedia(item)).map((nft, i) => (
                  <Card key={`sig-nft-${i}`} className="cursor-pointer hover:bg-gray-50 border" onClick={e => { handleSignedNftClicked(e, nft) }}>
                    <CardBody className="text-center p-2 relative">
                      <Image src={nft.image || noImageSrc} className="rounded" alt="nft-image" objectFit="cover" width="300" height="250" />

                      <Typography className="mb-2">
                        {nft.name}
                      </Typography>
                    </CardBody>
                  </Card>)
                )
              }

              { /* render documents NFTs */
                (selectedNftType == NFT_Type.DOCUMENTS) && assetNfts.filter(item => item.image && isDocument(item)).map((nft, i) => (
                  <Card key={`sig-nft-${i}`} className="cursor-pointer hover:bg-gray-50 border" onClick={e => { handleSignedNftClicked(e, nft) }}>
                    <CardBody className="text-center p-2 relative">
                      <Image src={nft.image || noImageSrc} className="rounded" alt="nft-image" objectFit="cover" width="300" height="250" />

                      <Typography className="mb-2">
                        {nft.name}
                      </Typography>
                    </CardBody>
                  </Card>)
                )
              }
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/******************
        * Signature NFT Dialog
        ********************/}

      <Dialog size="xl" open={showSigDialog} handler={setShowSigDialog}>
        <DialogHeader>
            <div className="text-blue-600">Signature NFT</div>
        </DialogHeader>
        <DialogBody>
          <div className="grid md:grid-cols-12 w-full gap-4">

            <div className="md:col-span-6 border rounded-lg">
              <div className="relative w-1/2 h-96 mx-auto">
                <Image src={selectedSig?.image || noImageSrc} style={{borderRadius: "20px"}}
                   layout='fill' objectFit='contain' alt="Signature NFT image" />
              </div>
            </div>

            <div className="md:col-span-6 font-normal overflow-y-scroll">

                <div className="flex mt-2">
                  <label className="font-bold">Name: </label>
                  <div className="ml-2">{selectedSig?.name}</div>
                </div>

                <div className="flex-col mt-2">
                  <label className="font-bold">Description: </label>
                  <div>{selectedSig?.description}</div>
                </div>

                <div className="flex-col mt-2">
                  <label className="font-bold">Contract Address: </label>
                  <div>
                    <Link target="_blank"
                      className="text-legitBlue-500 hover:underline"
                      href={`https://mumbai.polygonscan.com/address/${legitSignatureAddress}`}
                    >
                      {legitSignatureAddress}
                    </Link>
                  </div>
                </div>

                <div className="flex-col mt-2">
                  <label className="font-bold">MetaData Url: </label>
                  <div className="break-words">
                    <Link target="_blank"
                      className="text-legitBlue-500 hover:underline"
                      href={selectedSig?.metadataUri}
                    >
                      {selectedSig?.metadataUri}
                    </Link>
                  </div>
                </div>

                <div className="flex mt-2">
                  <label className="font-bold">Token ID: </label>
                  <div>{selectedSig?.tokenId}</div>
                </div>

                <div className="flex-col mt-2">
                  <label className="font-bold">Social Auth: </label>
                  <div>{getSocialAuthRender(selectedSig?.socialAuth)}</div>
                </div>

                <div className="flex-col mt-2">
                  <label className="font-bold">License:</label>
                  <Textarea variant="outlined" size="md" value={license1} onChange={e => {}} />
                </div>
            </div>


          </div>
        </DialogBody>
        <DialogFooter>
            <Button
                className="bg-gray-100 text-gray-400"
                onClick={(e) => setShowSigDialog(false)}
            >
                Close
            </Button>

            <Link target="_blank"
              className="ml-2"
              href={`${process.env.NEXT_PUBLIC_OPENSEA_ASSETS_URL}/${legitSignatureAddress}/${selectedSig?.tokenId}`}
            >
              <Button>View on OpenSea</Button>
            </Link>
        </DialogFooter>
      </Dialog>

      {/******************
        * Signed NFT Dialog
        ********************/}
      <Dialog size="xl" open={showSignedNftDialog} handler={setShowSignedNftDialog}>
        <DialogHeader>
            <div className="text-blue-600">Signed NFT</div>
        </DialogHeader>
        <DialogBody className="max-h-96">
          <div className="grid md:grid-cols-12 w-full gap-4">

            <div className="md:col-span-6">
              <div className="relative w-full h-80 mx-auto border rounded-lg">
                <Image src={selectedSignedNft?.image || noImageSrc} className="m-2"
                   layout='fill' objectFit='contain' alt="Signature NFT image" />
              </div>
            </div>

            <div className="md:col-span-6 font-normal overflow-y-scroll">

                <div className="flex mt-2">
                  <label className="font-bold">Name: </label>
                  <div className="ml-2">{selectedSignedNft?.name}</div>
                </div>

                <div className="flex-col mt-2">
                  <label className="font-bold">Description: </label>
                  <div>{selectedSignedNft?.description}</div>
                </div>

                <div className="flex-col mt-2">
                  <label className="font-bold">Contract Address: </label>
                  <div>
                    <Link target="_blank"
                      className="text-legitBlue-500 hover:underline"
                      href={`https://mumbai.polygonscan.com/address/${legitNFTAddress}`}
                    >
                      {legitNFTAddress}
                    </Link>
                  </div>
                </div>

                <div className="flex-col mt-2">
                  <label className="font-bold">MetaData Url: </label>
                  <div className="break-words">
                    <Link target="_blank"
                      className="text-legitBlue-500 hover:underline"
                      href={selectedSignedNft?.metadataUri}
                    >
                      {selectedSignedNft?.metadataUri}
                    </Link>
                  </div>
                </div>

                <div className="flex mt-2">
                  <label className="font-bold">Token ID: </label>
                  <div className="ml-2">{selectedSignedNft?.tokenId}</div>
                </div>

                <div className="flex-col mt-2">
                  <label className="font-bold">Preview Image: </label>
                  <div className="break-words">
                    <Link target="_blank"
                      className="text-legitBlue-500 hover:underline"
                      href={selectedSignedNft?.image}
                    >
                      {selectedSignedNft?.image}
                    </Link>
                  </div>
                </div>

                <div className="flex-col mt-2">
                  <label className="font-bold">Original File: </label>
                  <div className="break-words">
                    <Link target="_blank"
                      className="text-legitBlue-500 hover:underline"
                      href={selectedSignedNft?.originalFile}
                    >
                      {selectedSignedNft?.originalFile}
                    </Link>
                  </div>
                </div>

                <div className="flex-col mt-2">
                  <label className="font-bold">License:</label>
                  <Textarea variant="outlined" size="md" value={license1} onChange={e => {}} />
                </div>
            </div>


          </div>
        </DialogBody>
        <DialogFooter>
            <Button
                className="bg-gray-100 text-gray-400"
                onClick={(e) => setShowSignedNftDialog(false)}
            >
                Close
            </Button>

            <Link target="_blank"
              className="ml-2"
              href={`${process.env.NEXT_PUBLIC_OPENSEA_ASSETS_URL}/${legitNFTAddress}/${selectedSignedNft?.tokenId}`}
            >
              <Button>Sell on OpenSea</Button>
            </Link>
        </DialogFooter>
      </Dialog>

    </section>
  );
}

export default Dashboard;
