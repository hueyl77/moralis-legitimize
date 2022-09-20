const piexif = require("piexifjs");

import { pinBase64ToIPFS, pinDataToIPFS, pinJSON } from "./lib/pinata-utils.js";
import { license1 } from "../../lib/licenses.js";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1024mb'
        }
    }
}

const Endpoint = async (req, res) => {

  if (req.method == 'POST') {
    const {assetName, description, amount, signedPreviewImg, origFileType, origFile, legitNFTAddress } = req.body;

    const randomNum = Math.floor(Math.random() * 100000000);
    const mTimestamp = Date.now();

    // Pin original file to Pinata
    const tempOrigFileName = `${assetName.replace(/\s/g, '')}.orig.${randomNum}.${mTimestamp}.jpg`;

    const origFilePinOptions = {
      pinataMetadata: {
        name: tempOrigFileName
      },
      pinataOptions: {
        cidVersion: 1
      }
    };

    const pinOrigResult = await pinBase64ToIPFS(tempOrigFileName, origFile, origFilePinOptions);

    const origFileUrl = `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${pinOrigResult.IpfsHash}`;

    // load previewImage and insert exif data
    const tempFileName = `${assetName.replace(/\s/g, '')}.${randomNum}.${mTimestamp}.jpg`;

    let previewImgBuff = Buffer.from(signedPreviewImg, 'base64');
    let previewData = previewImgBuff.toString("binary");

    let zeroth = {};
    let exif = {};
    let gps = {};

    zeroth[piexif.ImageIFD.Make] = "Make";
    zeroth[piexif.ImageIFD.Software] = "Legitimize";
    exif[piexif.ExifIFD.UserComment] = JSON.stringify({
      "legitNFTAddress": legitNFTAddress,
      "origFileCID": pinOrigResult.IpfsHash,
      "origFileUrl": origFileUrl
    });

    let exifObj = {"0th":zeroth, "Exif":exif, "GPS":gps};
    let exifbytes = piexif.dump(exifObj);

    let imgWithExifData = piexif.insert(exifbytes, previewData);

    let newJpeg = Buffer.from(imgWithExifData, "binary");

    /* for testing - save file to temp folder */
    // const tempFilePathWithExif = `./public/temp/${tempFileName}.withexif.jpg`;
    // await fs.writeFileSync(tempFilePathWithExif, newJpeg);

    const previewImgPinOptions = {
      pinataMetadata: {
        name: tempFileName
      },
      pinataOptions: {
        cidVersion: 1
      }
    };

    const pinResult = await pinDataToIPFS(tempFileName, newJpeg, previewImgPinOptions);
    const previewImageUrl = `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${pinResult.IpfsHash}`;

    // upload metadata json
    const jsonData = {
      name: assetName,
      description,
      amount,
      image: previewImageUrl,
      previewImage: previewImageUrl,
      external_url: previewImageUrl,
      originalFile: origFileUrl,
      origFileType: origFileType,
      legitNFTAddress: legitNFTAddress,
      origFileCid: pinOrigResult.IpfsHash,
      legalTerms: license1
    };

    // console.log("uploading NFT metadata to Pinata, jsonData: ", jsonData);

    const pinJsonOptions = {
      pinataMetadata: {
        name: `${assetName} metadata`
      },
      pinataOptions: {
        cidVersion: 1
      }
    };

    // pin metadata to Pinata
    try {
      const metadataResult = await pinJSON(jsonData, pinJsonOptions);

      res.status(200).json({
        metadataResult,
        jsonData,
      });

    } catch (error) {
      console.log('Error uploading file: ', error)
    }


  }
  else {
    res.status(403).json({
      "status": "Forbidden"
    });
  }
};

export default Endpoint;
