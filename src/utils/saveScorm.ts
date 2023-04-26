import fileUpload from 'express-fileupload';
import { mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuid4 } from 'uuid';
import { log } from './logger';
import AdmZip from 'adm-zip';

const contentDirectory = './content';

/* Commented out as uses an arguably more reliable library, but my
 *  stupid brain couldn't figure out why it wasn't writing messages
 *  out to the console... turns out it was a nodemon issue.
 */
// export const saveScorm = async (file: fileUpload.UploadedFile) => {
//   const contents = await JSZip.loadAsync(file.data, { createFolders: true });

//   const newSiteId = uuid4();
//   const newSiteDirectory = path.join('./content', newSiteId);

//   await mkdir(newSiteDirectory);

//   const filesToSave = [];
//   const writeFile = (file: JSZipObject, directory: string) => {
//     const newFileWithPath = path.join(directory, file.name);

//     return new Promise(async (resolve, reject) => {
//       await mkdir(path.dirname(newFileWithPath), { recursive: true });
//       const out = createWriteStream(newFileWithPath);
//       file.nodeStream().pipe(out);
//       out.on('finish', () => {
//         log(`File ${newFileWithPath} created.`);
//         resolve(newFileWithPath);
//       });
//       out.on('error', (err: Error) => {
//         log(err.message);
//         reject(`Error writing ${newFileWithPath}`);
//       });
//     });
//   };
//   for (const key in contents.files) {
//     const file = contents.files[key];
//     const filename = file.name;

//     if (!path.extname(filename)) {
//       continue;
//     }
//     filesToSave.push(writeFile(file, newSiteDirectory));
//   }

//   await Promise.all(filesToSave);
// };

export const saveScormToContent = async (
  file: fileUpload.UploadedFile
): Promise<string> => {
  try {
    const newSiteId = uuid4();
    const newSiteDirectory = path.join(contentDirectory, newSiteId);

    await mkdir(newSiteDirectory);

    const contents = new AdmZip(file.data);

    contents.extractAllTo(newSiteDirectory);

    log(`Files extracted successfully to ${newSiteDirectory}`);

    return newSiteId;
  } catch (error) {
    log(error as string);
    throw error;
  }
};
