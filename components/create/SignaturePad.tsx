import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import SmoothSignature from "smooth-signature";


interface SigPadProps {
  setSavedImage: (imageBase64Data: string) => void;
}

const SignaturePad = forwardRef((props: SigPadProps, ref) => {

  const [sigPad, setSigPad] = useState(null);

  // on page load
  useEffect(() => {
    const canvas = document.querySelector("#signature-pad") as HTMLCanvasElement;
    const newSignaturePad = new SmoothSignature(canvas, {
      scale: 3,
      minWidth: 100,
      color: 'rgba(50, 50, 50, .8)',
      bgColor: 'rgba(255, 255, 255, .5)'
    });
    setSigPad(newSignaturePad);
  }, []);

  const handleSigUndo = () => {
    sigPad?.undo();
  }

  const handleSigClear = () => {
    sigPad?.clear();
  }

  useImperativeHandle(ref, () => ({
    saveSigPadImage() {
      if (sigPad) {
        const sigDataUrl = sigPad.toDataURL('image/png');
        let imageBase64Data = sigDataUrl?.split(',')[1];

        props.setSavedImage(imageBase64Data);
      }
      return null;
    }
  }));

  return (
    <div className="row-auto mt-4">

      <div className="w-full">
        <canvas id="signature-pad" className="sigCanvas" />
      </div>

      <div className="mt-2 flex justify-center align-middle space-x-2">
        <button className="border-solid px-1" onClick={handleSigUndo}>Undo</button>
        <button  className="border-solid " onClick={handleSigClear}>clear</button>
        {/* <button  className="border-solid " onClick={handleSigSave}>Save</button> */}
      </div>
    </div>
  );
});

SignaturePad.displayName = "SignaturePad";

export default SignaturePad;