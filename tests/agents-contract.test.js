'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createApplication } = require('../src/application/composition-root');
const { validateSpec } = require('../src/domain/installation-spec');

function install(project, input, options) { return createApplication(project).install(input, options); }

const roles = ['service-lider', 'service-analista', 'service-dev', 'service-reviewer'];

function project() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'squad-contract-'));
}

function spec(overrides = {}) {
  return {
    name: 'orders',
    description: 'Serviço responsável pela gestão completa de pedidos.',
    purpose: 'Processar pedidos de clientes com segurança.',
    users: 'Clientes e operadores.',
    domain: 'Pedidos, itens e confirmação.',
    stage: 'MVP',
    stack: 'node',
    testCommand: 'npm test',
    tools: ['kiro', 'codex'],
    ...overrides
  };
}

test('AGENTS.md instalado contém o contrato operacional completo', () => {
  const target = project();
  install(target, spec());
  const agents = fs.readFileSync(path.join(target, 'AGENTS.md'), 'utf8');
  for (const heading of [
    '## Persona e Comunicação',
    '## Classificação da Demanda',
    '## Contexto Obrigatório',
    '## Gate de Testes',
    '## Fluxo Obrigatório',
    '## Validação do Usuário e Continuidade',
    '## Política de Escalonamento'
  ]) assert.match(agents, new RegExp(escapeRegExp(heading)), `seção ausente: ${heading}`);
});

test('contrato exige respostas objetivas e detalhes somente sob demanda', () => {
  const target = project();
  install(target, spec());
  const agents = fs.readFileSync(path.join(target, 'AGENTS.md'), 'utf8');
  assert.match(agents, /começar pela decisão ou resultado/i);
  assert.match(agents, /não repetir.*ticket/i);
  assert.match(agents, /detalhes adicionais.*solicitados/i);
  assert.match(agents, /não narrar.*ferramentas/i);
});

test('contrato define handoff mínimo por referência aos artefatos persistidos', () => {
  const target = project();
  install(target, spec());
  const agents = fs.readFileSync(path.join(target, 'AGENTS.md'), 'utf8');

  assert.match(agents, /handoff mínimo/i);
  assert.match(agents, /identificador e caminho do ticket/i);
  assert.match(agents, /status.*evidências indispensáveis.*lacunas.*próximo passo/is);
  assert.match(agents, /consultar diretamente.*não retransmitir.*conteúdo já persistido/is);
});

test('cada papel comunica somente os dados necessários ao destinatário', () => {
  const target = project();
  install(target, spec());
  const expected = {
    'service-lider': /encaminhe.*caminho do ticket.*status.*próximo passo/is,
    'service-analista': /caminho do ticket.*prontidão.*lacunas.*próximo passo/is,
    'service-dev': /status.*evidências.*arquivos alterados.*bloqueios.*próximo passo/is,
    'service-reviewer': /status.*veredito.*correção acionável.*próximo passo/is,
  };

  for (const [role, handoff] of Object.entries(expected)) {
    const canonical = fs.readFileSync(path.join(target, `.agent/subagents/${role}.md`), 'utf8');
    assert.match(canonical, handoff, `handoff incompleto: ${role}`);
    assert.match(canonical, /consult[ae].*ticket.*diretamente|não repita.*ticket/is);
  }
});

function assertProtectedGates(agents) {
  assert.match(agents, /plano e aprovação explícita/i);
  assert.match(agents, /trabalhar com TDD/i);
  assert.match(agents, /Reviewer inicia o veredito com `APROVADO` ou `REPROVADO`/i);
  assert.match(agents, /^- Somente após aceite explícito do usuário a demanda fica `concluída`\.$/m);
}

test('contrato detecta mutações nos quatro gates protegidos', () => {
  const target = project();
  install(target, spec());
  const agents = fs.readFileSync(path.join(target, 'AGENTS.md'), 'utf8');
  assertProtectedGates(agents);

  for (const mutation of [
    agents.replaceAll('plano e aprovação explícita', 'plano'),
    agents.replaceAll('Trabalhar com TDD', 'Implementar a mudança'),
    agents.replaceAll('Reviewer inicia o veredito com `APROVADO` ou `REPROVADO`', 'Reviewer registra a revisão'),
    agents.replaceAll('Somente após aceite explícito do usuário', 'Após revisão técnica'),
  ]) {
    assert.throws(() => assertProtectedGates(mutation), assert.AssertionError);
  }
});

test('skills instaladas persistem decisões e retornam referências concisas', () => {
  const target = project();
  install(target, spec());
  const triage = fs.readFileSync(path.join(target, '.codex/skills/triagem-demanda/SKILL.md'), 'utf8');
  const plan = fs.readFileSync(path.join(target, '.codex/skills/plano-implementacao/SKILL.md'), 'utf8');
  const quality = fs.readFileSync(path.join(target, '.codex/skills/quality/SKILL.md'), 'utf8');

  assert.match(triage, /caminho do ticket.*prontidão.*lacunas.*próximo passo/is);
  assert.match(plan, /persista o plano no ticket/i);
  assert.match(plan, /aguarda aprovação explícita/i);
  assert.match(quality, /evidencias vermelho\/verde/i);
  assert.match(quality, /sem retransmitir logs completos/i);
});

test('ajuste pontual continua no mesmo ticket sem reiniciar o pipeline', () => {
  const target = project();
  install(target, spec());
  const agents = fs.readFileSync(path.join(target, 'AGENTS.md'), 'utf8');
  assert.match(agents, /aguardando-validacao/);
  assert.match(agents, /ajuste pontual.*mesmo ticket/is);
  assert.match(agents, /sem nova triagem.*sem novo plano.*sem nova aprovação/is);
  assert.match(agents, /novo objetivo independente.*nova demanda/is);
  assert.match(agents, /aceite explícito.*concluída/is);
});

function assertReviewRejectionLimit(document) {
  assert.match(document, /somente.*`REPROVADO`.*consome.*cinco/is);
  assert.match(document, /`APROVADO`.*espera.*feedback.*validação.*aceite.*não consomem (?:nem|e não) reiniciam/is);
  assert.match(document, /ajuste pontual.*mesmo ticket.*reprovações.*acumulad/is);
  assert.match(document, /quinta reprovação.*acumulad.*interromp.*escal/is);
  assert.match(document, /nova demanda.*contador próprio/is);
}

test('contrato instalado limita cinco reprovações acumuladas por ticket', () => {
  const target = project();
  install(target, spec());
  assertReviewRejectionLimit(fs.readFileSync(path.join(target, 'AGENTS.md'), 'utf8'));
});

test('papéis e projeções preservam a contagem de reprovações', () => {
  const target = project();
  install(target, spec());
  for (const role of ['service-lider', 'service-reviewer']) {
    const canonical = fs.readFileSync(path.join(target, `.agent/subagents/${role}.md`), 'utf8');
    assertReviewRejectionLimit(canonical);
    assertReviewRejectionLimit(JSON.parse(fs.readFileSync(path.join(target, `.kiro/agents/${role}.json`), 'utf8')).prompt);
    const codex = fs.readFileSync(path.join(target, `.codex/agents/${role}.toml`), 'utf8');
    assertReviewRejectionLimit(JSON.parse(codex.match(/^developer_instructions = (.+)$/m)[1]));
  }
});

test('template instalado distingue sequência da revisão e reprovações consumidas', () => {
  const target = project();
  install(target, spec());
  const template = fs.readFileSync(path.join(target, '.agent/templates/_TEMPLATE-demanda.md'), 'utf8');
  assert.match(template, /\| Revisão \| Resultado \| Reprovações acumuladas \| Observação \|/);
  assert.match(template, /somente `REPROVADO` incrementa/i);
});

test('fontes canônicas dos quatro papéis são instaladas e projetadas nos adaptadores', () => {
  const target = project();
  install(target, spec());
  for (const role of roles) {
    const canonical = fs.readFileSync(path.join(target, `.agent/subagents/${role}.md`), 'utf8').trim();
    const kiro = JSON.parse(fs.readFileSync(path.join(target, `.kiro/agents/${role}.json`), 'utf8'));
    const codex = fs.readFileSync(path.join(target, `.codex/agents/${role}.toml`), 'utf8');
    const encodedInstructions = codex.match(/^developer_instructions = (.+)$/m);
    assert.equal(kiro.prompt, canonical);
    assert.equal(JSON.parse(encodedInstructions[1]), canonical);
    assert.match(canonical, /Resposta ao usuário|Comunicação objetiva/i);
  }
});

test('integração customizada não pode remover seções obrigatórias', () => {
  assert.throws(() => validateSpec(spec({
    agentsIntegration: '<!-- squad-system:start -->\n## Squad\nPouco conteúdo.\n<!-- squad-system:end -->'
  })), /seções obrigatórias/i);
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
