import fileUpload from 'express-fileupload';

export const isZipFile = (file: fileUpload.UploadedFile): Boolean =>
  ['application/zip', 'application/x-zip-compressed'].includes(file.mimetype);
