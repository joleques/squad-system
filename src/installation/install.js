'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { validateSpec } = require('./spec');
const { mergeAgents, projectContext, squadConfig, ticketTemplate } = require('./content');
const { ensureDir, hash, listFiles } = require('../core/files');
const { VERSION, MANIFEST_FILE, TOOLS } = require('../core/constants');
const kiro = require('../adapters/kiro');
const codex = require('../adapters/codex');
const { roles } = require('../adapters/roles');

const SKILLS = ['triagem-demanda', 'plano-implementacao', 'quality', 'arquitetura', 'arquitetura-revisor', 'software-principles', 'software-principles-revisor'];

function install(project, rawSpec, options = {}) {
  const spec = validateSpec({ ...rawSpec, tools: options.tools || rawSpec.tools });
  const tools = spec.tools.filter((tool) => TOOLS.includes(tool));
  const planned = new Map();
  const stage = (relative, content) => planned.set(normalize(relative), Buffer.from(content));

  const agentsPath = path.join(project, 'AGENTS.md');
  const currentAgents = fs.existsSync(agentsPath) ? fs.readFileSync(agentsPath, 'utf8') : '';
  stage('AGENTS.md', mergeAgents(currentAgents, spec.agentsIntegration));
  stage('.agent/memory/project-context.md', projectContext(spec));
  stage('.agent/memory/squad-config.md', squadConfig(spec));
  stage('.agent/templates/_TEMPLATE-demanda.md', ticketTemplate());
  for (const [name, role] of Object.entries(roles)) stage(`.agent/subagents/${name}.md`, `${role.instructions}\n`);

  for (const tool of tools) (tool === 'kiro' ? kiro : codex).emit(project, stage);
  stageSkills(tools, stage);
  rejectSecrets(planned);

  const existingManifest = readManifest(project);
  assertManagedFilesUnchanged(project, existingManifest);
  const changes = describeChanges(project, planned);
  if (options.dryRun) return { status: 'DRY-RUN', summary: `${changes.length} arquivo(s) seriam processados`, changes };

  const snapshot = snapshotFiles(project, planned);
  try {
    for (const [relative, content] of planned) write(project, relative, content);
    const manifest = buildManifest(project, tools, spec, planned, snapshot, existingManifest);
    write(project, MANIFEST_FILE, Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`));
    return { status: 'OK', summary: `Squad ${VERSION} instalada para ${tools.join(' + ')}`, changes };
  } catch (error) {
    restoreSnapshot(project, snapshot);
    throw new Error(`Instalacao revertida: ${error.message}`);
  }
}

function stageSkills(tools, stage) {
  const source = path.resolve(__dirname, '..', '..', 'templates', 'execucao-service', 'core', 'skills');
  for (const skill of SKILLS) {
    const directory = path.join(source, skill);
    if (!fs.existsSync(directory)) throw new Error(`Skill essencial ausente no pacote: ${skill}`);
    for (const relative of listFiles(directory)) {
      const content = fs.readFileSync(path.join(directory, relative));
      for (const tool of tools) stage(path.join(`.${tool}`, 'skills', skill, relative), content);
    }
  }
}

function buildManifest(project, tools, spec, planned, snapshot, existingManifest) {
  const files = [];
  for (const [relative, content] of planned) {
    files.push({ path: relative, hash: hash(content), created: !snapshot.get(relative)?.existed });
  }
  const backups = {};
  for (const [relative, value] of snapshot) {
    if (value.existed && (!existingManifest || !existingManifest.files?.some((item) => item.path === relative))) {
      backups[relative] = value.content.toString('base64');
    }
  }
  return {
    schemaVersion: 1,
    version: VERSION,
    installedAt: new Date().toISOString(),
    tools,
    project: spec.name,
    files,
    backups: { ...(existingManifest?.backups || {}), ...backups }
  };
}

function readManifest(project) {
  const file = path.join(project, MANIFEST_FILE);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
}

function assertManagedFilesUnchanged(project, manifest) {
  if (!manifest) return;
  for (const file of manifest.files || []) {
    if (file.path === 'AGENTS.md') continue;
    const absolute = path.join(project, file.path);
    if (fs.existsSync(absolute) && hash(fs.readFileSync(absolute)) !== file.hash) {
      throw new Error(`Arquivo gerenciado possui customização local: ${file.path}. Preserve ou remova a customização antes de reinstalar.`);
    }
  }
}

function snapshotFiles(project, planned) {
  const snapshot = new Map();
  for (const relative of planned.keys()) {
    const absolute = path.join(project, relative);
    snapshot.set(relative, { existed: fs.existsSync(absolute), content: fs.existsSync(absolute) ? fs.readFileSync(absolute) : null });
  }
  return snapshot;
}

function restoreSnapshot(project, snapshot) {
  for (const [relative, value] of snapshot) {
    const absolute = path.join(project, relative);
    if (value.existed) write(project, relative, value.content);
    else if (fs.existsSync(absolute)) fs.unlinkSync(absolute);
  }
}

function write(project, relative, content) {
  const absolute = path.resolve(project, relative);
  if (!absolute.startsWith(`${path.resolve(project)}${path.sep}`)) throw new Error(`Caminho fora do projeto: ${relative}`);
  ensureDir(path.dirname(absolute));
  fs.writeFileSync(absolute, content);
}

function describeChanges(project, planned) {
  return [...planned.entries()].map(([relative, content]) => {
    const absolute = path.join(project, relative);
    if (!fs.existsSync(absolute)) return { action: 'create', path: relative };
    return { action: hash(fs.readFileSync(absolute)) === hash(content) ? 'unchanged' : 'update', path: relative };
  });
}

function rejectSecrets(planned) {
  const suspicious = /(BEGIN (RSA |OPENSSH )?PRIVATE KEY|(?:api[_-]?key|token|secret)\s*[=:]\s*['\"]?[A-Za-z0-9_\-]{16,})/i;
  for (const [relative, content] of planned) {
    if (/(^|\/)\.env(?:\.|$)|(^|\/)secrets?\//i.test(relative)) throw new Error(`Arquivo sensivel recusado: ${relative}`);
    if (suspicious.test(content.toString())) throw new Error(`Possivel segredo recusado em ${relative}`);
  }
}

function normalize(relative) {
  return relative.split(path.sep).join('/');
}

module.exports = { install, rejectSecrets, describeChanges, assertManagedFilesUnchanged, SKILLS };
