'use strict';

module.exports = {
  VERSION: require('../../package.json').version,
  MANIFEST_FILE: '.squad-system/manifest.json',
  BEGIN_MARKER: '<!-- squad-system:start -->',
  END_MARKER: '<!-- squad-system:end -->',
  ROLES: ['service-lider', 'service-analista', 'service-dev', 'service-reviewer'],
  TOOLS: ['kiro', 'codex']
};
