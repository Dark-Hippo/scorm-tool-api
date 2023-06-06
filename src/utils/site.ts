import { log } from 'console';
import { Stats, rm, rmdir, stat, unlink } from 'fs';
import path from 'path';
import { CONTENT_DIR } from '../config';

export const deleteSiteFiles = (guid: string): boolean => {
  try {
    const siteDirectory = path.join(CONTENT_DIR, guid);

    stat(
      siteDirectory,
      (err: NodeJS.ErrnoException | null, stats: Stats): void => {
        if (err) {
          throw err;
        }

        rm(siteDirectory, { recursive: true, force: true }, (err) => {
          if (err) {
            throw err;
          }

          return true;
        });
      }
    );

    return false;
  } catch (error) {
    log(error as string);
    throw error;
  }
};
