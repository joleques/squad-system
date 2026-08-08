'use strict';

const fs = require('node:fs');
const path = require('node:path');

function inspectProject(project) {
  const packageFile = path.join(project, 'package.json');
  const packageJson = fs.existsSync(packageFile) ? JSON.parse(fs.readFileSync(packageFile, 'utf8')) : null;
  const detectedTools = [];
  if (fs.existsSync(path.join(project, '.kiro'))) detectedTools.push('kiro');
  if (fs.existsSync(path.join(project, '.codex'))) detectedTools.push('codex');
  return {
    project: path.resolve(project),
    name: packageJson?.name || path.basename(path.resolve(project)),
    stack: detectStack(project, packageJson),
    testCommand: packageJson?.scripts?.test ? 'npm test' : null,
    agentsFile: fs.existsSync(path.join(project, 'AGENTS.md')) ? 'existing' : 'missing',
    projectContext: fs.existsSync(path.join(project, '.agent/memory/project-context.md')) ? 'existing' : 'missing',
    detectedTools,
    ignoredSensitiveFiles: ['.env', '.env.*', '**/secrets/**'],
    agentInstructions: 'Analise semanticamente o AGENTS.md existente e produza um install spec. Preserve regras locais e reporte conflitos materiais.'
  };
}

function detectStack(project, packageJson) {
  if (packageJson) return packageJson.devDependencies?.typescript || packageJson.dependencies?.typescript ? 'typescript-node' : 'node';
  if (fs.existsSync(path.join(project, 'go.mod'))) return 'go';
  if (fs.existsSync(path.join(project, 'pom.xml')) || fs.existsSync(path.join(project, 'build.gradle'))) return 'java';
  if (fs.existsSync(path.join(project, 'pyproject.toml')) || fs.existsSync(path.join(project, 'requirements.txt'))) return 'python';
  return 'unknown';
}

module.exports = { inspectProject, detectStack };
