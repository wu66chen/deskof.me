import { writeFile } from 'node:fs/promises';
import { DEFAULT_STATE } from '../src/data.js';
import { publishedDeskState } from '../src/content.generated.js';

await writeFile(
  new URL('../public/desk-data.json', import.meta.url),
  `${JSON.stringify(publishedDeskState || DEFAULT_STATE, null, 2)}\n`,
);
