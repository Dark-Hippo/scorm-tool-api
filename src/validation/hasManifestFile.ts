import fileUpload from 'express-fileupload';
import JSZip from 'jszip';

export const hasManifest = async (file: fileUpload.UploadedFile) => {
  const contents = await JSZip.loadAsync(file.data);

  // check for imsmanifest file
  if (!Object.keys(contents.files).find((f) => f.endsWith('imsmanifest.xml'))) {
    return false;
  }

  return true;
};
