'use strict';

function createManifest({ version, tools, project, files, backups, installedAt }) {
  return { schemaVersion: 1, version, installedAt, tools, project, files, backups };
}

module.exports = { createManifest };
