'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

function filesWithin(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (fs.statSync(absolutePath).isFile()) return [absolutePath];
  return fs.readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) =>
    filesWithin(path.join(relativePath, entry.name))
  );
}

function distributedFiles() {
  return packageJson.files.flatMap(filesWithin);
}

test('metadados identificam o pacote público e sua origem', () => {
  assert.equal(packageJson.name, '@joleques/squad-system');
  assert.match(packageJson.version, /^\d+\.\d+\.\d+$/);
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

test('skills distribuídas usam o caminho canônico do squad-config', () => {
  for (const file of distributedFiles()) {
    const content = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(content, /documentacao\/squad-config\.md/, path.relative(root, file));
  }

  for (const skill of ['plano-implementacao', 'quality']) {
    const skillPath = path.join(
      root,
      'templates/execucao-service/core/skills',
      skill,
      'SKILL.md',
    );
    assert.match(
      fs.readFileSync(skillPath, 'utf8'),
      /\.agent\/memory\/squad-config\.md/,
      skill,
    );
  }
});

test('licença, versão de Node e documentação pública estão presentes', () => {
  assert.match(fs.readFileSync(path.join(root, 'LICENSE'), 'utf8'), /MIT License/);
  assert.equal(fs.readFileSync(path.join(root, '.nvmrc'), 'utf8').trim(), '22');
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  assert.match(readme, /npx @joleques\/squad-system init/);
  assert.match(readme, /Node\.js 18/);
  assert.doesNotMatch(readme, /npx squad-system/);
});

function assertOfficialLogo(readme) {
  const logoPath = 'documentacao/identidade-visual/logo-horizontal-color.svg';
  const introduction = readme.slice(0, readme.indexOf('## MVP'));

  assert.ok(fs.existsSync(path.join(root, logoPath)), 'ativo oficial ausente');
  assert.doesNotMatch(introduction, /^# Squad System$/m);
  const centeredLogo = introduction.match(
    new RegExp(
      `<p align="center">\\s*<img src="${logoPath}" alt="[^"]*Squad System[^"]*" width="(\\d+)"[^>]*>\\s*</p>`,
    ),
  );
  assert.ok(centeredLogo, 'assinatura oficial centralizada ausente da introdução');
  assert.ok(Number(centeredLogo[1]) >= 200 && Number(centeredLogo[1]) <= 600, 'largura inadequada');
}

test('README exibe a assinatura visual oficial com alternativa acessível', () => {
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  assertOfficialLogo(readme);
});

test('contrato do logo aceita atributos adicionais sem deixar de proteger src, alt e width', () => {
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');

  for (const mutation of [
    readme.replace('documentacao/identidade-visual/logo-horizontal-color.svg', 'logo-incorreto.svg'),
    readme.replace('alt="Logotipo colorido do Squad System"', 'alt=""'),
    readme.replace('width="420"', 'width="100"'),
    readme.replace('width="420"', ''),
    readme.replace('<p align="center">', '<p>'),
  ]) {
    assert.throws(() => assertOfficialLogo(mutation), assert.AssertionError);
  }
});

function sectionBetween(document, startHeading, endHeading) {
  const start = document.indexOf(startHeading);
  const end = document.indexOf(endHeading, start + startHeading.length);

  assert.notEqual(start, -1, `seção ausente: ${startHeading}`);
  assert.notEqual(end, -1, `seção seguinte ausente: ${endHeading}`);
  return document.slice(start, end);
}

function assertPracticalGuide(readme) {
  const roles = sectionBetween(
    readme,
    '### Papéis, limites e entregas',
    '### Workflow, gates e ações do usuário',
  );
  const roleContracts = {
    'service-lider': [/orquestra/i, /não escreve código, ticket ou revisão/i, /próximo passo claro/i],
    'service-analista': [/classifica a demanda/i, /não implementa código/i, /ticket pronto/i],
    'service-dev': [/implementa somente demanda aprovada/i, /base previamente vermelha/i, /protegida por testes/i],
    'service-reviewer': [/revisa aderência ao ticket/i, /não altera código/i, /`APROVADO` ou `REPROVADO`/],
  };

  for (const [role, cellContracts] of Object.entries(roleContracts)) {
    const row = roles.split('\n').find((line) => line.includes(`\`${role}\``));
    assert.ok(row, `papel ausente da tabela: ${role}`);
    for (const contract of cellContracts) assert.match(row, contract);
  }

  const workflow = sectionBetween(
    readme,
    '### Workflow, gates e ações do usuário',
    '### Exemplos de interação',
  );
  for (const workflowInvariant of [
    /aprovação explícita/i,
    /testes iniciais/i,
    /aguardando-validacao/,
    /aceite explícito/i,
    /mesmo ticket.*retorna diretamente a dev e reviewer.*sem nova triagem, novo plano ou nova aprovação/i,
    /objetivo independente exige \*\*nova demanda\*\*/i,
    /somente.*`REPROVADO`.*consome.*cinco/is,
    /`APROVADO`.*espera.*feedback.*validação.*aceite.*não consomem (?:nem|e não) reiniciam/is,
    /ajuste pontual.*reprovações.*acumulad/is,
    /quinta reprovação.*acumulad.*escal/is,
  ]) {
    assert.match(workflow, workflowInvariant);
  }

  assert.match(readme, /documentacao\//);
  assert.match(readme, /pesquisa histórica/i);
  assert.match(readme, /Exemplos? de interação/i);
}

test('README documenta a operação completa da Squad de Chão de Fábrica', () => {
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  assertPracticalGuide(readme);
});

test('contrato documental detecta remoção de responsabilidades e regras de continuidade', () => {
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  const mutations = [
    readme.replace(/\| `service-lider` \|.*\n/, ''),
    readme.replace('base previamente vermelha', 'falha anterior'),
    readme.replace('retorna diretamente a dev e reviewer', 'retorna ao fluxo'),
    readme.replace('objetivo independente exige **nova demanda**', 'objetivo independente será avaliado'),
  ];

  for (const mutation of mutations) {
    assert.throws(() => assertPracticalGuide(mutation), assert.AssertionError);
  }
});
