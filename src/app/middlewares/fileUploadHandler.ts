import fs from 'fs';
import multer from 'multer';
import path from 'path';
import ApiError from '../../errors/ApiError';

const createUploadFolder = (folderName: string) => {
  const uploadPath = path.join(process.cwd(), 'uploads', folderName);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

const fileUploadHandler = (folderName = 'images') => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = createUploadFolder(folderName);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName = `${file.originalname
        .replace(fileExt, '')
        .toLowerCase()
        .replace(/ /g, '-')}-${Date.now()}${fileExt}`;
      cb(null, fileName);
    },
  });

  const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only .jpeg, .png, .jpg and .pdf format allowed!'));
    }
  };

  return multer({
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter,
  });
};

export default fileUploadHandler;
