import { useRef, forwardRef, useImperativeHandle } from 'react';

import { getEditorDefaults,
  colorStringToColorArray,
  createMarkupEditorToolStyle,
  createMarkupEditorShapeStyleControls,
  createDefaultImageWriter,
  Sticker,
  StickerGroup } from 'pintura';

// @ts-ignore
import { PinturaEditor } from 'react-pintura';

import { getBase64 } from "../../lib/utils";

interface SigStampsProps {
  setSavedImage: (imageBase64Data: string) => void;
  stickers: string[];
}

const SignatureStamps = forwardRef((props: SigStampsProps, ref) => {

  const pinturaEditor = useRef(null);

  const editorConfig = getEditorDefaults();
  editorConfig.imageWriter = createDefaultImageWriter({
    // mimeType: 'image/jpeg',
    // quality: 1.0,
  });

  // editorConfig.enableToolbar = false
  // editorConfig.enableUtils = false
  editorConfig.enableDropImage = false;
  editorConfig.imageBackgroundColor = colorStringToColorArray('rgba(250, 150, 150, .4)');
  // editorConfig.enableTapToAddText = true

  editorConfig.utils = [ 'annotate', 'sticker'];
  editorConfig.util = 'sticker';

  editorConfig.markupEditorToolbar = [
    ['text', 'Text', { disabled: false }],
    ['sharpie', 'Draw', { disabled: false }],
    ['eraser', 'Eraser', { disabled: false }],
  ];

/*
createDefaultFontSizeOptions
*/

  editorConfig.markupEditorShapeStyleControls = createMarkupEditorShapeStyleControls({
    fontFamilyOptions: [
        ['arial', 'Arial'],
        ['Bradley Hand', 'Bradley Hand'],
        ['Brush Script MT ', 'Brush Script MT '],
        ['courier', 'Courier'],
        ['Cursive', 'Cursive'],
        ['Fantasy', 'Fantasy'],
        ['Georgia', 'Georgia'],
        ['Luminari', 'Luminari'],
        ['Monaco', 'Monaco'],
        ['Monospace', 'Monospace'],
        ['open-sans', 'Open Sans'],
        ['sans-serif', 'Sans Serif'],
        ['serif', 'Serif'],
        ['Tahoma', 'Tahoma'],
        ['TimesNewRomanPSMT', 'Times New Roman'],
        ['Trebuchet', 'Trebuchet MS'],
        ['verdana', 'Verdana'],
    ],
    fontSizeOptions: [40, 50, 60, 70, 80, 90, 100]
  });

  editorConfig.imageAnnotation = [
      {
          x: 190,
          y: 210,
          fontSize: '40',
          color: [255, 0, 0],
          fontFamily: 'cursive',
          text: "Your Name",
      },
  ];

  const chineseSealPaths: Sticker[] = props.stickers
                                .filter(s => s.match(/^seal-.+$/i))
                                .map(s => {
                                    return  {
                                      src: `/images/stamps/${s}`,
                                      height: 120,
                                    }
                                });

  const imageStickerPaths: Sticker[] = props.stickers
                                .filter(s => s.match(/^sticker-.+$/i))
                                .map(s => {
                                    return  {
                                      src: `/images/stamps/${s}`,
                                      height: 120,
                                    }
                                });

  const stickersPaths: StickerGroup[] = [
    [
      'Chinese Seals',
      chineseSealPaths,
    ],
    [
      'images',
      imageStickerPaths,
    ]
  ];

  const handleOnProcess = async (result) => {
    console.log("handleOnProcess, result: ", result )

    const processedFile = result.dest
    const base64data = await getBase64(processedFile)

    let imageBase64Data = base64data?.split(',')[1];

    props.setSavedImage(imageBase64Data);
  };

  useImperativeHandle(ref, () => ({
    saveSigStampImage() {
      if (pinturaEditor.current) {
        pinturaEditor.current.editor.processImage();
      }
    }
  }));

  return (
    <div className="row-auto my-4 flex flex-col justify-center items-center h-320">
      <div className="block w-full bg-white" style={{height: '398px'}}>
        <PinturaEditor
          ref={pinturaEditor}
          {...editorConfig}
          src={`/images/transparent-574x298.png`}
          stickers={stickersPaths}
          onProcess={handleOnProcess}
        />
      </div>
    </div>
  );
});

SignatureStamps.displayName = "SignatureStamps";

export default SignatureStamps;

