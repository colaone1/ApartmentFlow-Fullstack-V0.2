const mongoose = require('mongoose');
const cloudinary = require('../src/config/cloudinary');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apartment-flow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import the Apartment model
const Apartment = require('../src/models/apartment.model');

async function fixImageUrls() {
  try {
    console.log('Starting image URL migration...');
    
    // Find all apartments with images that have localhost URLs
    const apartments = await Apartment.find({
      'images.url': { $regex: /^uploads\// }
    });
    
    console.log(`Found ${apartments.length} apartments with local upload URLs`);
    
    if (apartments.length === 0) {
      console.log('No apartments found with local upload URLs. Migration complete.');
      return;
    }
    
    let updatedCount = 0;
    let removedCount = 0;
    
    for (const apartment of apartments) {
      console.log(`Processing apartment: ${apartment.title || apartment._id}`);
      
      const updatedImages = [];
      
      for (const image of apartment.images) {
        if (image.url && image.url.startsWith('uploads/')) {
          console.log(`  Found local URL: ${image.url}`);
          
          // Since we can't recover the original file, we'll remove this image
          // In a real scenario, you might want to re-upload the images
          console.log(`  Removing broken image URL: ${image.url}`);
          removedCount++;
        } else {
          // Keep images that already have proper URLs (like Cloudinary URLs)
          updatedImages.push(image);
        }
      }
      
      // Update the apartment with the cleaned images array
      if (updatedImages.length !== apartment.images.length) {
        await Apartment.findByIdAndUpdate(apartment._id, {
          $set: { images: updatedImages }
        });
        updatedCount++;
        console.log(`  Updated apartment ${apartment._id}: removed ${apartment.images.length - updatedImages.length} broken images`);
      }
    }
    
    console.log('\nMigration Summary:');
    console.log(`- Apartments processed: ${apartments.length}`);
    console.log(`- Apartments updated: ${updatedCount}`);
    console.log(`- Broken images removed: ${removedCount}`);
    console.log('\nMigration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the migration
if (require.main === module) {
  fixImageUrls();
}

module.exports = fixImageUrls; 