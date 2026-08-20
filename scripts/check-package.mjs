import {execFileSync} from 'node:child_process';

const [{files}] = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
  encoding: 'utf8',
}));
const packedFiles = new Set(files.map(({path}) => path));
const packageJson = await import('../package.json', {with: {type: 'json'}});
const entryPoints = [packageJson.default.main, ...Object.values(packageJson.default.exports)];
const missing = entryPoints
  .map((entryPoint) => entryPoint.replace(/^\.\//, ''))
  .filter((entryPoint) => !packedFiles.has(entryPoint));

if (missing.length > 0) {
  throw new Error(`Package is missing declared entry points: ${missing.join(', ')}`);
}
