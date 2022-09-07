import { RemoveBgResult, RemoveBgError, removeBackgroundFromImageBase64 } from "remove.bg";

const fs = require("fs");
const path = require("path");

const Endpoint = async (req, res) => {

  if (req.method == 'POST') {
    const {assetName, sigData } = req.body;

    try {
      const result: RemoveBgResult = await removeBackgroundFromImageBase64({
        base64img: sigData,
        apiKey: process.env.REMOVE_BG_APIKEY,
        size: "preview",
        type: "auto",
        format: "png",
        crop: true
      });

      res.status(200).json({
        "base64img": result.base64img
      });

    } catch (error) {
      console.log('Error removing bg: ', error)
    }
  }
  else {
    res.status(403).json({
      "status": "Forbidden"
    });
  }
};

export default Endpoint;


