import fileUpload from 'express-fileupload';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuid4 } from 'uuid';
import { log } from './logger';
import AdmZip from 'adm-zip';
import { X2jOptionsOptional, XMLParser } from 'fast-xml-parser';

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
  courseEntrypoint: string;
}

/**
 * Saves the SCORM file content to a generated directory
 * @param file Uploaded SCORM file to extract and save
 * @param saveOriginal Save the original course SCORM file
 * @returns
 */
export const saveScormToContent = async (
  file: fileUpload.UploadedFile,
  saveOriginal: boolean = true
): Promise<string> => {
  try {
    const siteId = uuid4();
    const siteDirectory = path.join(CONTENT_DIR, siteId);
    const courseDirectory = path.join(siteDirectory, 'course');

    await mkdir(courseDirectory, { recursive: true });

    const contents = new AdmZip(file.data);

    contents.extractAllTo(courseDirectory);

    log(`Files extracted successfully to '${courseDirectory}'`);

    if (saveOriginal) {
      const filename = path.join(siteDirectory, 'original.zip');
      await writeFile(filename, file.data);
      log(`Original course saved to '${filename}'`);
    }

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

  const attributeNamePrefix = '@_';
  const parserOptions: X2jOptionsOptional = {
    ignoreAttributes: false,
    attributeNamePrefix: attributeNamePrefix,
  };

  const parser = new XMLParser(parserOptions);
  const manifestJson = parser.parse(manifest);
  const title =
    manifestJson?.manifest?.organizations?.organization?.title || file.name;
  const resourceElement = manifestJson?.manifest?.resources?.resource;
  const courseEntrypoint = resourceElement[`${attributeNamePrefix}href`];

  const metadataJson = parser.parse(metadata);
  const language = metadataJson?.lom?.general?.language || 'en';

  return { title, language, courseEntrypoint };
};
