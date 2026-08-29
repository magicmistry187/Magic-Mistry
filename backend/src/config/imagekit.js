require('dotenv').config();

const ImageKit = require('@imagekit/nodejs');

const imagekit = new ImageKit({
  publicKey: (process.env.ImageKit_Public_Key || '').trim(),
  privateKey: (process.env.ImageKit_Pirvate_Key || process.env.ImageKit_Private_Key || '').trim(),
  urlEndpoint: `https://ik.imagekit.io/${(process.env.ImageKit_ID || '').trim()}`,
});

async function uploadImageToImageKit(buffer, fileName) {
  const fileToUpload = typeof buffer === 'string' ? buffer : buffer.toString('base64');
  const safeFileName = fileName || `upload-${Date.now()}`;
  const result = await imagekit.files.upload({
    file: fileToUpload,
    fileName: safeFileName,
  });

  return result;
}

async function deleteImageFromImageKit(fileId) {
  if (!fileId) return null;

  return imagekit.files.delete(fileId);
}

module.exports = {
  uploadImageToImageKit,
  deleteImageFromImageKit,
};
