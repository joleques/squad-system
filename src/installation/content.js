'use strict';

const { BEGIN_MARKER, END_MARKER } = require('../core/constants');

function managedAgentsBlock() {
  return `${BEGIN_MARKER}\n## Squad de Chão de Fábrica\n\n- Ponto de entrada: \`service-lider\`.\n- Fluxo: analista → aprovação → dev ⇄ reviewer → validação do usuário.\n- Implementação exige plano aprovado e testes verdes antes e depois.\n- Ajuste dentro da mesma entrega reutiliza o ticket e volta diretamente para dev/reviewer.\n- A tarefa só termina com aceite explícito do usuário.\n- Respostas devem ser curtas, claras e começar pela decisão ou resultado.\n- Detalhes adicionais são fornecidos quando solicitados.\n- Nunca exponha segredos, tokens ou conteúdo de arquivos \`.env\`.\n${END_MARKER}`;
}

function mergeAgents(existing, proposed) {
  const block = proposed || managedAgentsBlock();
  const start = existing.indexOf(BEGIN_MARKER);
  const end = existing.indexOf(END_MARKER);
  if (start >= 0 && end > start) {
    return `${existing.slice(0, start)}${block}${existing.slice(end + END_MARKER.length)}`.trimEnd() + '\n';
  }
  return `${existing.trimEnd()}${existing.trim() ? '\n\n' : ''}${block}\n`;
}

function projectContext(spec) {
  return `# Contexto do Projeto — ${spec.name}\n\n## Descrição\n\n${spec.description}\n\n## Propósito\n\n${spec.purpose}\n\n## Usuários\n\n${spec.users}\n\n## Domínio\n\n${spec.domain}\n\n## Stack\n\n${spec.stack}\n\n## Integrações\n\n${spec.integrations || 'Nenhuma informada.'}\n\n## Restrições\n\n${spec.constraints || 'Nenhuma informada.'}\n\n## Arquitetura\n\n${spec.architecture || 'Padrão arquitetura-proposta: domain, use_case, application, infra e shared; dependências apontam para dentro.'}\n\n## Estágio atual\n\n${spec.stage}\n`;
}

function squadConfig(spec) {
  return `# Configuração da Squad\n\n- **stack:** ${spec.stack}\n- **comando_teste:** \`${spec.testCommand}\`\n- **comando_teste_completo:** \`${spec.fullTestCommand || spec.testCommand}\`\n- **localizacao_testes:** ${spec.testLocation || 'detectar conforme o projeto'}\n- **regra_cobertura:** ${spec.coverageRule || 'todo arquivo criado ou alterado exige teste correspondente'}\n- **arquitetura:** ${spec.architecture || 'arquitetura-proposta'}\n`;
}

function ticketTemplate() {
  return `---\nid: DEMANDA-000\ntitulo: <título>\ntipo: <analise|bug|melhoria|evolucao|nova funcionalidade>\nstatus: nova\ndata: <YYYY-MM-DD>\n---\n\n# <título>\n\n## Objetivo\n\n## Contexto\n\n## Escopo\n\n## Definition of Done\n\n## Critérios de Aceite\n\n## Lacunas Bloqueantes\n\n## Registro de Revisão\n\n| Rodada | Resultado | Observação |\n|---|---|---|\n\n## Validação do Usuário\n\n| Ciclo | Feedback | Classificação | Resultado |\n|---|---|---|---|\n\nEstados: \`em-implementacao\`, \`em-revisao\`, \`aguardando-validacao\`, \`em-ajuste\`, \`concluida\`.\n`;
}

module.exports = { managedAgentsBlock, mergeAgents, projectContext, squadConfig, ticketTemplate };
