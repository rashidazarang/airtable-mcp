#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Find the Python interpreter
const getPythonPath = () => {
  try {
    const whichPython = require('child_process').execSync('which python3.10').toString().trim();
    return whichPython;
  } catch (e) {
    try {
      const whichPython = require('child_process').execSync('which python3').toString().trim();
      return whichPython;
    } catch (e) {
      return 'python';
    }
  }
};

const pythonPath = getPythonPath();
const serverScript = path.join(__dirname, '..', 'airtable_mcp', 'src', 'server.py');

// Get the arguments
const args = process.argv.slice(2);

// Construct the full command
const serverProcess = spawn(pythonPath, [serverScript, ...args], {
  stdio: 'inherit',
});

// Handle process exit
serverProcess.on('close', (code) => {
  process.exit(code);
});

// Handle signals
process.on('SIGINT', () => {
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  serverProcess.kill('SIGTERM');
}); 