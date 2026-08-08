'use strict';

const path = require('node:path');
function parseArgs(argv) {
  const parsed = { command: argv[0] || 'help', project: process.cwd(), tools: null, spec: null, dryRun: false };
  for (let index = 1; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--path') parsed.project = path.resolve(argv[++index]);
    else if (value === '--tools') parsed.tools = argv[++index].split(',').map((item) => item.trim());
    else if (value === '--spec') parsed.spec = path.resolve(argv[++index]);
    else if (value === '--dry-run') parsed.dryRun = true;
    else throw new Error(`Argumento desconhecido: ${value}`);
  }
  return parsed;
}
module.exports = { parseArgs };
