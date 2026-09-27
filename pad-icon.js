const Jimp = require('jimp');
const path = require('path');

async function createAdaptiveIcon() {
  try {
    const inputPath = path.join(__dirname, 'assets/images/shree-stores-logo-v2.png');
    const outputPath = path.join(__dirname, 'assets/images/android-icon-foreground-v2.png');
    
    // Create a new transparent image (1080x1080)
    const background = new Jimp(1080, 1080, 0x00000000); // fully transparent
    
    // Read the user's logo
    const logo = await Jimp.read(inputPath);
    
    // Resize logo to fit inside the safe zone (around 60-65% of the total size, let's use 648x648 max)
    logo.scaleToFit(648, 648);
    
    // Calculate center position
    const x = Math.floor((1080 - logo.bitmap.width) / 2);
    const y = Math.floor((1080 - logo.bitmap.height) / 2);
    
    // Composite the logo onto the transparent background
    background.composite(logo, x, y);
    
    // Write the new image
    await background.writeAsync(outputPath);
    console.log('Successfully created padded android-icon-foreground-v2.png');
  } catch (error) {
    console.error('Error creating adaptive icon:', error);
    process.exit(1);
  }
}

createAdaptiveIcon();
