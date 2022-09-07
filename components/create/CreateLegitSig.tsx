import { ethers, providers } from "ethers";

import { useSession } from "next-auth/react";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';

import LoginButtons from '../login/LoginButtons';

import { TabHead, TabContainer, TabBody, Tab } from "../styled/Tabs";
import Image from 'next/image';
import Head from "next/head"
import Link from "../shared/Link";

import { Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react";
import ErrorDialog from '../shared/ErrorDialog';

import { CreateSigMethod, createPopupWin } from '../../lib/utils';

import SignaturePad from "./SignaturePad";
import SignatureCamera from "./SignatureCamera";
import UploadSig from "./UploadSig";
import SignatureStamps from "./SignatureStamps";

import axios from 'axios';

import {
  legitSignatureAddress
} from '../../_ethereum/config';

import LegitSignature from '../../_ethereum/artifacts/contracts/LegitSignature.sol/LegitSignature.json';

const CreateLegitSig = ({ stickers }) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [showErrorMsg, setShowErrorMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [isMinting, setIsMinting] = useState(false);
  const [savedImage, setSavedImage] = useState<string>("");
  const [methodSelected, setMethodSelected] = useState(CreateSigMethod.SIG_PAD);

  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  const [selectedSocialType, setSelectedSocialType] = useState("twitter");
  const [socialIsLinked, setSocialIsLinked] = useState(false);
  const [socialLinkHandle, setSocialLinkHandle] = useState("");
  const [socialLinkName, setSocialLinkName] = useState("");

  const [createSigBtnText, setCreateSigBtnText] = useState("Create NFT");
  const [mintSuccess, setMintSuccess] = useState(false);

  const sigPadRef = useRef(null);
  const uploadSigRef = useRef(null);
  const sigStampRef = useRef(null);

  const [formInput, updateFormInput] = useState({ 
    name: 'Your Name',
    description: 'An NFT Signature for legitimizing assets.' })

  async function uploadToIPFS(imageToUpload) {

    let socialAuthJson = {
      authType: selectedSocialType,
      socialName: socialLinkName,
      socialHandle: socialLinkHandle
    };

    try {
      const response = await axios.post('/api/sig-nft', {
        assetName: formInput.name,
        description: formInput.description,
        socialAuthJson: socialAuthJson,
        sigData: imageToUpload
      });

      if (response.status === 200) {
        const ipfsCID = response.data.IpfsHash;
        const nftUrl = `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${ipfsCID}`;

        return nftUrl;
      }


    } catch (error) {
      console.log('Error calling sig-nft api: ', error)
    }
  }

  const handleCreateNFTClicked = async (event) => {
    event.target.disabled = true;
    setCreateSigBtnText("Processing...")
    setIsMinting(true);

    let sigImageUrl = await uploadToIPFS(savedImage);

    if (sigImageUrl) {
      await mintNFT(sigImageUrl);
      return;
    }

    console.log("Error encountered minting Sig NFT");
    return;
  }


  async function mintNFT(url) {

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const signer = provider.getSigner();

    let contract = new ethers.Contract(legitSignatureAddress, LegitSignature.abi, signer)

    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()

    let socialAuthJson = JSON.stringify({
      "authType": selectedSocialType,
      "socialName": socialLinkName,
      "socialHandle": socialLinkHandle
    });

    try {
      let transaction = await contract.createToken(url, formInput.name, socialAuthJson, { value: listingPrice });
      await transaction.wait()
    }
    catch(e) {
      console.log("error from transaction: ", e);

      setErrorMsg(e.message);
      setShowErrorMsg(true);
      return;
    }

    setMintSuccess(true);
  }

  const handleYourNameClicked = (event) => {
    if (event.target.value === "Your Name") {
      event.target.setSelectionRange(0, event.target.value.length);
    }
  }

  const handleDescriptionClicked = (event) => {
    event.target.setSelectionRange(0, event.target.value.length);
  }

  const methodsTabClicked = (event, methodClicked) => {
    event.preventDefault();
    setMethodSelected(methodClicked);
  }

  const previewClicked = async (event) => {

    setCreateSigBtnText("Create NFT");
    let imageBase64Data = null;

    if (methodSelected == CreateSigMethod.SIG_PAD) {
      sigPadRef.current.saveSigPadImage();
    }

    if (methodSelected == CreateSigMethod.UPLOAD) {
      uploadSigRef.current.saveUploadSigImage();
    }

    if (methodSelected == CreateSigMethod.STAMP) {
      sigStampRef.current.saveSigStampImage();
    }

    setShowPreviewDialog(true);
  }

  const handleSocialClicked = async (event, socialType) => {
    event.preventDefault();

    setSocialIsLinked(false);
    setSocialLinkHandle("");
    setSelectedSocialType(socialType);

    const linkSocialUrl = `/oauth/link-social?socialType=${socialType}`;
    createPopupWin(linkSocialUrl, `Link ${socialType}`, 800, 650);

    // @ts-ignore
    window.CallParentSocialLinkSuccess = function (socialHandle, socialName) {
       setSocialIsLinked(true);
       setSocialLinkHandle(socialHandle);
       setSocialLinkName(socialName);
    }

    // @ts-ignore
    window.CallParentSocialLinkFailed = function () {
      alert("Social Link Auth Failed");
    }
  }

  return (
  <>
    <div className="max-w-xl mx-auto">

      <div className="flex flex-col pb-12">
        <div className="row-auto">

            <input
              placeholder="Your Name"
              className="form-input w-full"
              value={formInput.name}
              onClick={handleYourNameClicked}
              onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
            />

        </div>

        <TabContainer className="row-auto">
          <TabHead className={`flex text-center border-b border-gray-200 dark:border-gray-700`}>
            <Tab className="mr-2 active">
              <Link href="/create-signature" onClick={(event) => methodsTabClicked(event, CreateSigMethod.SIG_PAD)}
                className={`inline-block p-4 rounded-t-lg hover:text-gray-600
                  hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300
                  ${methodSelected == CreateSigMethod.SIG_PAD ? 'font-bold' : ''}
                  `}>Signature Pad</Link>
            </Tab>

            <Tab className="mr-2">
              <Link href="/create-signature" onClick={(event) => methodsTabClicked(event, CreateSigMethod.CAMERA)}
                className={`inline-block p-4 rounded-t-lg
                  hover:text-gray-600 dark:hover:text-gray-300
                  hover:bg-gray-50 dark:hover:bg-gray-800
                  ${methodSelected == CreateSigMethod.CAMERA ? 'font-bold' : ''}
                  `}>Camera</Link>
            </Tab>

            <Tab className="mr-2">
              <Link href="/create-signature" onClick={(event) => methodsTabClicked(event, CreateSigMethod.UPLOAD)}
                className={`inline-block p-4 rounded-t-lg
                  hover:text-gray-600 dark:hover:text-gray-300
                  hover:bg-gray-50 dark:hover:bg-gray-800
                  ${methodSelected == CreateSigMethod.UPLOAD ? 'font-bold' : ''}
                  `}>Upload</Link>
            </Tab>

            {/*<Tab className="mr-2">
              <Link href="/create-signature" onClick={(event) => methodsTabClicked(event, CreateSigMethod.STAMP)}
                className={`inline-block p-4 rounded-t-lg hover:text-gray-600
                  hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300
                  ${methodSelected == CreateSigMethod.STAMP ? 'font-bold' : ''}
                  `}>Stamps</Link>
            </Tab>*/}
          </TabHead>

          <TabBody>
            {(methodSelected == CreateSigMethod.SIG_PAD) && <SignaturePad setSavedImage={setSavedImage} ref={sigPadRef} />}
            {(methodSelected == CreateSigMethod.CAMERA) && <SignatureCamera setSavedImage={setSavedImage} />}
            {(methodSelected == CreateSigMethod.UPLOAD) && <UploadSig setSavedImage={setSavedImage} ref={uploadSigRef} />}
            {(methodSelected == CreateSigMethod.STAMP) && <SignatureStamps ref={sigStampRef}
                                                                setSavedImage={setSavedImage} stickers={stickers} />}
          </TabBody>
        </TabContainer>

        {!session?.user && (<LoginButtons />)}

        {session?.user && (<Button
                            className="mt-2"
                            onClick={previewClicked}
                        >
                            Preview
                        </Button>)}


        {/*<button onClick={handleCreateNFTClicked} className="font-bold mt-4 bg-orange-500 text-white rounded p-4 shadow-lg">
          {isMinting ? `Minting NFT...` : `Create NFT`}
        </button>*/}
      </div>

      {/* Preview Dialog */}
      <Dialog size="lg" open={showPreviewDialog} handler={setShowPreviewDialog}>
        <DialogHeader>
            PREVIEW SIGNATURE NFT
        </DialogHeader>
        <DialogBody>

            {!mintSuccess && (<div id="preview-sig-form">
                <div>
                  {savedImage && (<Image src={`data:image/png;base64,${savedImage}`} width={500} height={400} alt="Preview Signature" />)}
                </div>

                <div>
                  <p className="text-base leading-relaxed text-gray-600 font-normal">
                    Connect a social profile to this signature.
                  </p>

                  {!socialIsLinked &&
                    (<div className="flex my-2">
                      <Link className="relative h-12 w-12 mx-1" href="/create-signature" onClick={(e) => handleSocialClicked(e, 'twitter')}>
                        <Image src={`/images/social/twitter.svg`} layout="fill" alt='Twitter' />
                      </Link>

                      <Link className="relative h-12 w-12 mx-1" href="/create-signature" onClick={(e) => handleSocialClicked(e, 'facebook')}>
                        <Image src={`/images/social/facebook.svg`} layout="fill" objectFit="cover"  alt='Facebook' />
                      </Link>

                      <Link className="relative h-12 w-12 mx-1" href="/create-signature" onClick={(e) => handleSocialClicked(e, 'linkedin')}>
                        <Image src={`/images/social/linkedin.svg`} layout="fill" objectFit="cover" alt='LinkedIn' />
                      </Link>

                      {/*<Link className="relative h-12 w-12 mx-1" href="/create-signature" onClick={(e) => handleSocialClicked(e, 'twitch')}>
                        <Image src={`/images/social/twitch.svg`} layout="fill" objectFit="cover" alt='Twitch' />
                      </Link>*/}
                    </div>)
                  }

                  {socialIsLinked &&
                    (<>
                      <div className="flex flex-col my-2 text-green-600 font-bold">
                        <div>Linked {selectedSocialType}: {socialLinkName}</div>
                        <div>
                          <Link className="flex mx-4 text-blue-600 text-sm font-bold" href="/create-signature"
                            onClick={(event) => {event.preventDefault(); setSocialLinkHandle(""); setSocialIsLinked(false);} }>
                          [Reset Social Link]
                          </Link>
                        </div>
                      </div>
                    </>)
                  }
                </div>
              </div>)
            }

            {mintSuccess && (
              <div>
                <p className="text-green-600 font-bold">
                  Signature Created Successfully.  You can now use it to sign any assets or documents that belong to you.
                </p>

              </div>)
            }
        </DialogBody>
        <DialogFooter>
            <Button
                className="mr-1"
                color="red"
                onClick={(e) => setShowPreviewDialog(false)}
            >
                Close
            </Button>

            {!mintSuccess &&
              (<Button
                color="green"
                onClick={(e) => {handleCreateNFTClicked(e); }}
            >
                {createSigBtnText}
            </Button>)}

            {mintSuccess && (
                  <Button color="orange"
                      onClick={(e) => { router.push("/sign-nft") }}>
                      Go Sign an NFT
                  </Button>)}
        </DialogFooter>
      </Dialog>

      <ErrorDialog
        errorMsg={errorMsg}
        showErrorMsg={showErrorMsg}
        setShowErrorMsg={setShowErrorMsg} />
    </div>
  </>
  );
}

export default CreateLegitSig;
