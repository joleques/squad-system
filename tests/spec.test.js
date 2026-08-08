'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateSpec } = require('../src/domain/installation-spec');
const { parseArgs } = require('../src/application/arguments');

const valid = {
  name: 'project', description: 'Descrição detalhada do projeto', purpose: 'Resolver uma necessidade real',
  users: 'Pessoas desenvolvedoras', domain: 'Engenharia de software', stage: 'MVP', stack: 'node',
  testCommand: 'npm test', tools: ['kiro']
};

test('spec exige descrição e dados mínimos do contexto', () => {
  assert.throws(() => validateSpec({ ...valid, description: '' }), /description/);
  assert.throws(() => validateSpec({ ...valid, testCommand: '' }), /testCommand/);
});

test('spec aceita somente Kiro e Codex', () => {
  assert.throws(() => validateSpec({ ...valid, tools: ['cursor'] }), /kiro, codex/);
  assert.equal(validateSpec({ ...valid, tools: ['codex'] }).tools[0], 'codex');
});

test('integração semântica customizada exige marcadores gerenciados', () => {
  assert.throws(() => validateSpec({ ...valid, agentsIntegration: 'texto solto' }), /marcadores/);
});

test('CLI interpreta modo não interativo e dry-run', () => {
  const parsed = parseArgs(['init', '--path', '.', '--tools', 'kiro,codex', '--spec', 'install.json', '--dry-run']);
  assert.deepEqual(parsed.tools, ['kiro', 'codex']);
  assert.equal(parsed.dryRun, true);
  assert.ok(pathIsAbsolute(parsed.project) && pathIsAbsolute(parsed.spec));
});

function pathIsAbsolute(value) {
  return value.startsWith('/');
}
