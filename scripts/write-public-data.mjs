import { writeFile } from 'node:fs/promises';
import { DEFAULT_STATE } from '../src/data.js';

await writeFile(new URL('../public/desk-data.json', import.meta.url), `${JSON.stringify(DEFAULT_STATE, null, 2)}\n`);
