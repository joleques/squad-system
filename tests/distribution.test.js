'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

test('metadados identificam o pacote público e sua origem', () => {
  assert.equal(packageJson.name, '@joleques/squad-system');
  assert.equal(packageJson.publishConfig?.access, 'public');
  assert.equal(packageJson.repository?.url, 'git+https://github.com/joleques/squad-system.git');
  assert.equal(packageJson.homepage, 'https://github.com/joleques/squad-system#readme');
  assert.equal(packageJson.bugs?.url, 'https://github.com/joleques/squad-system/issues');
  assert.equal(packageJson.author, 'Jorge Leques');
});

test('distribuição protege testes, runtime e executável', () => {
  assert.equal(packageJson.scripts?.prepublishOnly, 'npm test');
  assert.equal(packageJson.engines?.node, '>=18');
  assert.equal(packageJson.bin?.['squad-system'], 'bin/squad-system.js');
  assert.ok(packageJson.files.includes('bin'));
  assert.ok(packageJson.keywords.includes('ai-agents'));
});

test('licença, versão de Node e documentação pública estão presentes', () => {
  assert.match(fs.readFileSync(path.join(root, 'LICENSE'), 'utf8'), /MIT License/);
  assert.equal(fs.readFileSync(path.join(root, '.nvmrc'), 'utf8').trim(), '22');
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  assert.match(readme, /npx @joleques\/squad-system init/);
  assert.match(readme, /Node\.js 18/);
  assert.doesNotMatch(readme, /npx squad-system/);
});
