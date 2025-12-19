#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const distServer = path.join(__dirname, '..', 'dist', 'typescript', 'airtable-mcp-server.js');

if (!fs.existsSync(distServer)) {
  console.error('Airtable MCP: compiled server not found.');
  console.error('Run `npm install && npm run build` and try again.');
  process.exit(1);
}

const args = process.argv.slice(2);
const child = spawn(process.execPath, [distServer, ...args], {
  stdio: 'inherit',
  env: process.env,
});

child.on('close', (code) => process.exit(code));

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
