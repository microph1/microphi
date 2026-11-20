// Marks each build's module type, so Node loads lib/esm as ESM and lib/cjs as
// CommonJS whatever the package's own "type" says.
import { writeFile } from 'node:fs/promises';

await writeFile(new URL('../lib/esm/package.json', import.meta.url), '{ "type": "module" }\n');
await writeFile(new URL('../lib/cjs/package.json', import.meta.url), '{ "type": "commonjs" }\n');
