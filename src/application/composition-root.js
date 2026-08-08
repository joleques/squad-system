'use strict';

const { NodeProjectFiles } = require('../infra/filesystem/node-project-files');
const { FilesystemTemplateRepository } = require('../infra/templates/filesystem-template-repository');
const { emitKiro } = require('../infra/emitters/kiro-emitter');
const { emitCodex } = require('../infra/emitters/codex-emitter');
const { createInstallSquad } = require('../use_case/install-squad');
const { createUninstallSquad } = require('../use_case/uninstall-squad');
const { createInspectProject } = require('../use_case/inspect-project');
const { createDiagnoseInstallation } = require('../use_case/diagnose-installation');
const { VERSION } = require('../shared/constants');

function createApplication(project) {
  const files = new NodeProjectFiles(project);
  return {
    inspectProject: createInspectProject(files),
    install: createInstallSquad({ files, templates: new FilesystemTemplateRepository(), emitters: { kiro: emitKiro, codex: emitCodex }, version: VERSION }),
    uninstall: createUninstallSquad(files),
    doctor: createDiagnoseInstallation({ files, version: VERSION })
  };
}
module.exports = { createApplication };
