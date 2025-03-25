#!/usr/bin/env node

const path = require('path');
const { execSync } = require('child_process');
const { spawn } = require('child_process');

// Polyfill for AbortController in older Node.js versions
if (typeof globalThis.AbortController === 'undefined') {
  globalThis.AbortController = class AbortController {
    constructor() {
      this.signal = {
        aborted: false,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true
      };
    }
    abort() {
      this.signal.aborted = true;
    }
  };
  console.log('ℹ️ Added AbortController polyfill for compatibility with older Node.js versions');
}

// Parse command-line arguments
const args = process.argv.slice(2);
let tokenIndex = args.indexOf('--token');
let baseIndex = args.indexOf('--base');
let configIndex = args.indexOf('--config');

// Extract token, base ID and config
const token = tokenIndex !== -1 && tokenIndex + 1 < args.length ? args[tokenIndex + 1] : null;
const baseId = baseIndex !== -1 && baseIndex + 1 < args.length ? args[baseIndex + 1] : null;
const config = configIndex !== -1 && configIndex + 1 < args.length ? args[configIndex + 1] : null;

console.log('🔌 Airtable MCP - Connecting your AI to Airtable');
console.log('-----------------------------------------------');

// Find Python interpreter
const getPythonPath = () => {
  try {
    const whichPython = execSync('which python3.10').toString().trim();
    return whichPython;
  } catch (e) {
    try {
      const whichPython = execSync('which python3').toString().trim();
      return whichPython;
    } catch (e) {
      return 'python';
    }
  }
};

// Check Python version
const checkPythonVersion = (pythonPath) => {
  try {
    const versionStr = execSync(`${pythonPath} --version`).toString().trim();
    const versionMatch = versionStr.match(/Python (\d+)\.(\d+)/);
    if (versionMatch) {
      const major = parseInt(versionMatch[1]);
      const minor = parseInt(versionMatch[2]);
      return (major > 3 || (major === 3 && minor >= 10));
    }
    return false;
  } catch (e) {
    return false;
  }
};

const pythonPath = getPythonPath();

// Verify Python compatibility
if (!checkPythonVersion(pythonPath)) {
  console.error('❌ Error: MCP SDK requires Python 3.10+');
  console.error('Please install Python 3.10 or newer and try again.');
  process.exit(1);
}

// We now use inspector_server.py instead of server.py
const serverScript = path.join(__dirname, 'inspector_server.py');

// Check if the script exists
try {
  require('fs').accessSync(serverScript, require('fs').constants.F_OK);
} catch (e) {
  console.error(`❌ Error: Could not find server script at ${serverScript}`);
  console.error('Please make sure you have the complete package installed.');
  process.exit(1);
}

// Prepare arguments for the Python script
const scriptArgs = [serverScript];
if (token) {
  scriptArgs.push('--token', token);
}
if (baseId) {
  scriptArgs.push('--base', baseId);
}
if (config) {
  scriptArgs.push('--config', config);
  
  // Try to extract and log info from config
  try {
    const configObj = JSON.parse(config);
    if (configObj.airtable_token) {
      console.log('✅ Using API token from config');
    }
    if (configObj.base_id) {
      console.log(`✅ Using base ID from config: ${configObj.base_id}`);
    }
  } catch (e) {
    console.warn('⚠️ Could not parse config JSON, attempting to sanitize...');
    
    // Sanitize config JSON - fix common formatting issues
    try {
      // Remove any unexpected line breaks, extra quotes, and escape characters
      const sanitizedConfig = config
        .replace(/[\r\n]+/g, '')
        .replace(/\\+"/g, '"')
        .replace(/^"/, '')
        .replace(/"$/, '')
        .replace(/\\/g, '');
      
      // Try parsing it
      const configObj = JSON.parse(sanitizedConfig);
      if (configObj) {
        console.log('✅ Successfully sanitized config JSON');
        // Update config with sanitized version
        scriptArgs[scriptArgs.indexOf(config)] = sanitizedConfig;
        config = sanitizedConfig;
        
        if (configObj.airtable_token) {
          console.log('✅ Using API token from sanitized config');
        }
        if (configObj.base_id) {
          console.log(`✅ Using base ID from sanitized config: ${configObj.base_id}`);
        }
      }
    } catch (sanitizeErr) {
      console.warn('⚠️ Could not sanitize config JSON, passing it directly to Python script');
    }
  }
} else {
  if (token) {
    console.log('✅ Using provided API token');
  } else {
    console.log('⚠️ No API token provided, will try to use .env file');
  }

  if (baseId) {
    console.log(`✅ Using base ID: ${baseId}`);
  } else {
    console.log('ℹ️ No base ID provided, will need to set one later');
  }
}

// Execute the Python script
const serverProcess = spawn(pythonPath, scriptArgs, {
  stdio: 'inherit',
});

// Handle process exit
serverProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Airtable MCP server exited with code ${code}`);
  }
  process.exit(code);
});

// Handle signals
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Airtable MCP server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down Airtable MCP server...');
  serverProcess.kill('SIGTERM');
}); 