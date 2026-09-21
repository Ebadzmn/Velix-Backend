import fs from 'fs';
import path from 'path';

const unlinkFile = (filePath: string): void => {
  const absolutePath = path.join(process.cwd(), filePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlink(absolutePath, (err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error(`Failed to delete file: ${absolutePath}`, err);
      }
    });
  }
};

export default unlinkFile;
