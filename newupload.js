const express = require('express');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 4000; // Use the PORT environment variable or default to 4000

// Replace with your Azure Storage connection string and container name
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'mycon';

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

async function uploadFileToBlob(filePath) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobName = path.basename(filePath);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  console.log(`Uploading file to blob storage as blob:\n\t${blobName}`);
  const data = fs.readFileSync(filePath);
  await blockBlobClient.upload(data, data.length);
  fs.unlinkSync(filePath); // Delete the local file after upload

  const url = blockBlobClient.url;
  console.log(`File URL: ${url}`);
  return url;
}

// Serve static files from the "public" directory
const indexPath = path.join(__dirname, 'index.html');

// Serve the upload form
app.get('/', (req, res) => {
  res.sendFile(indexPath);
});

// Handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const url = await uploadFileToBlob(filePath);
    res.send(`File uploaded and available at: <a href="${url}">${url}</a>`);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
