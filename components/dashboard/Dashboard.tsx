import { ethers, providers } from "ethers";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import Image from 'next/image';
import Link from "../shared/Link";

import axios from 'axios';

import {
  legitSignatureAddress,
  legitNFTAddress
} from '../../_ethereum/config';

import LegitSignature from '../../_ethereum/artifacts/contracts/LegitSignature.sol/LegitSignature.json';
import LegitNFT from '../../_ethereum/artifacts/contracts/LegitNFT.sol/LegitNFT.json';

const Dashboard: React.FC = ({ children }) => {
  const router = useRouter();

  const [sigNfts, setSigNfts] = useState([]);
  const [assetNfts, setAssetNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');

  const noImageSrc = 'https://legitimize.mypinata.cloud/ipfs/QmZ6TKhV4NRsEY6yLEJFXmYK7uvJEHhiefcom9K33VhPnN/u8umflvv5bg31.jpg';

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

  if (loadingState === 'loaded' && !sigNfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs listed</h1>)

  return (
    <div className="max-w-4xl mx-auto">

      {/*Display Signatures*/}
      <div className="p-4">
        <h2 className="text-2xl py-2">Your Signatures</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            sigNfts.filter(sig => sig.image).map((nft, i) => (
                <div key={i} className="border shadow rounded-xl flex text-center flex-col bg-gray-200">
                  <Image src={nft.image || noImageSrc} className="rounded" alt="nft-image" width={200} height={200} />
                  <div className="p-4 bg-black">
                    <p className="font-bold text-white">{nft.name}</p>
                  </div>
                </div>)
            )
          }
        </div>
      </div>

      <div className="my-4">
        <hr />
      </div>

      {/*Display Signed Assets*/}
      <div className="p-4">
        <h2 className="text-2xl py-2">Your Signed Assets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            assetNfts.filter(item => item.image).map((nft, i) => (
                <div key={i} className="border shadow rounded-xl flex text-center flex-col bg-gray-200">
                  <Link className="relative" target="_blank" href={nft.metadataUri}>
                    <Image src={nft.image || noImageSrc} className="rounded"
                      alt="nft-image" width={200} height={200} />
                  </Link>
                  <div className="p-4 bg-black">
                    <p className="font-bold text-white">{nft.name}</p>
                  </div>
                </div>)
            )
          }
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
