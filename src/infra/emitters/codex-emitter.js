'use strict';

function emitCodex(roles, stage) {
  for (const [name, role] of Object.entries(roles)) stage(`.codex/agents/${name}.toml`, `name = ${JSON.stringify(name)}\ndescription = ${JSON.stringify(role.description)}\ndeveloper_instructions = ${JSON.stringify(role.instructions)}\n`);
}

module.exports = { emitCodex };
