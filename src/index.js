#!/usr/bin/env node

/**
 * Airtable MCP Server - Main Entry Point
 * 
 * This file serves as the primary entry point for the Airtable MCP server.
 * It automatically selects the best available implementation based on the environment.
 */

const path = require('path');
const fs = require('fs');

// Check which implementation to use based on available files and environment
function getImplementation() {
  // Priority 1: TypeScript compiled version if available
  const distPath = path.join(__dirname, '../dist/typescript/airtable-mcp-server.js');
  if (fs.existsSync(distPath)) {
    return require(distPath);
  }

  // Priority 2: Production JavaScript version
  const productionPath = path.join(__dirname, 'javascript/airtable_simple_production.js');
  if (fs.existsSync(productionPath)) {
    return require(productionPath);
  }

  // Priority 3: Simple JavaScript version
  const simplePath = path.join(__dirname, 'javascript/airtable_simple.js');
  if (fs.existsSync(simplePath)) {
    return require(simplePath);
  }

  // If no implementation found, provide helpful error
  console.error('No Airtable MCP implementation found.');
  console.error('Please run "npm run build" to compile TypeScript sources.');
  process.exit(1);
}

// Start the server
const implementation = getImplementation();

// Export for use as a module
module.exports = implementation;

// Run if called directly
if (require.main === module) {
  console.log('Starting Airtable MCP Server...');
  if (typeof implementation.start === 'function') {
    implementation.start();
  } else {
    console.log('Server implementation loaded successfully.');
  }
}