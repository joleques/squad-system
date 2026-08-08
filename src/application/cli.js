'use strict';

const fs = require('node:fs');
const { parseArgs } = require('./arguments');
const { createApplication } = require('./composition-root');

function printHelp() {
  console.log(['Uso:', '  squad-system inspect [--path <projeto>]', '  squad-system init --spec <install-spec.json> [--path <projeto>] [--tools kiro,codex] [--dry-run]', '  squad-system doctor [--path <projeto>]', '  squad-system uninstall [--path <projeto>] [--dry-run]', '', 'A instalacao e mediada pelo agente: inspect produz o contexto; o agente prepara o spec e integra o AGENTS.md.'].join('\n'));
}
async function run(argv) {
  const args = parseArgs(argv);
  if (['help', '--help', '-h'].includes(args.command)) return printHelp();
  const app = createApplication(args.project);
  if (args.command === 'inspect') return console.log(JSON.stringify(app.inspectProject(), null, 2));
  if (args.command === 'doctor') return printDoctor(app.doctor());
  if (args.command === 'uninstall') return printResult(app.uninstall({ dryRun: args.dryRun }));
  if (args.command === 'init') {
    if (!args.spec) throw new Error('init requer --spec. O agente deve gerar o spec a partir do resultado de inspect.');
    return printResult(app.install(JSON.parse(fs.readFileSync(args.spec, 'utf8')), { tools: args.tools, dryRun: args.dryRun }));
  }
  throw new Error(`Comando desconhecido: ${args.command}`);
}
function printResult(result) { console.log(`${result.status}: ${result.summary}`); for (const item of result.changes || []) console.log(`- ${item.action}: ${item.path}`); }
function printDoctor(result) { console.log(`${result.ok ? 'OK' : 'FAIL'}: ${result.summary}`); for (const item of result.checks) console.log(`- ${item.ok ? 'OK' : 'FAIL'} ${item.name}${item.detail ? `: ${item.detail}` : ''}`); if (!result.ok) process.exitCode = 1; }
module.exports = { run, parseArgs };
