import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
register(pathToFileURL(here + '/ext-loader.mjs').href, pathToFileURL(here + '/').href);
