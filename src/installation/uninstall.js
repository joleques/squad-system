'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { MANIFEST_FILE } = require('../core/constants');
const { ensureDir, hash } = require('../core/files');

function uninstall(project, options = {}) {
  const manifestPath = path.join(project, MANIFEST_FILE);
  if (!fs.existsSync(manifestPath)) throw new Error('Squad não instalada: manifesto ausente');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const changes = [];
  for (const file of manifest.files || []) {
    const absolute = path.join(project, file.path);
    if (!fs.existsSync(absolute)) continue;
    if (hash(fs.readFileSync(absolute)) !== file.hash) {
      changes.push({ action: 'preserve-modified', path: file.path });
    } else if (manifest.backups?.[file.path]) {
      changes.push({ action: 'restore', path: file.path });
    } else {
      changes.push({ action: 'remove', path: file.path });
    }
  }
  if (options.dryRun) return { status: 'DRY-RUN', summary: `${changes.length} arquivo(s) seriam processados`, changes };
  const snapshot = new Map(changes.map((change) => {
    const absolute = path.join(project, change.path);
    return [change.path, fs.existsSync(absolute) ? fs.readFileSync(absolute) : null];
  }));
  try {
    for (const change of changes) {
      const absolute = path.join(project, change.path);
      if (change.action === 'restore') {
        ensureDir(path.dirname(absolute));
        fs.writeFileSync(absolute, Buffer.from(manifest.backups[change.path], 'base64'));
      } else if (change.action === 'remove') fs.unlinkSync(absolute);
    }
    fs.unlinkSync(manifestPath);
  } catch (error) {
    for (const [relative, content] of snapshot) {
      const absolute = path.join(project, relative);
      if (content === null && fs.existsSync(absolute)) fs.unlinkSync(absolute);
      else if (content !== null) {
        ensureDir(path.dirname(absolute));
        fs.writeFileSync(absolute, content);
      }
    }
    throw new Error(`Desinstalacao revertida: ${error.message}`);
  }
  return { status: 'OK', summary: 'Squad removida; arquivos modificados pelo usuário foram preservados', changes };
}

module.exports = { uninstall };
