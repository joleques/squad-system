'use strict';

const path = require('node:path');
const { roles } = require('./roles');

function quote(value) {
  return JSON.stringify(String(value));
}

function emit(project, stage) {
  for (const [name, role] of Object.entries(roles)) {
    const content = `name = ${quote(name)}\ndescription = ${quote(role.description)}\ndeveloper_instructions = ${quote(role.instructions)}\n`;
    stage(path.join('.codex', 'agents', `${name}.toml`), content);
  }
}

module.exports = { emit };
