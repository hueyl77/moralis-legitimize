import { useState , useRef, useCallback} from 'react';
import axios from 'axios';

import Webcam from "react-webcam";
import Image from 'next/image';

export default function SignatureCamera({ setSavedImage }) {

  const webcamRef = useRef(null);
  const [photoData, setPhotoData] = useState("");
  const [noBgPhoto, setNoBgPhoto] = useState("");

  const [isPreviewing, setIsPreviewing] = useState(false);

  const takePhoto = useCallback(async () => {
      if (!webcamRef.current) {
        return;
      }

      webcamRef.current.disabled = true;
      setIsPreviewing(true);

      const imageSrc = webcamRef.current.getScreenshot();
      setPhotoData(imageSrc);

      const randomNum = Math.floor(Math.random() * 100000000);
      const mTimestamp = Date.now();

      const response = await axios.post('/api/remove-bg', {
        assetName: `camera-sig-${randomNum}.${mTimestamp}`,
        sigData: imageSrc?.split(',')[1]
      });

      if (response.status === 200) {
        setNoBgPhoto(response.data.base64img);
        setSavedImage(response.data.base64img);
      }
    },
    [webcamRef, setSavedImage]
  );

  return (
    <div className="row-auto my-4 flex flex-col justify-center items-center h-350">
      {/*<input type="file" accept="image/*" capture="camera" />*/}
      {(photoData == "" && noBgPhoto == "") && <Webcam width={400} height={350} ref={webcamRef} screenshotFormat="image/png" />}

      {(photoData != "" && noBgPhoto == "") && <Image src={photoData} alt="Photo of Signature" width={400} height={330}  />}

      {(noBgPhoto != "") && <Image className="bg-white" src={`data:image/png;base64,${noBgPhoto}`} alt="Photo of Signature No Background" width={400} height={330}  />}

      <div id="webcam-btn-wrapper">
        {noBgPhoto == "" && <button onClick={takePhoto} className="btn-sm text-white
                    bg-teal-500 hover:bg-teal-400 mt-2 w-40">{isPreviewing ? `Processing...` : `Take Picture`}</button>}
      </div>
    </div>
  );
}