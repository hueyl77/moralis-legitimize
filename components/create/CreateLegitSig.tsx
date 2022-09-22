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
    name: 'Enter Your Name',
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
    if (event.target.value === "Enter Your Name") {
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

        {!session?.user && (
          <>
            <p className="my-4 text-center">Connect your wallet to store the NFT</p>
            <LoginButtons />
          </>
        )}

        {session?.user && (<Button
                            className="mt-2"
                            onClick={previewClicked}
                        >
                            Preview
                        </Button>)}

      </div>

      {/* Preview Dialog */}
      <Dialog size="xl" open={showPreviewDialog} handler={setShowPreviewDialog}>
        <DialogHeader className="text-legitBlue-500" style={{background: "aliceblue"}}>
            PREVIEW SIGNATURE NFT
        </DialogHeader>
        <DialogBody className="w-full">

            {!mintSuccess && (<div id="preview-sig-form relative" style={{width: "100%"}}>
                <div className="mx-auto text-center">
                  {savedImage && (<Image src={`data:image/png;base64,${savedImage}`} width={574} height={298} alt="Preview Signature" />)}
                </div>

                <div className="px-4 py-6" style={{background: "aliceblue"}}>
                  <p className="text-base leading-relaxed text-legitBlue-700 font-normal">
                    Connect a social profile to this signature.
                  </p>

                  {!socialIsLinked &&
                    (<div className="flex my-2">
                      <Link className="relative h-12 w-12 mx-1" href="/create-signature" onClick={(e) => handleSocialClicked(e, 'twitter')}>
                        <Image src={`/images/social/twitter.svg`} layout="fill" alt='Twitter' className="drop-shadow-lg opacity-90 hover:opacity-100" />
                      </Link>

                      <Link className="relative h-12 w-12 mx-1" href="/create-signature" onClick={(e) => handleSocialClicked(e, 'facebook')}>
                        <Image src={`/images/social/facebook.svg`} layout="fill" objectFit="cover" alt='Facebook' className="drop-shadow-lg opacity-90 hover:opacity-100" />
                      </Link>

                      <Link className="relative h-12 w-12 mx-1" href="/create-signature" onClick={(e) => handleSocialClicked(e, 'linkedin')}>
                        <Image src={`/images/social/linkedin.svg`} layout="fill" objectFit="cover" alt='LinkedIn' className="drop-shadow-lg opacity-90 hover:opacity-100" />
                      </Link>

                      {/*<Link className="relative h-12 w-12 mx-1" href="/create-signature" onClick={(e) => handleSocialClicked(e, 'twitch')}>
                        <Image src={`/images/social/twitch.svg`} layout="fill" objectFit="cover" alt='Twitch' />
                      </Link>*/}
                    </div>)
                  }

                  {socialIsLinked &&
                    (<>
                      <div className="flex flex-col my-2 text-gray-600">
                        <div className="flex align-center">
                          <Image src={`/images/social/${selectedSocialType}.svg`} width="40" height="40" alt='Twitter' className="drop-shadow-lg" />
                          <div className="ml-3 flex items-center font-bold">Linked User: {socialLinkName}</div>
                        </div>
                        <div>
                          <Link className="flex mt-2 mx-2 text-blue-600 text-sm font-bold" href="/create-signature"
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
                <p className="font-bold">
                  Signature NFT Created Successfully.
                </p>

              </div>)
            }
        </DialogBody>
        <DialogFooter>
            <Button
                className="mr-1 drop-shadow-lg bg-gray-400"
                onClick={(e) => setShowPreviewDialog(false)}
            >
                Close
            </Button>

            {!mintSuccess &&
              (<Button
                className="drop-shadow-lg"
                onClick={(e) => {handleCreateNFTClicked(e); }}
            >
                {createSigBtnText}
            </Button>)}

            {mintSuccess && (
                  <Button className="drop-shadow-lg"
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
