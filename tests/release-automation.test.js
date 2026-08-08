'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');

test('Makefile oferece gates e releases SemVer com push atômico', () => {
  const makefile = fs.readFileSync(path.join(root, 'Makefile'), 'utf8');

  assert.match(makefile, /^test:/m);
  assert.match(makefile, /^pack:/m);
  assert.match(makefile, /^release-(patch|minor|major):/m);
  assert.match(makefile, /git status --porcelain/);
  assert.match(makefile, /npm version/);
  assert.match(makefile, /git push --atomic/);
});

test('workflow publica tags válidas por OIDC após todos os gates', () => {
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/publish.yml'), 'utf8');

  assert.match(workflow, /tags:\s*\n\s*- ['"]v\*['"]/);
  assert.match(workflow, /runs-on: ubuntu-latest/);
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /id-token: write/);
  assert.match(workflow, /actions\/checkout@v7/);
  assert.match(workflow, /actions\/setup-node@v7/);
  assert.match(workflow, /node-version: ['"]24['"]/);
  assert.match(workflow, /npm install --global npm@(?:\^|>=)?11\.5\.1/);
  assert.match(workflow, /npm ci[\s\S]*npm test[\s\S]*npm pack --dry-run[\s\S]*npm publish/);
  assert.doesNotMatch(workflow, /NPM_TOKEN|NODE_AUTH_TOKEN|secrets\./);
  assert.match(workflow, /\^v\(0\|\[1-9\]\[0-9\]\*\)\\\.\(0\|\[1-9\]\[0-9\]\*\)\\\.\(0\|\[1-9\]\[0-9\]\*\)\$/);
});

for (const [level, expected] of [['patch', '1.0.2'], ['minor', '1.1.0'], ['major', '2.0.0']]) {
  test(`release-${level} cria commit e tag e envia ambos atomicamente`, () => {
    const fixture = createGitFixture();

    run('make', [`release-${level}`, 'TEST_COMMAND=true', 'PACK_COMMAND=true'], fixture.work);

    assert.equal(readVersion(fixture.work), expected);
    assert.equal(run('git', ['tag', '--points-at', 'HEAD'], fixture.work).trim(), `v${expected}`);
    assert.equal(run('git', ['--git-dir', fixture.remote, 'tag', '--points-at', 'refs/heads/main']).trim(), `v${expected}`);
  });
}

test('release falha antes de alterar versão quando a árvore Git está suja', () => {
  const fixture = createGitFixture();
  fs.writeFileSync(path.join(fixture.work, 'pending.txt'), 'mudança pendente\n');

  const result = spawnSync('make', ['release-patch', 'TEST_COMMAND=true', 'PACK_COMMAND=true'], {
    cwd: fixture.work,
    encoding: 'utf8'
  });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}${result.stderr}`, /árvore Git.*limpa/i);
  assert.equal(readVersion(fixture.work), '1.0.1');
});

function createGitFixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'squad-release-'));
  const work = path.join(directory, 'work');
  const remote = path.join(directory, 'remote.git');
  fs.mkdirSync(work);
  fs.copyFileSync(path.join(root, 'Makefile'), path.join(work, 'Makefile'));
  fs.writeFileSync(path.join(work, 'package.json'), JSON.stringify({ name: 'fixture', version: '1.0.1' }, null, 2) + '\n');
  fs.writeFileSync(path.join(work, 'package-lock.json'), JSON.stringify({ name: 'fixture', version: '1.0.1', lockfileVersion: 3, requires: true, packages: { '': { name: 'fixture', version: '1.0.1' } } }, null, 2) + '\n');
  run('git', ['init', '--bare', remote], directory);
  run('git', ['init'], work);
  run('git', ['checkout', '-b', 'main'], work);
  run('git', ['config', 'user.name', 'Release Test'], work);
  run('git', ['config', 'user.email', 'release@example.test'], work);
  run('git', ['remote', 'add', 'origin', remote], work);
  run('git', ['add', '.'], work);
  run('git', ['commit', '-m', 'initial'], work);
  run('git', ['push', '-u', 'origin', 'main'], work);
  return { work, remote };
}

function readVersion(directory) {
  return JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8')).version;
}

function run(command, args, cwd) {
  return execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}
