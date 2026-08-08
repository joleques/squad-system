'use strict';

const fs = require('node:fs');
const path = require('node:path');

class NodeProjectFiles {
  constructor(root) { this.root = path.resolve(root); }
  resolve(relative = '.') {
    const absolute = path.resolve(this.root, relative);
    if (absolute !== this.root && !absolute.startsWith(`${this.root}${path.sep}`)) throw new Error(`Caminho fora do projeto: ${relative}`);
    return absolute;
  }
  exists(relative) { return fs.existsSync(this.resolve(relative)); }
  read(relative, encoding) { return fs.readFileSync(this.resolve(relative), encoding); }
  readJson(relative) { return JSON.parse(this.read(relative, 'utf8')); }
  write(relative, content) { const file = this.resolve(relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); }
  remove(relative) { fs.unlinkSync(this.resolve(relative)); }
  basename() { return path.basename(this.root); }
  absolute() { return this.root; }
}

module.exports = { NodeProjectFiles };
