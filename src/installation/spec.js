'use strict';

const { TOOLS } = require('../core/constants');
const { REQUIRED_AGENTS_SECTIONS } = require('./content');

function validateSpec(spec) {
  const requiredText = ['name', 'description', 'purpose', 'users', 'domain', 'stage'];
  for (const field of requiredText) {
    if (!spec[field] || String(spec[field]).trim().length < 3) throw new Error(`spec.${field} obrigatorio e deve ser detalhado`);
  }
  if (!spec.stack) throw new Error('spec.stack obrigatorio');
  if (!spec.testCommand) throw new Error('spec.testCommand obrigatorio');
  const tools = spec.tools || [];
  if (!tools.length || tools.some((tool) => !TOOLS.includes(tool))) throw new Error('spec.tools deve conter kiro, codex ou ambos');
  if (spec.agentsIntegration && (!spec.agentsIntegration.includes('<!-- squad-system:start -->') || !spec.agentsIntegration.includes('<!-- squad-system:end -->'))) {
    throw new Error('spec.agentsIntegration deve conter os marcadores gerenciados da squad');
  }
  if (spec.agentsIntegration) {
    const missing = REQUIRED_AGENTS_SECTIONS.filter((section) => !spec.agentsIntegration.includes(section));
    if (missing.length) throw new Error(`spec.agentsIntegration remove seções obrigatórias: ${missing.join(', ')}`);
  }
  return spec;
}

module.exports = { validateSpec };
