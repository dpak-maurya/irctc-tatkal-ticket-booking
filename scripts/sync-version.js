const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const files = [
  "package.json",
  "chrome-extension/package.json",
  "react-app/package.json",
  "chrome-extension/manifest.json",
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

const rootPackagePath = path.join(rootDir, "package.json");
const rootPackage = readJson(rootPackagePath);
const version = rootPackage.version;

for (const relativePath of files) {
  const filePath = path.join(rootDir, relativePath);
  const json = readJson(filePath);

  if (json.version !== version) {
    json.version = version;
    writeJson(filePath, json);
    console.log(`Updated ${relativePath} -> ${version}`);
  } else {
    console.log(`Already synced ${relativePath}`);
  }
}
