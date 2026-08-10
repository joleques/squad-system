const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');

const root = join(__dirname, '..');
const sourcePath = join(
  root,
  'documentacao',
  'diagramas',
  'jornada-agentes-squad-system.sequence.json',
);
const htmlPath = join(
  root,
  'documentacao',
  'diagramas',
  'jornada-agentes-squad-system.html',
);
const previewPath = join(
  root,
  'documentacao',
  'diagramas',
  'jornada-agentes-squad-system.png',
);

test('documenta a jornada completa dos agentes da Squad System', () => {
  const source = JSON.parse(readFileSync(sourcePath, 'utf8'));
  const html = readFileSync(htmlPath, 'utf8');

  assert.equal(source.diagram_type, 'sequence');
  assert.ok(source.meta.viewBox[0] <= 620, 'os participantes devem ocupar a largura útil da página');
  assert.ok(source.meta.viewBox[1] <= 980, 'o canvas não deve manter espaço vazio após o fluxo');
  assert.ok(
    source.messages.every(({ note }) => note === undefined),
    'textos auxiliares longos não devem invadir outras raias',
  );
  for (const segment of source.segments) {
    const firstMessage = source.messages.find(({ y }) => y >= segment.from && y <= segment.to);
    assert.ok(
      firstMessage.y - segment.from >= 50,
      `a etapa ${segment.label} precisa de respiro antes da primeira mensagem`,
    );
  }
  assert.deepEqual(
    source.participants.map(({ id }) => id),
    ['usuario', 'lider', 'analista', 'dev', 'reviewer'],
  );
  assert.equal(
    source.activations.filter(({ participant }) => participant === 'lider').length,
    4,
    'o Líder deve ter uma ativação por etapa, sem atravessar cabeçalhos',
  );
  assert.deepEqual(
    [...new Set(source.activations.map(({ participant }) => participant))],
    ['lider', 'analista', 'dev', 'reviewer'],
  );
  for (const activation of source.activations) {
    const containingSegment = source.segments.find(
      ({ from, to }) => activation.from >= from && activation.to <= to,
    );
    assert.ok(containingSegment, `a ativação de ${activation.participant} deve ficar dentro de uma etapa`);
    assert.ok(
      activation.from - containingSegment.from >= 30,
      `a ativação de ${activation.participant} não deve sobrepor o título da etapa`,
    );
  }

  const messageLabels = source.messages.map(({ label }) => label);
  assert.deepEqual(messageLabels.slice(0, 4), [
    'Descreve a demanda',
    'Solicita análise',
    'Demanda pronta',
    'Apresenta o plano',
  ]);

  const sourceText = JSON.stringify(source);
  for (const expected of [
    'Aprovar plano',
    'Testes iniciais',
    'Revisao tecnica',
    'Aceite explicito',
    'Ajuste pontual',
    'Nova demanda',
  ]) {
    assert.match(sourceText, new RegExp(expected));
    assert.match(html, new RegExp(expected));
  }

  assert.match(html, /data-theme/);
  assert.match(html, /Download SVG/);
  assert.doesNotMatch(html, />Legend</);
  assert.doesNotMatch(html, />async trace</);

  const preview = readFileSync(previewPath);
  assert.deepEqual([...preview.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);

  const readme = readFileSync(join(root, 'README.md'), 'utf8');
  const diagramPosition = readme.indexOf('documentacao/diagramas/jornada-agentes-squad-system.png');
  const examplesPosition = readme.indexOf('### Exemplos de interação');
  assert.ok(diagramPosition >= 0, 'o README deve incorporar a prévia do diagrama');
  assert.ok(diagramPosition < examplesPosition, 'o diagrama deve aparecer antes dos exemplos');
  assert.match(readme, /documentacao\/diagramas\/jornada-agentes-squad-system\.html/);
  assert.match(readme, /Baixe o HTML e abra-o localmente/);
});
