// Station and train reference lists, fetched at runtime from public/data.
// They are ~430 KB together, so they are kept out of the JS bundle and loaded
// only when the form needs them.

// Each row is "CODE|NAME" ("NDLS|NEW DELHI", "12951|MUMBAI RAJDHANI").
const DATA_FILES = {
  stations: 'public/data/stations.json',
  trains: 'public/data/trains.json',
};

// Stations read best as "NEW DELHI - NDLS", trains as "12951 - MUMBAI RAJDHANI".
const LABEL_FORMATTERS = {
  stations: (code, name) => `${name} - ${code}`,
  trains: (code, name) => `${code} - ${name}`,
};

const cache = {};

const resolveUrl = (file) => {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
    return chrome.runtime.getURL(file);
  }
  return file;
};

const parseRows = (rows, kind) => {
  const toLabel = LABEL_FORMATTERS[kind];
  const options = [];
  rows.forEach((row) => {
    const [rawCode, rawName] = String(row).split('|');
    const code = (rawCode || '').trim();
    const name = (rawName || '').trim();
    if (!code || !name) return;
    options.push({ code, name, label: toLabel(code, name) });
  });
  return options;
};

export const loadReferenceData = (kind) => {
  const file = DATA_FILES[kind];
  if (!file) return Promise.resolve([]);

  if (!cache[kind]) {
    cache[kind] = fetch(resolveUrl(file))
      .then((response) => {
        if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
        return response.json();
      })
      .then((rows) => parseRows(rows, kind))
      .catch((error) => {
        // A missing list only costs the user the dropdown; typing still works.
        console.error('Failed to load reference data:', error);
        delete cache[kind];
        return [];
      });
  }

  return cache[kind];
};

export default loadReferenceData;
