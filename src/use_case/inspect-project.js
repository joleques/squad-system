'use strict';

function createInspectProject(files) {
  return function inspectProject() {
    const packageJson = files.exists('package.json') ? files.readJson('package.json') : null;
    return {
      project: files.absolute(), name: packageJson?.name || files.basename(), stack: detectStack(files, packageJson),
      testCommand: packageJson?.scripts?.test ? 'npm test' : null,
      agentsFile: files.exists('AGENTS.md') ? 'existing' : 'missing',
      projectContext: files.exists('.agent/memory/project-context.md') ? 'existing' : 'missing',
      detectedTools: ['kiro', 'codex'].filter((tool) => files.exists(`.${tool}`)),
      ignoredSensitiveFiles: ['.env', '.env.*', '**/secrets/**'],
      agentInstructions: 'Analise semanticamente o AGENTS.md existente e produza um install spec. Preserve regras locais e reporte conflitos materiais.'
    };
  };
}
function detectStack(files, packageJson) {
  if (packageJson) return packageJson.devDependencies?.typescript || packageJson.dependencies?.typescript ? 'typescript-node' : 'node';
  if (files.exists('go.mod')) return 'go';
  if (files.exists('pom.xml') || files.exists('build.gradle')) return 'java';
  if (files.exists('pyproject.toml') || files.exists('requirements.txt')) return 'python';
  return 'unknown';
}
module.exports = { createInspectProject, detectStack };
