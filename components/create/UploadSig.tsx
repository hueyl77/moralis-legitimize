import { useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';

import Dropzone from 'react-dropzone';
import Image from 'next/image';
import { getBase64 } from "../../lib/utils";

interface UploadSigProps {
  setSavedImage: (imageBase64Data: string) => void;
}

const UploadSig = forwardRef((props: UploadSigProps, ref) => {

  useImperativeHandle(ref, () => ({
    async saveUploadSigImage() {
      const reader = new FileReader();

      await reader.readAsDataURL(selectedFile);
      reader.onload = async function(e) {
        const imageSrc = e.target.result as string;

        const randomNum = Math.floor(Math.random() * 100000000);
        const mTimestamp = Date.now();

        const response = await axios.post('/api/remove-bg', {
          assetName: `upload-sig-${randomNum}.${mTimestamp}`,
          sigData: imageSrc.split(',')[1]
        });

        if (response.status === 200) {
          props.setSavedImage(response.data.base64img);
        }
      }
    }
  }));

  const maxFileSize = 1073741824; // 1GB

  const [hasSelectedImage, setHasSelectedImage] = useState(false);
  const [selectedImgUrl, setSelectedImgUrl] = useState("/images/transparent-574x298.png");
  const [selectedFile, setSelectedFile] = useState(null);
  const [rejectedFile, setRejectedFile] = useState(false);

  const [errorText, setErrorText] = useState("");

  const rejectFile = (msg) => {
    console.log("File rejected: " + msg);
    setErrorText(msg);
    setRejectedFile(true);
  }

  const handleSelectedFile = (acceptedFiles, fileRejections) => {
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
    if (file.type.indexOf('image') > -1) {
      setHasSelectedImage(true);

      let imgUrl = URL.createObjectURL(file);
      setSelectedImgUrl(imgUrl);
    }

    return;
  }

  return (
    <div className="row-auto my-4 flex flex-col justify-center items-center h-320">
      <div className="file-uploader" id="fileUploader" style={{display: `${!hasSelectedImage ? 'block' : 'none'}`}}>
        <Dropzone
          onDrop={handleSelectedFile}
          accept={{accept: ["image/*"]}}
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

      {selectedFile &&
        (<div className="row-auto bg-white relative" >
          <Image src={selectedImgUrl} width={300} height={200} alt="Uploaded Sig preview" />
        </div>)}
    </div>
  );
});

UploadSig.displayName = "UploadSig";

export default UploadSig;

