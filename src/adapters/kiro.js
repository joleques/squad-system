'use strict';

const path = require('node:path');
const { writeFile } = require('../core/files');
const { roles } = require('./roles');

function emit(project, stage) {
  for (const [name, role] of Object.entries(roles)) {
    const agent = {
      name,
      description: role.description,
      prompt: role.instructions,
      tools: role.tools,
      resources: [
        'file://AGENTS.md',
        'file://.agent/memory/project-context.md',
        'file://.agent/memory/squad-config.md',
        'file://.agent/templates/_TEMPLATE-demanda.md'
      ]
    };
    stage(path.join('.kiro', 'agents', `${name}.json`), `${JSON.stringify(agent, null, 2)}\n`);
  }
  stage(path.join('.kiro', 'hooks', 'check-tests.sh'), testHook());
}

function testHook() {
  return [
    '#!/usr/bin/env bash',
    'set -uo pipefail',
    'CONFIG=.agent/memory/squad-config.md',
    '[ -f "$CONFIG" ] || exit 0',
    "COMMAND=$(awk -F'`' '/comando_teste:/{print $2; exit}' \"$CONFIG\")",
    '[ -n "$COMMAND" ] || exit 0',
    'bash -lc "$COMMAND"',
    ''
  ].join('\n');
}

module.exports = { emit, testHook };
