'use strict';

const path = require('node:path');
const { inspectProject } = require('./detection/project');
const { install } = require('./installation/install');
const { uninstall } = require('./installation/uninstall');
const { doctor } = require('./validation/doctor');
const { readJson } = require('./core/files');

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

function printHelp() {
  console.log([
    'Uso:',
    '  squad-system inspect [--path <projeto>]',
    '  squad-system init --spec <install-spec.json> [--path <projeto>] [--tools kiro,codex] [--dry-run]',
    '  squad-system doctor [--path <projeto>]',
    '  squad-system uninstall [--path <projeto>] [--dry-run]',
    '',
    'A instalacao e mediada pelo agente: inspect produz o contexto; o agente prepara o spec e integra o AGENTS.md.'
  ].join('\n'));
}

async function run(argv) {
  const args = parseArgs(argv);
  if (args.command === 'help' || args.command === '--help' || args.command === '-h') return printHelp();
  if (args.command === 'inspect') return console.log(JSON.stringify(inspectProject(args.project), null, 2));
  if (args.command === 'doctor') return printDoctor(doctor(args.project));
  if (args.command === 'uninstall') return printResult(uninstall(args.project, { dryRun: args.dryRun }));
  if (args.command === 'init') {
    if (!args.spec) throw new Error('init requer --spec. O agente deve gerar o spec a partir do resultado de inspect.');
    return printResult(install(args.project, readJson(args.spec), { tools: args.tools, dryRun: args.dryRun }));
  }
  throw new Error(`Comando desconhecido: ${args.command}`);
}

function printResult(result) {
  console.log(`${result.status}: ${result.summary}`);
  for (const item of result.changes || []) console.log(`- ${item.action}: ${item.path}`);
}

function printDoctor(result) {
  console.log(`${result.ok ? 'OK' : 'FAIL'}: ${result.summary}`);
  for (const check of result.checks) console.log(`- ${check.ok ? 'OK' : 'FAIL'} ${check.name}${check.detail ? `: ${check.detail}` : ''}`);
  if (!result.ok) process.exitCode = 1;
}

module.exports = { run, parseArgs };
