const fs = require('fs-extra');
const path = require('path');

const filesToCopy = [
  'manifest.json',
  'images', // Directory for any images/icons used in the extension
  'user-script.js',
  'sw.js',
  'public'
];

const destDir = path.join(__dirname, 'build');

async function copyFiles() {
  try {
    await fs.ensureDir(destDir);
    for (const file of filesToCopy) {
      const src = path.join(__dirname, file);
      const dest = path.join(destDir, file);
      await fs.copy(src, dest);
      console.log(`Copied ${file} to dist folder`);
    }
  } catch (err) {
    console.error('Error copying files:', err);
  }
}

copyFiles();
