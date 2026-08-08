'use strict';

function emitKiro(roles, stage) {
  for (const [name, role] of Object.entries(roles)) stage(`.kiro/agents/${name}.json`, `${JSON.stringify({
    name, description: role.description, prompt: role.instructions, tools: role.tools,
    resources: ['file://AGENTS.md', 'file://.agent/memory/project-context.md', 'file://.agent/memory/squad-config.md', 'file://.agent/templates/_TEMPLATE-demanda.md', `file://.agent/subagents/${name}.md`]
  }, null, 2)}\n`);
  stage('.kiro/hooks/check-tests.sh', ['#!/usr/bin/env bash', 'set -uo pipefail', 'CONFIG=.agent/memory/squad-config.md', '[ -f "$CONFIG" ] || exit 0', "COMMAND=$(awk -F'`' '/comando_teste:/{print $2; exit}' \"$CONFIG\")", '[ -n "$COMMAND" ] || exit 0', 'bash -lc "$COMMAND"', ''].join('\n'));
}

module.exports = { emitKiro };
