require('dotenv').config();

const ImageKit = require('@imagekit/nodejs');

const imagekit = new ImageKit({
  privateKey: process.env.ImageKit_Pirvate_Key,
});

async function uploadImageToImageKit(buffer,fileName) {
  // console.log("in the imagekit")
  const result = await imagekit.files.upload({
    file: buffer.toString('base64'),
    fileName: fileName, 
  });

  // console.log("image result is", result)
  return result;
}

module.exports = uploadImageToImageKit;
