import express from "express";

import File from "../models/File.js";
import { authenticateAdmin } from "../middleware/auth.js";

import pkg from '@aws-sdk/s3-request-presigner';
const { getSignedUrl } = pkg;
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// AWS S3 setup (v3)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const router = express.Router();

router.post("/generate-presigned-url", authenticateAdmin, async (req, res) => {
  try {
    const { filename, fileType } = req.body;

    if (!filename || !fileType) {
      return res.status(400).json({ message: "Filename or fileType not provided" });
    }

    const fileName = `${filename}`;
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `vpn/${fileName}`,
      ContentType: fileType,
      ACL: "public-read", 
    };

    // Create a PutObjectCommand
    const command = new PutObjectCommand(params);

    const url = await getSignedUrl(s3, command);

    res.json({ url }); 
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ message: "Error generating presigned URL" });
  }
});

router.post("/upload", authenticateAdmin, async (req, res) => {
  try {
    const { fileName } = req.body; 
    const fileUrl = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.BUCKET_NAME}/vpn/${fileName}`;

    if (!fileName || !fileUrl) {
      return res.status(400).json({ message: "File name or file URL is missing" });
    }

    // Find the existing file from the database
    const existingFile = await File.findOne().sort({ createdAt: -1 });
    console.log(existingFile);

    if (existingFile) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: `vpn/${existingFile.filename}`,
      });

      await s3.send(deleteCommand); // Delete the old file from S3
    }

    // Save the new file details to the database
    const newFile = new File({
      filename: fileName,
      filepath: fileUrl,
    });

    await newFile.save();

    res.json({ message: "File uploaded successfully", file: newFile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// Download a file from S3
router.get("/download", async (req, res) => {
  try {
    const file = await File.findOne().sort({ createdAt: -1 });

    if (!file) {
      return res.status(404).json({ message: "No file found" });
    }

    file.downloads += 1;
    await file.save();

    // Send the file for download
    res.status(200).json({ message: "File downloaded successfully", file });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get the latest file
router.get("/latest", async (req, res) => {
  try {
    const file = await File.findOne().sort({ createdAt: -1 });
    if (!file) {
      return res.status(404).json({ message: "No file found" });
    }
    res.json({ file });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
