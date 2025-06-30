const cloudinary = require('cloudinary').v2;
const path = require('path');
const dotenv = require('dotenv');

// Try to load .env from multiple possible locations
const possiblePaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '..', '.env'),
  path.resolve(process.cwd(), '..', '..', '.env'),
  'C:/Projects/ApartmentSearch/backend/.env',
];

let envLoaded = false;
for (const envPath of possiblePaths) {
  try {
    dotenv.config({ path: envPath });
    if (process.env.CLOUDINARY_URL) {
      envLoaded = true;
      break;
    }
  } catch (error) {
    // Intentionally ignore errors loading .env files
  }
}

// Configure Cloudinary with fallback for development
if (
  process.env.CLOUDINARY_URL &&
  process.env.CLOUDINARY_URL !== 'cloudinary://api_key:api_secret@cloud_name'
) {
  // Parse the CLOUDINARY_URL
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  const matches = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@([^/]+)/);

  if (matches) {
    const [, apiKey, apiSecret, cloudName] = matches;

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  } else {
    setupFallbackConfig();
  }
} else {
  setupFallbackConfig();
}

function setupFallbackConfig() {
  // Fallback configuration for development
  cloudinary.config({
    cloud_name: 'development',
    api_key: 'placeholder',
    api_secret: 'placeholder',
  });

  // Override upload method to handle missing cloudinary in development
  cloudinary.uploader.upload = async function (file, options = {}) {
    return {
      public_id: 'mock_public_id',
      secure_url: 'https://via.placeholder.com/400x300?text=Mock+Image',
      url: 'https://via.placeholder.com/400x300?text=Mock+Image',
      format: 'jpg',
      width: 400,
      height: 300,
    };
  };
}

module.exports = cloudinary;
