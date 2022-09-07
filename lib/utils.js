export const CreateSigMethod = {
  SIG_PAD: 'sig_pad',
  CAMERA: 'camera',
  STAMP: 'stamp',
  UPLOAD: 'upload'
}

export function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export function createPopupWin(pageURL, pageTitle, popupWinWidth, popupWinHeight) {

  const top = 0;
  const left = 0;

  const myWindow = window.open(pageURL, pageTitle,
    `resizable=yes, fullscreen=0, width=${popupWinWidth}, height=${popupWinHeight}`);
}