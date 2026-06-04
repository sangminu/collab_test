import {existsSync} from 'node:fs';
import {resolve} from 'node:path';

const requiredPaths = [
  'index.html',
  'src/main.tsx',
  'src/App.tsx',
  'src/index.css',
  'vite.config.ts',
];

const missingPaths = requiredPaths.filter(path => !existsSync(resolve(path)));

if (missingPaths.length > 0) {
  console.error('Netlify build input is missing required project files:');
  for (const path of missingPaths) {
    console.error(`- ${path}`);
  }
  console.error('');
  console.error('Make sure the full project folder, including src/, is committed or uploaded to Netlify.');
  process.exit(1);
}
