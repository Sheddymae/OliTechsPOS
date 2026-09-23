import { exec } from 'node:child_process';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function loadEnv(name) {
  const envPath = path.join(projectRoot, name);
  if (!fs.existsSync(envPath)) return;
  for (const raw of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 1) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if ((value.startsWith('\"') && value.endsWith('\"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
loadEnv('.env');
loadEnv('.env.local');

const children = [];
const apiPort = process.env.PORT || '3001';
const webPort = process.env.VITE_PORT || '5173';
const platformPort = process.env.PLATFORM_PORT || '3100';

function run(command, label) {
  const child = exec(command, { windowsHide: false });
  children.push(child);
  child.stdout?.on('data', data => process.stdout.write(data));
  child.stderr?.on('data', data => process.stderr.write(data));
  child.on('error', err => {
    console.error(`\n${label} failed: ${err.message}`);
    if (err.code === 'EADDRINUSE') {
      console.error('A required port is already in use. Close the previous OliTechs window/process and run again.');
    }
  });
  child.on('exit', code => {
    if (code && code !== 0) console.error(`${label} stopped with code ${code}`);
  });
  return child;
}

console.log(`Starting OliTechs API on port ${apiPort}...`);
run(`set PORT=${apiPort}&& node server/index.mjs`, 'OliTechs API');
console.log(`Starting OliTechs licensing platform on port ${platformPort}...`);
run(`set PLATFORM_PORT=${platformPort}&& node platform-server/index.mjs`, 'OliTechs Licensing Platform');
console.log(`Starting OliTechs web on port ${webPort}...`);
run(`npx vite --host 0.0.0.0 --port ${webPort}`, 'OliTechs web');

function stop() {
  for (const child of children) {
    try { child.kill(); } catch {}
  }
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
process.on('exit', stop);
