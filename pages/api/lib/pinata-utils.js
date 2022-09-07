const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const { Readable } = require('stream');
const AWS = require('aws-sdk');

const pinata = pinataSDK(process.env.PINATA_APIKEY, process.env.PINATA_SECRET_KEY);

export const pinFromFS = async (sourcePath, options) => {

  try {
    const result = await pinata.pinFromFS(sourcePath, options);
    return result;
  }
  catch(err) {
    console.log("pinning asset error, error: ", err);
  }

  return null;
}

export const pinBase64ToIPFS = async (filename, base64DataStr, options) => {

  const buff = Buffer.from(base64DataStr,'base64');

  const stream = Readable.from(buff);
  stream.path = filename;

  try {

      const result = await pinata.pinFileToIPFS(stream, options);

      return result;
    }
    catch(err) {
      console.log("pinning asset error in pinBase64ToIPFS: ", err);
    }

  return null;
}

export const pinDataToIPFS = async (filename, data, options) => {

  const stream = Readable.from(data);
  stream.path = filename;

  try {

      const result = await pinata.pinFileToIPFS(stream, options);

      return result;
    }
    catch(err) {
      console.log("pinning asset error in pinBase64ToIPFS: ", err);
    }

  return null;
}

export const awsPinBase64ToIPFS = async (filename, base64DataStr, contentType, options) => {

  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_LEGIT_ACCESS_KEY,
    secretAccessKey: process.env.AWS_LEGIT_SECRET,
    region: process.env.AWS_LEGIT_REGION
  })

  const buf = Buffer.from(base64DataStr,'base64')

  const awsParams = {
    Bucket: 'legitimize/temp',
    Key: filename,
    Body: buf,
    ContentEncoding: 'base64',
    ContentType: contentType
  }
  await s3.upload(awsParams).promise()

  try {

      const getObjParams = {
        Bucket: 'legitimize/temp',
        Key: filename
      }

      const dataStream = await s3.getObject(getObjParams).createReadStream();

      const result = await pinata.pinFileToIPFS(dataStream, options);
      return result;
    }
    catch(err) {
      console.log("pinning asset error in pinStreamToIPFS: ", err);
    }


  return null;
}

export const pinJSON = async (jsonObj, options) => {
  try {
    const result = await pinata.pinJSONToIPFS(jsonObj, options);
    return result;
  }
  catch(err) {
    console.log("pinning json error, error: ", err);
  }

  return null;
}

export const uploadAsset = async (imgData) => {
  const dataStream = base64ToStream(imgData);
  const options = {
    pinataMetadata: {
        name: "Testing Pinata Uplaod"
    }
  };

  try {
    const result = await pinata.pinFileToIPFS(dataStream, options);
    return result;
  }
  catch(err) {
    console.log("errored calling pinata.pinFiletoIPFS: ", err);
    throw err;
  }

  return null;
}

export const base64ToStream = (base64Str) => {

  var dataBuffer = new Buffer(base64Str, 'base64');

  const stream = Readable.from(dataBuffer.toString());
  return stream;
}

