import { ethers, providers } from "ethers";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';

import Image from 'next/image';
import Link from "../shared/Link";
import { Button, Textarea,
  Tabs, TabsHeader, TabsBody, Tab, TabPanel } from "@material-tailwind/react";

import Dropzone from 'react-dropzone';

import { getEditorDefaults,
  createMarkupEditorToolStyle,
  createMarkupEditorShapeStyleControls,
  createDefaultImageWriter } from 'pintura';

// @ts-ignore
import { PinturaEditor } from 'react-pintura';

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

  const [selectedFile, setSelectedFile] = useState(null);
  const [rejectedFile, setRejectedFile] = useState(false);

  const [verifyClicked, setVerifyClicked] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [legalTerms, setLegalTerms] = useState("");
  const [loadedSigs, setLoadedSigs] = useState<SignatureItem[]>([]);

  const [errorMsg, setErrorMsg] = useState("");
  const [errorText, setErrorText] = useState("");

  const maxFileSize = 1073741824; // 1GB

  {/************************************************
    Image Editor setup
  ************************************************/}
  const pinturaEditor = useRef(null);
  const editorConfig = getEditorDefaults();

  editorConfig.imageWriter = createDefaultImageWriter({
    mimeType: 'image/jpeg',
    quality: 1.0,
  });

  editorConfig.enableToolbar = false;
  editorConfig.enableUtils = false;
  editorConfig.enableDropImage = false;
  editorConfig.imageBackgroundColor = [255, 255, 255];
  editorConfig.stickerEnableSelectImagePreset = false;
  // editorConfig.enableTapToAddText = true

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
  const handleFileSelect = (acceptedFiles, fileRejections) => {
    var reader = new FileReader();

    if (fileRejections !== null && fileRejections.length > 0 && fileRejections[0].errors !== null) {
      const dropzoneErrorMsgs = fileRejections[0].errors.map(e => {
        if (e.code === "file-invalid-type") {
          return "Invalid file type, file must be a .csv";
        }
        if (e.code === "file-too-large") {
          return "File size too large, file must be less than 100 MB";
        }
        return e.message;
      })

      const errorMsg = dropzoneErrorMsgs.join(". ");
      rejectFile(errorMsg + ". Please check your file and try again.");
      return;
    }

    const file = acceptedFiles[0];
    setSelectedFile(file);

    reader.onloadend = function(e) {
        var exifObj = piexif.load(e.target.result);
        for (var ifd in exifObj) {
            if (ifd == "thumbnail") {
                continue;
            }

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
   * Dropzone file rejected handler
   */
  const rejectFile = (msg) => {
    console.log("File rejected: " + msg);
    setErrorText(msg);
    setRejectedFile(true);
  }

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
   * Pintura image on process handler
   */
  const handleOnProcess = async (result) => {
    // pass
  }

  /*
   * Main Render
   */
  return (
    <div className="max-w-4xl mx-auto">

      <Tabs value="verify-image">
        <TabsHeader className={`ml-4 mr-4 hidden`}>
          <Tab value={`verify-image`}>
            Signed Image
          </Tab>

          <Tab value={`verify-addr-cid`}>
            Address and IPFS Hash
          </Tab>
        </TabsHeader>

        <TabsBody animate={{
          mount: { y: 0 },
          unmount: { y: 250 },
          }}>

          <TabPanel value={`verify-image`}>

            <div className="grid md:grid-cols-12 gap-6">

              <div className="md:col-span-12">
                <div className="file-uploader" id="fileUploader" style={{display: `${!selectedFile ? 'block' : 'none'}`}}>
                  <Dropzone
                    onDrop={handleFileSelect}
                    accept={{'image/jpeg': ['.jpg', '.jpeg']}}
                    maxSize={maxFileSize}
                    noClick={false}
                    multiple={false}>

                    {({getRootProps, getInputProps}) => (
                      <div {...getRootProps()} className='dropzone-container'>
                        <input {...getInputProps()} />
                        <p className="text-lg">Drag &apos;n&apos; drop a file here<br/>
                         or click to select file</p>
                      </div>
                    )}
                  </Dropzone>
                </div>
              </div>

              {/* Left col */}
              <div className="md:col-span-6">

                <div className="file-uploader" id="imageEditor" style={
                  {
                    visibility: `${selectedFile ? 'visible' : 'hidden'}`,
                    position: `${selectedFile ? 'relative' : 'absolute'}`,
                  }}>

                  <PinturaEditor
                    ref={pinturaEditor}
                    {...editorConfig}
                    mimeType='image/jpeg'
                    src={selectedFile}
                    onProcess={handleOnProcess}
                  />
                </div>
              </div>

              {/*right column*/}
              <div className="md:col-span-6">
                {verifyClicked && loadedSigs.length == 0 && (
                    <div className="mt-2">
                      No Signatures found.
                    </div>
                  )
                }

                {loadedSigs.length > 0 && renderLoadedSigs()}

                {loadedSigs.length > 0 && legalTerms && (
                  <div className="mt-4 row-auto">
                    <label className="font-bold">Legal Terms:</label>
                    <Textarea variant="outlined" size="md" value={legalTerms} />
                  </div>)
                }
              </div>
            </div>
          </TabPanel>

          <TabPanel value={`verify-addr-cid`}>
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

              <Button className="mt-2" color="orange" onClick={handleVerifyClicked}>Verify</Button>
            </div>
          </TabPanel>
        </TabsBody>
      </Tabs>

    </div>
  );
}

export default VerifyNFT;
