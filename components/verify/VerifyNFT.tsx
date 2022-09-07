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
  const [loadedSig, setLoadedSig] = useState<SignatureItem>();

  const [errorMsg, setErrorMsg] = useState("");

  const verifyByCid = async (toVerifyAddr: string, toVerifyCid: string) => {
    setErrorMsg("");
    setPreviewImage("");
    setLegalTerms("");
    setVerifyClicked(true);

    let sigItem: SignatureItem = {
        creator: "",
        creatorName: "",
        owner: "",
        socialAuthJson: "{}"
      };

    setLoadedSig(sigItem);

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
      const sigItemRes = await sigContract.getNFTSignature(nftAddrAndCID);


      if (sigItemRes) {
        sigItem.creator = sigItemRes.creator;
        sigItem.creatorName = sigItemRes.creatorName;
        sigItem.owner = sigItemRes.owner;
        sigItem.socialAuthJson = sigItemRes.socialAuthJson;

        setLoadedSig(sigItem);
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

  const handleVerifyClicked = (e) => {
    verifyByCid(nftAddress, nftCid);
  };

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
  }

  const getSocialAuthInfo = (authJson: string) => {

    if (!authJson) {
      return (<></>);
    }

    let socialInfo = {} as SocialAuth;
    let socialLink = "/verify";

    try {
      socialInfo = JSON.parse(authJson);

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
      return (<></>);
    }

    return (
      <>
        <div className="flex flex-col mt-4 relative">
          <div>Social Auth:</div>
          <div className="flex items-center">
            <Link className="relative h-12 w-12 mx-1" href={socialLink} target="_blank">
              <Image src={`/images/social/${socialInfo?.authType}.svg`} layout="fill" alt='Social Icon' />
            </Link>

            <Link className="mx-2" href={socialLink} target="_blank">
              {socialInfo?.socialName || socialInfo?.authType }
            </Link>
          </div>
        </div>
      </>
    );
  };

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

              {verifyClicked && !loadedSig?.creator && (
                  <div className="mt-2">
                    No Signature found.
                  </div>
                )
              }

              {loadedSig?.creator && (
                <div className="row-auto">
                  <div className="mt-2 row-auto">
                    Signature
                  </div>

                  <div className="mt-2 row-auto">
                    Creator Name: {loadedSig.creatorName}
                  </div>

                  <div className="mt-2 row-auto">
                    Creator Addr: {loadedSig.creator}
                  </div>

                  <div className="mt-2 row-auto">
                    Owner Addr: {loadedSig.owner}
                  </div>
                </div>)
              }

              {verifyClicked && loadedSig?.creator && loadedSig?.socialAuthJson
                && getSocialAuthInfo(loadedSig?.socialAuthJson || "")}

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
