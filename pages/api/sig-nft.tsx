import { pinBase64ToIPFS, pinJSON } from "./lib/pinata-utils.js";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1024mb' // limit to 1GB
        }
    }
}

const Endpoint = async (req, res) => {

  if (req.method == 'POST') {
    const {assetName, description, socialAuthJson, sigData } = req.body;

    const randomNum = Math.floor(Math.random() * 100000000);
    const mTimestamp = Date.now();

    const tempFileName = `${assetName.replace(/\s/g, '')}.${randomNum}.${mTimestamp}.png`;

    const pinataOptions = {
      pinataMetadata: {
        name: `sig-${tempFileName}`
      },
      pinataOptions: {
        cidVersion: 1
      }
    };

    const pinResult = await pinBase64ToIPFS(tempFileName, sigData, pinataOptions);

    // upload metadata json
    const imageUrl = `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${pinResult.IpfsHash}`;
    const jsonData = {
      name: assetName,
      description,
      socialAuth: socialAuthJson,
      image: imageUrl,
      external_url: imageUrl,
    };

    const pinJsonOptions = {
      pinataMetadata: {
        name: `${assetName} metadata`
      },
      pinataOptions: {
        cidVersion: 1
      }
    };

    try {
      const metadataResult = await pinJSON(jsonData, pinJsonOptions);

      res.status(200).json({
        ...metadataResult
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