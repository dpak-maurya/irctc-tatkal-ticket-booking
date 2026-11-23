// Station and train reference lists.
//
// Stations are fetched at runtime from the official IRCTC/AskDisha CDN:
//   https://cdn.corover.ai/askdisha-bucket/stationupdated.json
// This is the same source used by the official Ask DISHA chatbot on irctc.co.in,
// so the data is always current and requires no local maintenance.
//
// Trains are still loaded from the bundled public/data/trains.json (~200 KB)
// because no equivalent public CDN endpoint exists for the full train list.
// The file is kept out of the JS bundle and fetched on demand so it does not
// affect startup time.

const STATIONS_API_URL = 'https://cdn.corover.ai/askdisha-bucket/stationupdated.json';

const TRAINS_FILE = 'public/data/trains.json';

const cache = {};

// ------------------------------------------------------------------
// Stations — live CDN API
// ------------------------------------------------------------------

const parseStationsResponse = (data) => {
  // API returns either { value: [...], Count: N } or a bare array
  const rows = Array.isArray(data) ? data : (data.value || []);
  const options = [];
  rows.forEach((item) => {
    const code = (item.code || item.stationCode || '').trim().toUpperCase();
    const name = (item.name || item.stationName || '').trim().toUpperCase();
    if (!code || !name) return;
    options.push({ code, name, label: `${name} - ${code}` });
  });
  return options;
};

const loadStations = () => {
  if (!cache.stations) {
    cache.stations = fetch(STATIONS_API_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Stations API: HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => parseStationsResponse(data))
      .catch((error) => {
        console.error('Failed to load station data from CDN, falling back to local file:', error);
        delete cache.stations;
        // Graceful fallback: try the local bundled copy
        return loadLocalFile('stations');
      });
  }
  return cache.stations;
};

// ------------------------------------------------------------------
// Trains — local bundled file (pipe-delimited "CODE|NAME" strings)
// ------------------------------------------------------------------

const resolveUrl = (file) => {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
    return chrome.runtime.getURL(file);
  }
  return file;
};

const parseTrainRows = (rows) => {
  const options = [];
  rows.forEach((row) => {
    const [rawCode, rawName] = String(row).split('|');
    const code = (rawCode || '').trim();
    const name = (rawName || '').trim();
    if (!code || !name) return;
    options.push({ code, name, label: `${code} - ${name}` });
  });
  return options;
};

// Fallback: load stations from the local bundled file (pipe-delimited format)
const parseStationRows = (rows) => {
  const options = [];
  rows.forEach((row) => {
    const [rawCode, rawName] = String(row).split('|');
    const code = (rawCode || '').trim();
    const name = (rawName || '').trim();
    if (!code || !name) return;
    options.push({ code, name, label: `${name} - ${code}` });
  });
  return options;
};

const loadLocalFile = (kind) => {
  const file = kind === 'trains' ? TRAINS_FILE : 'public/data/stations.json';
  return fetch(resolveUrl(file))
    .then((response) => {
      if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
      return response.json();
    })
    .then((rows) => (kind === 'trains' ? parseTrainRows(rows) : parseStationRows(rows)))
    .catch((error) => {
      console.error('Failed to load reference data:', error);
      return [];
    });
};

const loadTrains = () => {
  if (!cache.trains) {
    cache.trains = loadLocalFile('trains').catch((error) => {
      console.error('Failed to load train data:', error);
      delete cache.trains;
      return [];
    });
  }
  return cache.trains;
};

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

/**
 * Returns a Promise<Array<{ code, name, label }>> for the given kind.
 *   kind = 'stations' → fetched from the official IRCTC/AskDisha CDN (live data)
 *   kind = 'trains'   → loaded from the bundled public/data/trains.json
 *
 * Results are cached in memory so the network request only happens once per
 * browser session. A failed fetch returns [] so typing still works.
 */
export const loadReferenceData = (kind) => {
  if (kind === 'stations') return loadStations();
  if (kind === 'trains') return loadTrains();
  return Promise.resolve([]);
};

export default loadReferenceData;
