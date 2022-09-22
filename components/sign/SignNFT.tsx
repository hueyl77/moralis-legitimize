import { ethers, providers } from "ethers";

import { useSession } from "next-auth/react";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';

import LoginButtons from '../login/LoginButtons';

import Image from 'next/image';
import Head from "next/head";
import Link from "../shared/Link";

import { Button, Checkbox,
  Dialog, DialogHeader, DialogBody, DialogFooter,
  Textarea } from "@material-tailwind/react";

import axios from 'axios';

import Dropzone from 'react-dropzone';

import CreateLegitSig from '../create/CreateLegitSig';
import { license1 } from "../../lib/licenses";

import { getEditorDefaults,
  createMarkupEditorToolStyle,
  createMarkupEditorShapeStyleControls,
  createDefaultImageWriter } from 'pintura';

// @ts-ignore
import { PinturaEditor } from 'react-pintura';

import { getBase64 } from "../../lib/utils";

import {
  legitSignatureAddress, legitNFTAddress
} from '../../_ethereum/config';

import LegitSignature from '../../_ethereum/artifacts/contracts/LegitSignature.sol/LegitSignature.json';
import LegitNFT from '../../_ethereum/artifacts/contracts/LegitNFT.sol/LegitNFT.json';

const noImageSrc = 'https://legitimize.mypinata.cloud/ipfs/QmZ6TKhV4NRsEY6yLEJFXmYK7uvJEHhiefcom9K33VhPnN/u8umflvv5bg31.jpg';


type LegitSignatureItem = {
  name: string;
  socialAuth: any;
  imageUrl: string;
  tokenId: number;
}

const SignNFT: React.FC = ({ children }) => {

  const router = useRouter();

  const { data: session, status } = useSession();

  const [signatures, setSignatures] = useState([]);
  const [stickersPaths, setStickersPaths] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');

  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [signedPreviewImg, setSignedPreviewImg] = useState(null);
  const [showWalletLockedDialog, setShowWalletLockedDialog] = useState(false);

  const [walletBtnText, setWalletBtnText] = useState("Connect Wallet");
  const [createNFTBtnText, setCreateNFTBtnText] = useState("Create Signed NFT");

  const [selectedStickerPath, setSelectedStickerPath] = useState("");
  const [selectedSignature, setSelectedSignature] = useState(null);

  const [successImgUrl, setSuccessImgUrl] = useState("");

  const verifyUrl = `${process.env.NEXT_PUBLIC_LEGIT_BASE_URL}/verify`;


  const [formInput, updateFormInput] = useState({
    name: 'Legit NFT Name',
    description: `A signed and creator authenticated NFT.\n\nVerify signatures at ${verifyUrl}`,
    amount: 1,
    legalTerms: "Some Legal Terms Title" })

  const [mintSuccess, setMintSuccess] = useState(false);
  const [showMintSuccess, setShowMintSuccess] = useState(false);

  const [mintedNFTAddr, setMintedNFTAddr] = useState("");
  const [mintedHash, setMintedHash] = useState("");

  async function loadSignatures() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();

      const contract = new ethers.Contract(legitSignatureAddress, LegitSignature.abi, signer);
      const data = await contract.fetchMySignatures();

      const items = await Promise.all(data.map(async i => {

        let tokenUri = await contract.tokenURI(i.tokenId);
        try {
          const meta = await axios.get(tokenUri);

          let item = {
            tokenId: i.tokenId.toNumber(),
            name: meta.data.name,
            description: meta.data.description,
            socialAuth: meta.data.socialAuth,
            image: meta.data.image ? meta.data.image.replace('legitimize-qa.mypinata.cloud', 'legitimize.mypinata.cloud') : null,
          }
          return item;
        }
        catch {
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

      setSignatures(items);
      setLoadingState('loaded');
    }
    catch (error) {
      console.log("errored calling loadNFTs: ", error);
    }

  }

  {/************************************************
   Use Effect Hooks
  ************************************************/}

  useEffect(() => {
      loadSignatures();
  }, [])

  useEffect(() => {
    if (!signatures || signatures.length === 0) {
      return;
    }

    let sigImagePaths = signatures.filter(sig => sig.image).map((nft) => {return nft.image || noImageSrc});

    let stickers = [];
    sigImagePaths.forEach(imgPath => {
      stickers.push({
          src: imgPath,
          mount: onMountSticker,
        });
    });

    setStickersPaths(stickers);
  }, [signatures])

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

  if (signatures.length > 0) {
    editorConfig.utils = [ 'sticker'];
    editorConfig.util = 'sticker';
  }


  // function to execute when a signature sticker is selected
  editorConfig.beforeAddShape = (shape) => {

      // clear existing stickers
      pinturaEditor.current.editor.imageAnnotation = [];

      // @ts-ignore
      setSelectedStickerPath(shape.backgroundImage);

      let foundSig = false;

      signatures.forEach((sig) => {
        // @ts-ignore
        if (sig.image == shape.backgroundImage) {
          // found the sig
          foundSig = true;
          setSelectedSignature({
            name: sig.name,
            imageUrl: sig.image,
            tokenId: sig.tokenId,
            socialAuth: sig.socialAuth,
            contractAddr: legitSignatureAddress
          });
          return;
        }
      });

      if (!foundSig) {
        alert("Error locating signature in loaded array!");
      }

      return true;
  };

  editorConfig.beforeSelectShape = (current, target) => {
      // console.log('beforeSelectShape', current, target);
      return true;
  };

  editorConfig.beforeDeselectShape =  (current, target) => {
      // console.log('beforeDeselectShape', current, target);
      return true;
  };

  editorConfig.beforeUpdateShape = (shape, props, context) => {
    // console.log('beforeUpdateShape', shape, props, context);
    return props;
  };

  editorConfig.beforeRemoveShape = (shape) => {
      // console.log('beforeRemoveShape', shape);
      return true;
    };

  editorConfig.willRenderShapeControls = (controls, selectedShapeId) => {
      // console.log('willRenderShapeControls', selectedShapeId);
      // Manipulate or add controls here

      return controls;
  };

  {/************************************************
    Constants and states variables
  ************************************************/}

  const maxFileSize = 1073741824; // 1GB

  const [selectedFile, setSelectedFile] = useState(null);
  const [rejectedFile, setRejectedFile] = useState(false);
  const [previewImg, setPreviewImage] = useState('');

  const [errorText, setErrorText] = useState("");

  {/************************************************
    Web3 Functions
  ************************************************/}
  async function uploadToIPFS(signedPreviewImg, original) {

    const base64data = await getBase64(original);
    let origFileBase64Data = base64data?.split(',')[1];

    try {
      const response = await axios.post('/api/legit-nft', {
        legitNFTAddress: legitNFTAddress,
        assetName: formInput.name,
        description: formInput.description,
        amount: formInput.amount,
        signedPreviewImg: signedPreviewImg,
        origFile: origFileBase64Data,
        origFileType: original.type
      });

      if (response.status === 200) {
        const ipfsCID = response.data.metadataResult?.IpfsHash;
        const jsonData = response.data.jsonData;

        const pinnedDataUrl = `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${ipfsCID}`;

        return { pinnedDataUrl, ipfsCID, jsonData};
      }


    } catch (error) {
      console.log('Error calling sig-nft api: ', error)
    }
  }

  async function mintNFT(ipfsHash, pinnedResult) {

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();

    let legitContract = new ethers.Contract(legitNFTAddress, LegitNFT.abi, signer)

    let metadataUrl = pinnedResult.pinnedDataUrl;
    let previewImageUrl = pinnedResult.jsonData.previewImage;

    let origFileCid = pinnedResult.jsonData.origFileCid;
    let origFileUrl = pinnedResult.jsonData.originalFile;

    let transaction = await legitContract.mint(metadataUrl, ipfsHash, legitSignatureAddress, selectedSignature.tokenId,
      previewImageUrl, origFileCid, origFileUrl);

    try {
      await transaction.wait()
    }
    catch(err) {
      // pass
      console.log(err);
    }

    //console.log("MINT success!  transaction: ", transaction);

    setMintSuccess(true);
    setShowPreviewDialog(false);

    setMintedNFTAddr(transaction?.to);
    setMintedHash(transaction?.hash);
    setSuccessImgUrl(previewImageUrl);
    setShowMintSuccess(true);
  }


  {/************************************************
    UI Event Handlers
  ************************************************/}

  const previewClicked = async (event) => {

    if (pinturaEditor.current) {
      await pinturaEditor.current.editor.processImage();
    }

    setShowPreviewDialog(true);
  }

  const handleCreateNFTClicked = async (event) => {
    event.target.disabled = true;
    setIsMinting(true);

    setCreateNFTBtnText("Processing...");

    let pinnedResult = await uploadToIPFS(signedPreviewImg, selectedFile);
    // console.log("pinnedResult: ", pinnedResult)

    if (pinnedResult) {
      await mintNFT(pinnedResult.ipfsCID, pinnedResult);
      return;
    }

    console.log("Error encountered minting Sig NFT");
    return;
  }

  const handleCreateSigClicked = async (event) => {
    router.push("/create-signature");
  }

  const resetSelectedFile = (event) => {
    event.preventDefault();
    setPreviewImage(null);
    setSelectedFile(null);
  }

  {/************************************************
    Image Editor event handlers
  ************************************************/}

  const rejectFile = (msg) => {
    console.log("File rejected: " + msg);
    setErrorText(msg);
    setRejectedFile(true);
  }

  const handleSelectedFile = (acceptedFiles, fileRejections) => {

    if (fileRejections !== null && fileRejections.length > 0 && fileRejections[0].errors !== null) {
      const dropzoneErrorMsgs = fileRejections[0].errors.map(e => {
        if (e.code === "file-invalid-type") {
          return "Invalid file type";
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

    if (file.type.indexOf('image') > -1) {
      let imgUrl = URL.createObjectURL(file);
      setPreviewImage(imgUrl);
    }
    else if (file.type == "application/pdf") {
      setPreviewImage("/images/pdf-preview-img.png");
    }
    else if (file.type.indexOf('audio') > -1) {
      setPreviewImage("/images/audio-preview-img.png");
    }
    else if (file.type.indexOf('video') > -1) {
      setPreviewImage("/images/video-preview-img.png");
    }
    else if (file.type.indexOf('application/epub') > -1) {
      setPreviewImage("/images/epub-preview-img.png");
    }
    else {
      setPreviewImage("/images/document-preview-img.png");
    }

    return;
  }

  const onMountSticker = (element, sticker) => {
    // console.log("sticker mounted:", sticker);
  };

  const handleOnProcess = async (result) => {

    const processedFile = result.dest;
    const base64data = await getBase64(processedFile);

    let imageBase64Data = base64data?.split(',')[1];

    setSignedPreviewImg(imageBase64Data);
  }

  {/************************************************
    Render elements
  ************************************************/}

  return (
  <>
    <div className="grid md:grid-cols-12 gap-6">
      {/*left column*/}
      <div className="md:col-span-6">
        <div className="file-uploader" id="fileUploader" style={{display: `${!selectedFile ? 'block' : 'none'}`}}>
          <Dropzone
            onDrop={handleSelectedFile}

            accept={
              {
                'application/epub+zip': ['.epub'],
                'application/gzip': ['.gz'],
                'application/msword': ['.doc', '.docx'],
                'application/pdf': ['.pdf'],
                'application/rtf': ['.rtf'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                'application/vnd.ms-powerpoint': ['.ppt'],
                'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
                'application/vnd.rar': ['.rar'],
                'application/x-7z-compressed': ['.7z'],
                'application/zip': ['.zip'],
                'audio/*': [],
                'image/*': [],
                'text/*': [],
                'video/*': [],
              }
            }
            maxSize={maxFileSize}
            noClick={false}
            multiple={false}>

            {({getRootProps, getInputProps}) => (
              <div {...getRootProps()} className='dropzone-container'>
                <input {...getInputProps()} />
                <p>Drag &apos;n&apos; drop a file here<br/>
                 or click to select file</p>
              </div>
            )}
          </Dropzone>
        </div>

        <div className="file-uploader" id="imageEditor" style={
          {
            visibility: `${selectedFile ? 'visible' : 'hidden'}`,
            position: `${selectedFile ? 'relative' : 'absolute'}`,
          }}>

          <PinturaEditor
            ref={pinturaEditor}
            {...editorConfig}
            mimeType='image/jpeg'
            src={previewImg}
            stickers={stickersPaths}
            onProcess={handleOnProcess}
            stickerEnableSelectImage={false}
          />
        </div>

        <div className="text-center">
          <div className="float-left">
            { selectedFile && <span>Selected File: {selectedFile.name}</span>}
          </div>
          <Link className="text-blue-600 text-sm font-bold float-right mr-2" href="#"
            onClick={resetSelectedFile }>
            [Reset Selected File]
          </Link>
        </div>

        <div className="row-auto break-words hidden">
          <div>Selected Signature Path:</div>
          <div>{selectedStickerPath}</div>
        </div>
      </div>

      {/*right column*/}
      <div className="md:col-span-6">

        {/*Wallet Connect buttons*/}
        <div id="wallet-connect-buttons" className="flex justify-center align-middle">
          <div className="row-auto">

            { !session?.user &&
              (<LoginButtons />)
            }

            { (session?.user && signatures.length == 0) &&
              (<div id="no-sig-msg">
                <p>No signatures detected in the connected wallet
                  or your wallet is locked.</p>

                <Button className="mt-2 w-80" onClick={handleCreateSigClicked}>
                  Let&apos;s Create a Signature
                </Button>
              </div>)
            }
          </div>
        </div>

        {/*NFT Input Form*/}
        {(session?.user && signatures.length > 0) && (<div id="nft-input-form">

            <div className="row-auto">
              <div className="">
                <label className="form-label">1) Select a document, image, music or video file to upload.</label>

              </div>
            </div>

            <div className="row-auto">
              <div className="mt-4">
                <label className="form-label">2) Select a signature at the bottom of the image editor.</label>
                <p className="mt-2 ml-4 text-sm">
                  You can resize and position the signature on the preview image of the NFT.  This is for
                  preview image only and does not alter the original file.
                </p>
              </div>
            </div>

            <div className="row-auto mt-4">
              <div>
                <label className="form-label">3) Enter a Name for the NFT:</label>
              </div>
              <div className="mt-2">
                <input
                  placeholder="NFT Name"
                  className="form-input w-full"
                  value={formInput.name}
                  onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                />
              </div>
            </div>

            <div className="row-auto mt-4">
              <div>
                <label className="form-label">4) Enter a description for the NFT:</label>
              </div>
              <div className="mt-2">
                <textarea
                  placeholder="Asset Description"
                  className="form-input w-full"
                  rows={4}
                  value={formInput.description}
                  onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                />
              </div>
            </div>

            <div className="row-auto mt-4 hidden">
              <div>
                <label className="form-label">5) Enter how many in this version:</label>
              </div>
              <div className="mt-2">
                <input
                  type="number"
                  placeholder="1"
                  min="1"
                  className="form-input w-full"
                  value={formInput.amount}
                  onChange={e => updateFormInput({ ...formInput, amount: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="row-auto flex-col mt-4">
              <div>
                <label className="form-label">5) Select legal text to embed</label>
              </div>
              <div className="flex items-center"><Checkbox defaultChecked /> Usage - allow full permissions to view, read, listen, or watch</div>
              <div className="flex items-center"><Checkbox  /> Copies Permission - allow restricted permissions to make copies</div>
              <div className="flex items-center"><Checkbox  /> Alterations - allow restricted permissions to make modifications</div>
              <div className="flex items-center"><Checkbox  /> Full ownership and copyrights - transfer full copyrights and ownership to owner</div>
            </div>

            <div className="row-auto">
              <Button className="mt-2 drop-shadow-lg" onClick={previewClicked}>
                Preview and Mint
              </Button>
            </div>
          </div>)
        }
      </div>

    </div>

    {/* Success Dialog */}
    <Dialog size="xl" open={showMintSuccess} handler={setShowMintSuccess}>
      <DialogHeader>
          <div className="font-bold text-orange">
            Congratulations!  You have successfully minted your signed NFT.
          </div>
      </DialogHeader>
      <DialogBody>
        <div className="grid md:grid-cols-12 w-full">
            <div className="md:col-span-6">
              <div className="relative h-96">
                <Image src={successImgUrl}
                  layout='fill' objectFit='contain' alt="Preview Signed Image" />
              </div>
            </div>

            <div className="md:col-span-6 font-normal overflow-y-scroll ml-2">
                <div className="flex-col">
                  <label className="font-bold">NFT Address: </label>
                  <div className="break-words">{mintedNFTAddr}</div>
                </div>

                <div className="flex-col mt-2">
                  <label className="font-bold">Transaction Hash: </label>
                  <div className="break-words">{mintedHash}</div>
                </div>

                <div className="flex-col mt-2">
                  <label className="font-bold">Social Auth: </label>

                  {selectedSignature?.socialAuth && <div className="flex align-center items-center my-2">
                    <Link className="relative h-12 w-12 mx-1" href="/sign-nft" onClick={(e) => {e.preventDefault()}}>
                      <Image src={`/images/social/${selectedSignature.socialAuth?.authType}.svg`} layout="fill" alt='Social Icon' className="drop-shadow-lg" />
                    </Link>
                    <div className="ml-2">
                      <p>{selectedSignature.socialAuth?.socialName || selectedSignature.socialAuth?.authType }</p>
                      <p>{selectedSignature.socialAuth?.socialHandle }</p>
                    </div>
                  </div>}
                </div>

                <div className="flex-col mt-2">
                  <label className="font-bold">License</label>
                  <Textarea variant="outlined" size="md" value={license1} onChange={e =>{}} />
                </div>
            </div>
          </div>
      </DialogBody>
      <DialogFooter>
          <Button
              onClick={(e) => {setShowMintSuccess(false); router.push("/dashboard"); }}
          >
              View in Dashboard
          </Button>
      </DialogFooter>
    </Dialog>

    {/* Preview Dialog */}
    <Dialog size="xl" open={showPreviewDialog} handler={setShowPreviewDialog}>
      <DialogHeader>
          <div className="text-blue-600">PREVIEW SIGNED NFT</div>
      </DialogHeader>
      <DialogBody>
          <div className="grid md:grid-cols-12 w-full gap-4">
            <div className="md:col-span-6">
              <div className="relative w-full h-96">
                <Image src={`data:image/jpeg;base64,${signedPreviewImg}`} style={{borderRadius: "20px"}}
                   layout='fill' objectFit='contain' alt="Preview Signed Thumbnail" />
              </div>
            </div>

            <div className="md:col-span-6 font-normal overflow-y-scroll">
                <div className="flex-col">
                  <label className="font-bold">Creator: </label>
                  <div>{selectedSignature?.name}</div>
                </div>

                <div className="flex-col mt-2">
                  <label className="font-bold">Signature ContractAddr: </label>
                  <div>{selectedSignature?.contractAddr}</div>
                </div>

                <div className="flex-col mt-2">
                  <label className="font-bold">Signature Token ID: </label>
                  <div>{selectedSignature?.tokenId}</div>
                </div>

                <div className="flex-col mt-2">
                  <label className="font-bold">Social Auth: </label>

                  {selectedSignature?.socialAuth && <div className="flex align-center items-center my-2">
                    <Link className="relative h-12 w-12 mx-1" href="/sign-nft" onClick={(e) => {e.preventDefault()}}>
                      <Image src={`/images/social/${selectedSignature.socialAuth?.authType}.svg`} layout="fill" alt='Social Icon' className="drop-shadow-lg" />
                    </Link>
                    <div className="ml-2">
                      <p>{selectedSignature.socialAuth?.socialName || selectedSignature.socialAuth?.authType }</p>
                      <p>{selectedSignature.socialAuth?.socialHandle }</p>
                    </div>
                  </div>}
                </div>

                <div className="flex-col mt-2">
                  <label className="font-bold">License</label>
                  <Textarea variant="outlined" size="md" value={license1} onChange={e =>{}} />
                </div>
            </div>
          </div>
      </DialogBody>
      <DialogFooter>
          <Button
              className="bg-gray-100 text-gray-400"
              onClick={(e) => setShowPreviewDialog(false)}
          >
              Close
          </Button>

          <Button
              className="ml-1"
              onClick={handleCreateNFTClicked}
          >
              { createNFTBtnText}
          </Button>
      </DialogFooter>
    </Dialog>
  </>
  );
}

export default SignNFT;
