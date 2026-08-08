#!/usr/bin/env bash
set -uo pipefail
CONFIG=.agent/memory/squad-config.md
[ -f "$CONFIG" ] || exit 0
COMMAND=$(awk -F'`' '/comando_teste:/{print $2; exit}' "$CONFIG")
[ -n "$COMMAND" ] || exit 0
bash -lc "$COMMAND"
