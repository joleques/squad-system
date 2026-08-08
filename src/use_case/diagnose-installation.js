'use strict';

const { MANIFEST_FILE, ROLES } = require('../shared/constants');
const { REQUIRED_AGENTS_SECTIONS } = require('../domain/squad-contract');
const { hash } = require('../shared/hash');
const REQUIRED_SKILLS = ['triagem-demanda', 'plano-implementacao', 'quality', 'arquitetura', 'arquitetura-revisor', 'software-principles', 'software-principles-revisor'];

function createDiagnoseInstallation({ files, version, nodeVersion = process.versions.node }) {
  return function doctor() {
    const checks = [];
    const manifest = files.exists(MANIFEST_FILE) ? files.readJson(MANIFEST_FILE) : null;
    checks.push(check('manifest', Boolean(manifest), manifest ? `versão ${manifest.version}` : 'ausente'));
    checks.push(check('node', Number(nodeVersion.split('.')[0]) >= 18, nodeVersion));
    checks.push(check('AGENTS.md', files.exists('AGENTS.md')));
    if (files.exists('AGENTS.md')) {
      const agents = files.read('AGENTS.md', 'utf8');
      const missing = REQUIRED_AGENTS_SECTIONS.filter((section) => !agents.includes(section));
      checks.push(check('agents-contract', missing.length === 0, missing.length ? `${missing.length} seção(ões) ausente(s)` : 'completo'));
    }
    checks.push(check('project-context', files.exists('.agent/memory/project-context.md')));
    checks.push(check('squad-config', files.exists('.agent/memory/squad-config.md')));
    if (files.exists('.agent/memory/squad-config.md')) checks.push(check('test-command', /comando_teste:\*\*\s+`[^<][^`]*`/.test(files.read('.agent/memory/squad-config.md', 'utf8')), 'comando executável configurado'));
    if (manifest) {
      checks.push(check('version', manifest.version === version, manifest.version));
      const drift = (manifest.files || []).filter((file) => !files.exists(file.path) || hash(files.read(file.path)) !== file.hash);
      checks.push(check('managed-files', drift.length === 0, drift.length ? `${drift.length} ausente(s) ou modificado(s)` : 'íntegros'));
      for (const role of ROLES) checks.push(check(`canonical:${role}`, files.exists(`.agent/subagents/${role}.md`)));
      for (const tool of manifest.tools || []) {
        for (const role of ROLES) checks.push(check(`${tool}:${role}`, files.exists(`.${tool}/agents/${role}.${tool === 'kiro' ? 'json' : 'toml'}`)));
        for (const skill of REQUIRED_SKILLS) checks.push(check(`${tool}:skill:${skill}`, files.exists(`.${tool}/skills/${skill}/SKILL.md`)));
        if (tool === 'kiro') checks.push(check('kiro:test-hook', files.exists('.kiro/hooks/check-tests.sh')));
      }
    }
    const ok = checks.every((item) => item.ok);
    return { ok, summary: ok ? 'Squad operacional' : 'Instalação incompleta ou inconsistente', checks };
  };
}
function check(name, ok, detail = '') { return { name, ok: Boolean(ok), detail }; }
module.exports = { createDiagnoseInstallation };
