'use strict';

const fs = require('node:fs');
const path = require('node:path');

const metadata = {
  'service-lider': {
    description: 'Orquestrador e ponto único de entrada da Squad de Chão de Fábrica.',
    tools: ['read', 'grep', 'glob', 'subagent']
  },
  'service-analista': {
    description: 'Gate de entrada que estrutura e valida a demanda.',
    tools: ['read', 'grep', 'glob', 'write']
  },
  'service-dev': {
    description: 'Maker que implementa a demanda aprovada com TDD.',
    tools: ['read', 'grep', 'glob', 'write', 'shell']
  },
  'service-reviewer': {
    description: 'Checker e gate técnico de saída.',
    tools: ['read', 'grep', 'glob', 'write']
  }
};

const roles = Object.fromEntries(Object.entries(metadata).map(([name, role]) => [name, {
  ...role,
  instructions: fs.readFileSync(path.resolve(__dirname, '..', '..', 'templates', 'contracts', 'subagents', `${name}.md`), 'utf8').trim()
}]));

module.exports = { roles };
