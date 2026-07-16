const fs = require('fs');
const path = require('path');

const distPath = path.resolve(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
  console.log('Successfully cleaned dist/ directory');
} else {
  console.log('dist/ directory does not exist, skipping clean');
}
