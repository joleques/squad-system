'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { ROLES } = require('../../shared/constants');

const ROLE_METADATA = {
  'service-lider': ['Orquestrador e ponto único de entrada da Squad de Chão de Fábrica.', ['read', 'grep', 'glob', 'subagent']],
  'service-analista': ['Gate de entrada que estrutura e valida a demanda.', ['read', 'grep', 'glob', 'write']],
  'service-dev': ['Maker que implementa a demanda aprovada com TDD.', ['read', 'grep', 'glob', 'write', 'shell']],
  'service-reviewer': ['Checker e gate técnico de saída.', ['read', 'grep', 'glob', 'write']]
};

class FilesystemTemplateRepository {
  constructor(root = path.resolve(__dirname, '..', '..', '..', 'templates')) { this.root = root; }
  agentsContract() { return this.#read('contracts/AGENTS.md', 'utf8').trim(); }
  roles() {
    return Object.fromEntries(ROLES.map((name) => [name, {
      description: ROLE_METADATA[name][0], tools: ROLE_METADATA[name][1],
      instructions: this.#read(`contracts/subagents/${name}.md`, 'utf8').trim()
    }]));
  }
  skillFiles(skills) {
    const result = new Map();
    for (const skill of skills) {
      const directory = path.join(this.root, 'execucao-service/core/skills', skill);
      if (!fs.existsSync(directory)) throw new Error(`Skill essencial ausente no pacote: ${skill}`);
      for (const relative of listFiles(directory)) result.set(`${skill}/${normalize(relative)}`, fs.readFileSync(path.join(directory, relative)));
    }
    return result;
  }
  #read(relative, encoding) { return fs.readFileSync(path.join(this.root, relative), encoding); }
}

function listFiles(directory, base = directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(absolute, base) : [path.relative(base, absolute)];
  });
}
function normalize(value) { return value.split(path.sep).join('/'); }

module.exports = { FilesystemTemplateRepository };
