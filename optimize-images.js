const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = './';
const outputDir = './';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const imagesToOptimize = [
  { input: 'bird.jpg', output: 'bird.webp', width: 700 }
];

imagesToOptimize.forEach(image => {
  const inputPath = path.join(inputDir, image.input);
  const outputPath = path.join(outputDir, image.output);

  if (fs.existsSync(inputPath)) {
    sharp(inputPath)
      .resize({ width: image.width })
      .webp({ quality: 80 })
      .toFile(outputPath)
      .then(info => {
        console.log(`Successfully optimized ${image.input} to ${image.output}`, info);
      })
      .catch(err => {
        console.error(`Error optimizing ${image.input}:`, err);
      });
  } else {
    console.warn(`Input image not found: ${inputPath}`);
  }
});
