'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function writeFile(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content);
}

function hash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function listFiles(directory, base = directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(absolute, base) : [path.relative(base, absolute)];
  });
}

function copyTree(source, target) {
  for (const relative of listFiles(source)) {
    const content = fs.readFileSync(path.join(source, relative));
    writeFile(path.join(target, relative), content);
  }
}

module.exports = { readJson, ensureDir, writeFile, hash, listFiles, copyTree };
