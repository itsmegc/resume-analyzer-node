import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";

const uploadRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

uploadRouter.post("/file", upload.single("file"), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  // Return file path for backend processing
  res.json({ filePath: req.file.path, fileName: req.file.originalname });
});

export default uploadRouter;
