'use strict';

const { validateSpec } = require('../domain/installation-spec');
const { createManifest } = require('../domain/installation-manifest');
const { mergeAgents, projectContext, squadConfig, ticketTemplate } = require('../domain/squad-contract');
const { hash } = require('../shared/hash');
const { MANIFEST_FILE, TOOLS } = require('../shared/constants');

const SKILLS = ['triagem-demanda', 'plano-implementacao', 'quality', 'arquitetura', 'arquitetura-revisor', 'software-principles', 'software-principles-revisor'];

function createInstallSquad({ files, templates, emitters, version, now = () => new Date().toISOString() }) {
  return function install(rawSpec, options = {}) {
    const spec = validateSpec({ ...rawSpec, tools: options.tools || rawSpec.tools });
    const tools = spec.tools.filter((tool) => TOOLS.includes(tool));
    const planned = new Map();
    const stage = (relative, content) => planned.set(normalize(relative), Buffer.from(content));
    const currentAgents = files.exists('AGENTS.md') ? files.read('AGENTS.md', 'utf8') : '';
    stage('AGENTS.md', mergeAgents(currentAgents, spec.agentsIntegration || templates.agentsContract()));
    stage('.agent/memory/project-context.md', projectContext(spec));
    stage('.agent/memory/squad-config.md', squadConfig(spec));
    stage('.agent/templates/_TEMPLATE-demanda.md', ticketTemplate());
    const roles = templates.roles();
    for (const [name, role] of Object.entries(roles)) stage(`.agent/subagents/${name}.md`, `${role.instructions}\n`);
    for (const tool of tools) emitters[tool](roles, stage);
    for (const [relative, content] of templates.skillFiles(SKILLS)) for (const tool of tools) stage(`.${tool}/skills/${relative}`, content);
    rejectSecrets(planned);
    const existingManifest = files.exists(MANIFEST_FILE) ? files.readJson(MANIFEST_FILE) : null;
    assertManagedFilesUnchanged(files, existingManifest);
    const changes = describeChanges(files, planned);
    if (options.dryRun) return { status: 'DRY-RUN', summary: `${changes.length} arquivo(s) seriam processados`, changes };
    const snapshot = snapshotFiles(files, planned);
    try {
      for (const [relative, content] of planned) files.write(relative, content);
      const manifestFiles = [...planned].map(([relative, content]) => ({ path: relative, hash: hash(content), created: !snapshot.get(relative).existed }));
      const backups = { ...(existingManifest?.backups || {}) };
      for (const [relative, value] of snapshot) if (value.existed && !existingManifest?.files?.some((item) => item.path === relative)) backups[relative] = value.content.toString('base64');
      const manifest = createManifest({ version, tools, project: spec.name, files: manifestFiles, backups, installedAt: now() });
      files.write(MANIFEST_FILE, Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`));
      return { status: 'OK', summary: `Squad ${version} instalada para ${tools.join(' + ')}`, changes };
    } catch (error) {
      restoreSnapshot(files, snapshot);
      throw new Error(`Instalacao revertida: ${error.message}`);
    }
  };
}

function rejectSecrets(planned) {
  const suspicious = /(BEGIN (RSA |OPENSSH )?PRIVATE KEY|(?:api[_-]?key|token|secret)\s*[=:]\s*['\"]?[A-Za-z0-9_\-]{16,})/i;
  for (const [relative, content] of planned) {
    if (/(^|\/)\.env(?:\.|$)|(^|\/)secrets?\//i.test(relative)) throw new Error(`Arquivo sensivel recusado: ${relative}`);
    if (suspicious.test(content.toString())) throw new Error(`Possivel segredo recusado em ${relative}`);
  }
}
function assertManagedFilesUnchanged(files, manifest) {
  for (const file of manifest?.files || []) if (file.path !== 'AGENTS.md' && files.exists(file.path) && hash(files.read(file.path)) !== file.hash) throw new Error(`Arquivo gerenciado possui customização local: ${file.path}. Preserve ou remova a customização antes de reinstalar.`);
}
function describeChanges(files, planned) {
  return [...planned].map(([relative, content]) => ({ action: !files.exists(relative) ? 'create' : hash(files.read(relative)) === hash(content) ? 'unchanged' : 'update', path: relative }));
}
function snapshotFiles(files, planned) { return new Map([...planned.keys()].map((relative) => [relative, { existed: files.exists(relative), content: files.exists(relative) ? files.read(relative) : null }])); }
function restoreSnapshot(files, snapshot) { for (const [relative, value] of snapshot) { if (value.existed) files.write(relative, value.content); else if (files.exists(relative)) files.remove(relative); } }
function normalize(relative) { return relative.replaceAll('\\', '/'); }

module.exports = { createInstallSquad, rejectSecrets, describeChanges, assertManagedFilesUnchanged, SKILLS };
