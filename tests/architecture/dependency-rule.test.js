'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..', 'src');
const layers = ['domain', 'use_case', 'application', 'infra', 'shared'];

test('estrutura contém as cinco camadas da arquitetura proposta', () => {
  for (const layer of layers) assert.ok(fs.existsSync(path.join(root, layer)), `camada ausente: src/${layer}`);
});

test('domain é puro e não depende de Node ou camadas externas', () => {
  for (const file of javascriptFiles(path.join(root, 'domain'))) {
    const content = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(content, /require\(['"]node:/, `${file} depende de Node`);
    assert.doesNotMatch(content, /require\(['"]\.\.\/(?:infra|application|use_case)/, `${file} viola Dependency Rule`);
  }
});

test('use cases não importam implementações de infra ou application', () => {
  for (const file of javascriptFiles(path.join(root, 'use_case'))) {
    const content = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(content, /require\(['"][^'"]*(?:infra|application)/, `${file} depende de camada externa`);
  }
});

test('application é a única camada que compõe use cases e infra', () => {
  const composition = fs.readFileSync(path.join(root, 'application', 'composition-root.js'), 'utf8');
  assert.match(composition, /use_case/);
  assert.match(composition, /infra/);
});

function javascriptFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? javascriptFiles(absolute) : entry.name.endsWith('.js') ? [absolute] : [];
  });
}
