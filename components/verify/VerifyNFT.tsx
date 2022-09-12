import { ethers, providers } from "ethers";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import Image from 'next/image';
import Link from "../shared/Link";
import { Button, Textarea } from "@material-tailwind/react";

import axios from 'axios';
import { piexif } from 'piexifjs';

import {
  legitSignatureAddress
} from '../../_ethereum/config';

import LegitSignature from '../../_ethereum/artifacts/contracts/LegitSignature.sol/LegitSignature.json';
import LegitNFT from '../../_ethereum/artifacts/contracts/LegitNFT.sol/LegitNFT.json';

type SocialAuth = {
  authType: string;
  socialName: string;
  socialHandle: string;
}

type SignatureItem = {
  creator: string;
  creatorName: string;
  owner: string;
  socialAuthJson: string;
}

const VerifyNFT: React.FC = ({ children }) => {
  const router = useRouter();

  const [nftAddress, setNFTAddress] = useState("");
  const [nftCid, setNFTCid] = useState("");

  const [verifyClicked, setVerifyClicked] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [legalTerms, setLegalTerms] = useState("");
  const [loadedSigs, setLoadedSigs] = useState<SignatureItem[]>([]);

  const [errorMsg, setErrorMsg] = useState("");

  /*
   * Call smart contract getNFTSignatures to verify an NFT
   */
  const verifyByCid = async (toVerifyAddr: string, toVerifyCid: string) => {
    setErrorMsg("");
    setPreviewImage("");
    setLegalTerms("");
    setVerifyClicked(true);

    try {

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();

      const sigContract = new ethers.Contract(legitSignatureAddress, LegitSignature.abi, signer);
      const legitContract = new ethers.Contract(toVerifyAddr, LegitNFT.abi, signer);

      const legitData = await legitContract.fetchLegitItemByCID(toVerifyCid);
      const nftTokenId = parseInt(legitData.tokenId);
      const tokenUri = await legitContract.tokenURI(nftTokenId);

      const nftAddrAndCID = `${toVerifyAddr.toLowerCase()}.${toVerifyCid}`;
      const sigItems = await sigContract.getNFTSignatures(nftAddrAndCID);

console.log("sigItems: ", sigItems);
      let newLoadedSigs = [];

      if (sigItems.length > 0) {
        for (let i=0; i<sigItems.length; i++) {
          let sig = sigItems[i];

          newLoadedSigs.push({
            creator: sig.creator,
            creatorName: sig.creatorName,
            owner: sig.owner,
            socialAuthJson: sig.socialAuthJson
          });
        }

        setLoadedSigs(newLoadedSigs);
      }

      const metaData = await axios.get(tokenUri);

      if (metaData?.data?.previewImage) {
        setPreviewImage(metaData.data?.previewImage);
      }

      if (metaData?.data?.legalTerms) {
        setLegalTerms(metaData.data.legalTerms);
      }

    }
    catch (error) {
      console.log("errored calling verify: ", error);
      setErrorMsg("Invalid nft address or token Id");
    }
  }

  /*
   * Event handler for verify button clicked
   */
  const handleVerifyClicked = (e) => {
    verifyByCid(nftAddress, nftCid);
  };

  /*
   * User selected file event handler
   */
  const handleFileSelect = (event) => {
    var reader = new FileReader();
    var file = event.target.files[0];

    reader.onloadend = function(e) {
        var exifObj = piexif.load(e.target.result);
        for (var ifd in exifObj) {
            if (ifd == "thumbnail") {
                continue;
            }
            console.log("-" + ifd);
            for (var tag in exifObj[ifd]) {
                // console.log(" tagname: " + piexif.TAGS[ifd][tag]["name"] + "; value:" + exifObj[ifd][tag]);

                const tagName = piexif.TAGS[ifd][tag]["name"];
                if (tagName.trim().toLowerCase() == 'usercomment') {
                  const nftDataJson = exifObj[ifd][tag];
                  try {
                    const nftData = JSON.parse(nftDataJson);
                    verifyByCid(nftData.legitNFTAddress, nftData.origFileCID);
                  }
                  catch(err) {
                    console.log("error parsing nftDataJson from exif: ", err);
                  }
                  return;
                }
            }
        }
    };
    reader.readAsDataURL(file);
  };

  /*
   * Get render components for one signature
   */
  const getSigInfoRender = (sig:SignatureItem) => {

    let socialInfo = {} as SocialAuth;
    let socialLink = "/verify";

    try {
      socialInfo = JSON.parse(sig.socialAuthJson);

      if (socialInfo.authType == "twitter") {
        socialLink = `https://twitter.com/${socialInfo.socialHandle}`;
      }
      else if (socialInfo.authType == "facebook") {
        socialLink = `https://facebook.com/${socialInfo.socialHandle}`;
      }
      else if (socialInfo.authType == "linkedin") {
        socialLink = `https://linkedin.com/${socialInfo.socialHandle}`;
      }
    }
    catch (err) {
      console.log("Error parsing socialAuth JSON in getSocialAuthInfo: ", err);
    }

    return (
      <div className="row-auto">
        <div className="mt-2 row-auto">
          Signature
        </div>

        <div className="mt-2 row-auto">
          Creator Name: {sig.creatorName}
        </div>

        <div className="mt-2 row-auto">
          Creator Addr: {sig.creator}
        </div>

        <div className="mt-2 row-auto">
          Owner Addr: {sig.owner}
        </div>

        <div className="flex flex-col mt-4 relative">
          <div>Social Auth:</div>
          <div className="flex items-center">
            <Link className="relative h-12 w-12 mx-1" href={socialLink} target="_blank">
              <Image src={socialInfo?.authType ? `/images/social/${socialInfo?.authType}.svg` : ``} layout="fill" alt='Social Icon' />
            </Link>

            <Link className="mx-2" href={socialLink} target="_blank">
              {socialInfo?.socialName || socialInfo?.authType }
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /*
   * Return render for loaded signatures
   */
  const renderLoadedSigs = () => {

    if (loadedSigs.length == 0) {
      return (
        <div className="mt-2">
          No Signatures found.
        </div>
      );
    }

    return (
      <>
        {
          loadedSigs.map( sig => ( getSigInfoRender(sig) ))
        }
      </>
    );
  };

  /*
   * Main Render
   */
  return (
    <div className="max-w-4xl mx-auto">

      <div className="p-4">
        <div className="row-auto">
          <input
            placeholder="Enter the NFT address"
            className="form-input w-full"
            value={nftAddress}
            onChange={e => setNFTAddress(e.target.value)}
          />
        </div>

        <div className="row-auto mt-2">
          <input
            placeholder="Enter the original file CID"
            className="form-input w-full"
            value={nftCid}
            onChange={e => setNFTCid(e.target.value)}
          />

          <Button
            className="mt-2"
            color="orange"
            onClick={handleVerifyClicked}
          >
            Verify
        </Button>
        </div>

        <div className="row-auto mt-2">
          Or
        </div>

        <div className="row-auto mt-2">
          <label>Select a file:</label>
          <div>
            <input type="file" id="files" onChange={handleFileSelect} />
          </div>
        </div>

        <div className="mt-4 row-auto">

          {errorMsg && (
            <div className="p-4">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-flow-col auto-cols-max">
          { previewImage && (
              <div className="w-full">
                <Link className="relative" target="_blank" href={previewImage}>
                  <Image src={previewImage} width={300} height={300} className="rounded"
                    alt="nft-image" />
                </Link>
              </div>)
          }

            <div className="p-4">

              {verifyClicked && loadedSigs.length == 0 && (
                  <div className="mt-2">
                    No Signatures found.
                  </div>
                )
              }

              {loadedSigs.length > 0 && renderLoadedSigs()}

              {legalTerms && (
                <div className="mt-4 row-auto">
                  <label className="font-bold">Legal Terms:</label>
                  <Textarea variant="outlined" size="md" value={legalTerms} />
                </div>)
              }
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default VerifyNFT;
