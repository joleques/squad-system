'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { rejectSecrets } = require('../src/use_case/install-squad');
const { createApplication } = require('../src/application/composition-root');
const { BEGIN_MARKER, END_MARKER } = require('../src/shared/constants');
const { run } = require('../src/application/cli');
const { version } = require('../package.json');

function install(project, input, options) { return createApplication(project).install(input, options); }
function uninstall(project, options) { return createApplication(project).uninstall(options); }
function doctor(project) { return createApplication(project).doctor(); }
function inspectProject(project) { return createApplication(project).inspectProject(); }

function temporaryProject() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'squad-system-'));
}

function spec(overrides = {}) {
  return {
    name: 'checkout-api',
    description: 'API responsável pelo processo de checkout e confirmação de pedidos.',
    purpose: 'Permitir que clientes concluam compras com rastreabilidade.',
    users: 'Clientes da loja e operadores de suporte.',
    domain: 'Pedidos, itens, pagamento e confirmação.',
    stack: 'typescript-node',
    testCommand: 'npm test',
    stage: 'MVP em desenvolvimento',
    tools: ['kiro', 'codex'],
    ...overrides
  };
}

test('instala Kiro e Codex com os quatro agentes e contexto detalhado', () => {
  const project = temporaryProject();
  const result = install(project, spec());
  assert.equal(result.status, 'OK');
  for (const role of ['service-lider', 'service-analista', 'service-dev', 'service-reviewer']) {
    assert.ok(fs.existsSync(path.join(project, `.kiro/agents/${role}.json`)));
    assert.ok(fs.existsSync(path.join(project, `.codex/agents/${role}.toml`)));
  }
  const context = fs.readFileSync(path.join(project, '.agent/memory/project-context.md'), 'utf8');
  assert.match(context, /processo de checkout/);
  assert.match(context, /arquitetura-proposta/);
  assert.equal(doctor(project).ok, true);
});

test('preserva AGENTS.md existente e integra bloco gerenciado uma única vez', () => {
  const project = temporaryProject();
  fs.writeFileSync(path.join(project, 'AGENTS.md'), '# Regras locais\n\n- Java 21 obrigatório.\n');
  install(project, spec({ tools: ['kiro'] }));
  install(project, spec({ tools: ['kiro'] }));
  const agents = fs.readFileSync(path.join(project, 'AGENTS.md'), 'utf8');
  assert.match(agents, /Java 21 obrigatório/);
  assert.equal(agents.split(BEGIN_MARKER).length - 1, 1);
  assert.equal(agents.split(END_MARKER).length - 1, 1);
});

test('usa arquitetura explícita quando informada', () => {
  const project = temporaryProject();
  install(project, spec({ architecture: 'Modular monolith with vertical slices' }));
  const context = fs.readFileSync(path.join(project, '.agent/memory/project-context.md'), 'utf8');
  assert.match(context, /Modular monolith with vertical slices/);
  assert.doesNotMatch(context, /Padrão arquitetura-proposta/);
});

test('dry-run não altera o projeto', () => {
  const project = temporaryProject();
  const result = install(project, spec(), { dryRun: true });
  assert.equal(result.status, 'DRY-RUN');
  assert.equal(fs.existsSync(path.join(project, 'AGENTS.md')), false);
});

test('uninstall restaura AGENTS.md e remove somente arquivos inalterados', () => {
  const project = temporaryProject();
  const original = '# Política original\n';
  fs.writeFileSync(path.join(project, 'AGENTS.md'), original);
  install(project, spec({ tools: ['kiro'] }));
  const result = uninstall(project);
  assert.equal(result.status, 'OK');
  assert.equal(fs.readFileSync(path.join(project, 'AGENTS.md'), 'utf8'), original);
  assert.equal(fs.existsSync(path.join(project, '.kiro/agents/service-dev.json')), false);
});

test('uninstall preserva arquivo gerenciado modificado pelo usuário', () => {
  const project = temporaryProject();
  install(project, spec({ tools: ['codex'] }));
  const agent = path.join(project, '.codex/agents/service-dev.toml');
  fs.appendFileSync(agent, '# customização local\n');
  const result = uninstall(project);
  assert.ok(result.changes.some((change) => change.action === 'preserve-modified' && change.path.includes('service-dev')));
  assert.equal(fs.existsSync(agent), true);
});

test('reinstalação recusa sobrescrever customização em agente gerenciado', () => {
  const project = temporaryProject();
  install(project, spec({ tools: ['codex'] }));
  const agent = path.join(project, '.codex/agents/service-dev.toml');
  fs.appendFileSync(agent, '# customização local\n');
  assert.throws(() => install(project, spec({ tools: ['codex'] })), /customização local/);
});

test('recusa conteúdo com possível segredo', () => {
  assert.throws(() => rejectSecrets(new Map([['AGENTS.md', Buffer.from('api_key=abcdefghijklmnop1234')]])), /segredo/i);
});

test('inspect detecta stack, teste, AGENTS e ferramentas sem ler .env', () => {
  const project = temporaryProject();
  fs.writeFileSync(path.join(project, 'package.json'), JSON.stringify({ name: 'web', devDependencies: { typescript: '5.0.0' }, scripts: { test: 'vitest run' } }));
  fs.mkdirSync(path.join(project, '.kiro'));
  fs.writeFileSync(path.join(project, '.env'), 'SECRET=nao-deve-ser-lido');
  const inspection = inspectProject(project);
  assert.equal(inspection.stack, 'typescript-node');
  assert.equal(inspection.testCommand, 'npm test');
  assert.deepEqual(inspection.detectedTools, ['kiro']);
  assert.doesNotMatch(JSON.stringify(inspection), /nao-deve-ser-lido/);
});

test('CLI executa init e doctor de ponta a ponta', async () => {
  const project = temporaryProject();
  const specFile = path.join(project, 'install-spec.json');
  fs.writeFileSync(specFile, JSON.stringify(spec({ tools: ['kiro'] })));
  const lines = [];
  const originalLog = console.log;
  console.log = (line) => lines.push(String(line));
  try {
    await run(['init', '--path', project, '--spec', specFile]);
    await run(['doctor', '--path', project]);
  } finally {
    console.log = originalLog;
  }
  assert.match(lines.join('\n'), new RegExp(`Squad ${version.replaceAll('.', '\\.')} instalada`));
  assert.match(lines.join('\n'), /Squad operacional/);
});
