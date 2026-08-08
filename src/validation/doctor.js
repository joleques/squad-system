'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { MANIFEST_FILE, ROLES, VERSION } = require('../core/constants');
const { hash } = require('../core/files');
const { REQUIRED_AGENTS_SECTIONS } = require('../installation/content');

const REQUIRED_SKILLS = ['triagem-demanda', 'plano-implementacao', 'quality', 'arquitetura', 'arquitetura-revisor', 'software-principles', 'software-principles-revisor'];

function doctor(project) {
  const checks = [];
  const manifestPath = path.join(project, MANIFEST_FILE);
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : null;
  checks.push(check('manifest', Boolean(manifest), manifest ? `versão ${manifest.version}` : 'ausente'));
  checks.push(check('node', Number(process.versions.node.split('.')[0]) >= 18, process.versions.node));
  checks.push(check('AGENTS.md', fs.existsSync(path.join(project, 'AGENTS.md'))));
  const agentsPath = path.join(project, 'AGENTS.md');
  if (fs.existsSync(agentsPath)) {
    const agents = fs.readFileSync(agentsPath, 'utf8');
    const missingSections = REQUIRED_AGENTS_SECTIONS.filter((section) => !agents.includes(section));
    checks.push(check('agents-contract', missingSections.length === 0, missingSections.length ? `${missingSections.length} seção(ões) ausente(s)` : 'completo'));
  }
  checks.push(check('project-context', fs.existsSync(path.join(project, '.agent/memory/project-context.md'))));
  checks.push(check('squad-config', fs.existsSync(path.join(project, '.agent/memory/squad-config.md'))));
  const configPath = path.join(project, '.agent/memory/squad-config.md');
  if (fs.existsSync(configPath)) {
    const config = fs.readFileSync(configPath, 'utf8');
    checks.push(check('test-command', /comando_teste:\*\*\s+`[^<][^`]*`/.test(config), 'comando executável configurado'));
  }
  if (manifest) {
    checks.push(check('version', manifest.version === VERSION, manifest.version));
    const drift = (manifest.files || []).filter((file) => {
      const absolute = path.join(project, file.path);
      return !fs.existsSync(absolute) || hash(fs.readFileSync(absolute)) !== file.hash;
    });
    checks.push(check('managed-files', drift.length === 0, drift.length ? `${drift.length} ausente(s) ou modificado(s)` : 'íntegros'));
    for (const role of ROLES) {
      checks.push(check(`canonical:${role}`, fs.existsSync(path.join(project, `.agent/subagents/${role}.md`))));
    }
    for (const tool of manifest.tools || []) {
      for (const role of ROLES) {
        const extension = tool === 'kiro' ? 'json' : 'toml';
        checks.push(check(`${tool}:${role}`, fs.existsSync(path.join(project, `.${tool}/agents/${role}.${extension}`))));
      }
      for (const skill of REQUIRED_SKILLS) {
        checks.push(check(`${tool}:skill:${skill}`, fs.existsSync(path.join(project, `.${tool}/skills/${skill}/SKILL.md`))));
      }
      if (tool === 'kiro') checks.push(check('kiro:test-hook', fs.existsSync(path.join(project, '.kiro/hooks/check-tests.sh'))));
    }
  }
  const ok = checks.every((item) => item.ok);
  return { ok, summary: ok ? 'Squad operacional' : 'Instalação incompleta ou inconsistente', checks };
}

function check(name, ok, detail = '') {
  return { name, ok: Boolean(ok), detail };
}

module.exports = { doctor };
