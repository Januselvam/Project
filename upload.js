const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');
const fs = require('fs');

// Replace with your Azure Storage connection string and container name
const AZURE_STORAGE_CONNECTION_STRING = 'DefaultEndpointsProtocol=https;AccountName=storageproject1acc;AccountKey=RbwpP6M4if4zSOQfo4E1TbjMUG9dyvtdOlYvGnfkQuLsIxeoFKMKVpHji2QtRP6aESJmaMIR4fyu+AStDWKGag==;EndpointSuffix=core.windows.net';
const containerName = 'mycon';

async function uploadFileToBlob(filePath) {
  // Create the BlobServiceClient object which will be used to create a container client
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

  // Get a reference to the container client
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Get a block blob client
  const blobName = path.basename(filePath);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  console.log(`Uploading file to blob storage as blob:\n\t${blobName}`);

  // Upload data to the blob
  const data = fs.readFileSync(filePath);
  const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
  console.log(`Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`);

  // Generate a URL for sharing
  const url = blockBlobClient.url;
  console.log(`File URL: ${url}`);
  return url;
}

// Replace with the path to your file
const filePath = 'Connection String.txt';

uploadFileToBlob(filePath)
.then((url) => console.log(`File uploaded and available at: ${url}`))
  .catch((error) => console.error('Error uploading file:', error));