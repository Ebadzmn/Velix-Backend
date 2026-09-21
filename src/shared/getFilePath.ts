import { Request } from 'express';

const getFilePath = (req: Request, folderName: string, fileName?: string): string => {
  if (req.file) {
    return `/uploads/${folderName}/${req.file.filename}`;
  }
  if (fileName) {
    return `/uploads/${folderName}/${fileName}`;
  }
  return '';
};

export default getFilePath;
