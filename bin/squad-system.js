#!/usr/bin/env node
'use strict';

const { run } = require('../src/application/cli');

run(process.argv.slice(2)).catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
});
