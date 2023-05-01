import fileUpload from 'express-fileupload';
import { mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuid4 } from 'uuid';
import { log } from './logger';
import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';

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

interface details {
  siteId?: string;
  title: string;
  language: string;
}

export const saveScormToContent = async (
  file: fileUpload.UploadedFile
): Promise<string> => {
  try {
    const siteId = uuid4();
    const siteDirectory = path.join(contentDirectory, siteId);

    await mkdir(siteDirectory);

    const contents = new AdmZip(file.data);

    contents.extractAllTo(siteDirectory);

    log(`Files extracted successfully to ${siteDirectory}`);

    return siteId;
  } catch (error) {
    log(error as string);
    throw error;
  }
};

export const getScormDetails = (file: fileUpload.UploadedFile): details => {
  const contents = new AdmZip(file.data);

  const manifestFile = contents.getEntry('imsmanifest.xml');
  const manifest = manifestFile?.getData();
  if (!manifest) {
    throw new Error('Manifest file is corrupt or invalid');
  }

  const metadataFile = contents.getEntry('metadata.xml');
  const metadata = metadataFile?.getData();
  if (!metadata) {
    throw new Error('Metadata file is corrupt or invalid');
  }

  const parser = new XMLParser();
  const manifestJson = parser.parse(manifest);
  const title =
    manifestJson?.manifest?.organizations?.organization?.title || file.name;

  const metadataJson = parser.parse(metadata);
  const language = metadataJson?.lom?.general?.language || 'en';

  return { title, language };
};
