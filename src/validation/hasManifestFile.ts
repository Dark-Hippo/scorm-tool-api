import fileUpload from 'express-fileupload';
import AdmZip from 'adm-zip';

export const hasManifestFile = (file: fileUpload.UploadedFile): Boolean => {
  const contents = new AdmZip(file.data);
  const manifestFile = contents.getEntry('imsmanifest.xml');

  if (!manifestFile) return false;
  else return true;
};
