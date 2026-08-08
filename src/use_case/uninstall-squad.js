'use strict';

const { MANIFEST_FILE } = require('../shared/constants');
const { hash } = require('../shared/hash');

function createUninstallSquad(files) {
  return function uninstall(options = {}) {
    if (!files.exists(MANIFEST_FILE)) throw new Error('Squad não instalada: manifesto ausente');
    const manifest = files.readJson(MANIFEST_FILE);
    const changes = [];
    for (const file of manifest.files || []) {
      if (!files.exists(file.path)) continue;
      changes.push({ action: hash(files.read(file.path)) !== file.hash ? 'preserve-modified' : manifest.backups?.[file.path] ? 'restore' : 'remove', path: file.path });
    }
    if (options.dryRun) return { status: 'DRY-RUN', summary: `${changes.length} arquivo(s) seriam processados`, changes };
    const snapshot = new Map(changes.map(({ path }) => [path, files.exists(path) ? files.read(path) : null]));
    try {
      for (const change of changes) {
        if (change.action === 'restore') files.write(change.path, Buffer.from(manifest.backups[change.path], 'base64'));
        else if (change.action === 'remove') files.remove(change.path);
      }
      files.remove(MANIFEST_FILE);
    } catch (error) {
      for (const [relative, content] of snapshot) { if (content === null && files.exists(relative)) files.remove(relative); else if (content !== null) files.write(relative, content); }
      throw new Error(`Desinstalacao revertida: ${error.message}`);
    }
    return { status: 'OK', summary: 'Squad removida; arquivos modificados pelo usuário foram preservados', changes };
  };
}
module.exports = { createUninstallSquad };
