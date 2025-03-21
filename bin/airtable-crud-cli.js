#!/usr/bin/env node

/**
 * Command-line interface for Airtable CRUD operations
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const baseUtils = require('../tools/airtable-base');
const crudUtils = require('../tools/airtable-crud');
const schemaUtils = require('../tools/airtable-schema');

// Load environment variables
dotenv.config();

// Get the base ID from environment variables
const baseId = process.env.AIRTABLE_BASE_ID;
if (!baseId) {
  console.error('Error: AIRTABLE_BASE_ID not set in .env file');
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Display help if no command is provided
if (!command) {
  showHelp();
  process.exit(0);
}

// Process the command
processCommand(command, args.slice(1))
  .then(() => {
    console.log('Command completed successfully');
  })
  .catch(error => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });

/**
 * Process the command
 * @param {string} command - The command to process
 * @param {Array} args - The command arguments
 */
async function processCommand(command, args) {
  switch (command) {
    case 'list-bases':
      await listBases();
      break;
    
    case 'list-tables':
      await listTables();
      break;
    
    case 'list-records':
      await listRecords(args);
      break;
    
    case 'get-record':
      await getRecord(args);
      break;
    
    case 'create-records':
      await createRecords(args);
      break;
    
    case 'update-records':
      await updateRecords(args);
      break;
    
    case 'delete-records':
      await deleteRecords(args);
      break;
    
    case 'export-records':
      await exportRecords(args);
      break;
    
    case 'import-records':
      await importRecords(args);
      break;
    
    case 'help':
      showHelp();
      break;
    
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

/**
 * List all accessible bases
 */
async function listBases() {
  console.log('Listing accessible bases...');
  const bases = await baseUtils.listAllBases();
  
  console.log(`Found ${bases.length} accessible bases:`);
  bases.forEach(base => {
    console.log(`- ${base.name} (${base.id})`);
  });
}

/**
 * List all tables in the base
 */
async function listTables() {
  console.log(`Listing tables in base ${baseId}...`);
  const tables = await baseUtils.listTables(baseId);
  
  console.log(`Found ${tables.length} tables:`);
  tables.forEach(table => {
    console.log(`- ${table.name} (${table.id})`);
  });
}

/**
 * List records from a table
 * @param {Array} args - Command arguments
 */
async function listRecords(args) {
  if (args.length < 1) {
    console.error('Error: Table name is required');
    console.log('Usage: node airtable-crud-cli.js list-records <tableName> [maxRecords] [filterFormula]');
    process.exit(1);
  }
  
  const tableName = args[0];
  const maxRecords = args[1] ? parseInt(args[1]) : 100;
  const filterFormula = args[2] || null;
  
  console.log(`Listing records from table "${tableName}"...`);
  console.log(`Max records: ${maxRecords}`);
  if (filterFormula) {
    console.log(`Filter: ${filterFormula}`);
  }
  
  const records = await crudUtils.readRecords(baseId, tableName, maxRecords, filterFormula);
  
  console.log(`Found ${records.length} records:`);
  records.forEach(record => {
    console.log(`- ${record.id}: ${JSON.stringify(record)}`);
  });
}

/**
 * Get a specific record by ID
 * @param {Array} args - Command arguments
 */
async function getRecord(args) {
  if (args.length < 2) {
    console.error('Error: Table name and record ID are required');
    console.log('Usage: node airtable-crud-cli.js get-record <tableName> <recordId>');
    process.exit(1);
  }
  
  const tableName = args[0];
  const recordId = args[1];
  
  console.log(`Getting record ${recordId} from table "${tableName}"...`);
  
  const record = await crudUtils.getRecord(baseId, tableName, recordId);
  
  console.log('Record:');
  console.log(JSON.stringify(record, null, 2));
}

/**
 * Create records in a table
 * @param {Array} args - Command arguments
 */
async function createRecords(args) {
  if (args.length < 2) {
    console.error('Error: Table name and JSON file are required');
    console.log('Usage: node airtable-crud-cli.js create-records <tableName> <jsonFile>');
    process.exit(1);
  }
  
  const tableName = args[0];
  const jsonFile = args[1];
  
  // Read the JSON file
  let records;
  try {
    const jsonData = fs.readFileSync(jsonFile, 'utf8');
    records = JSON.parse(jsonData);
    
    if (!Array.isArray(records)) {
      console.error('Error: JSON file must contain an array of records');
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error reading JSON file: ${error.message}`);
    process.exit(1);
  }
  
  console.log(`Creating ${records.length} records in table "${tableName}"...`);
  
  const createdRecords = await crudUtils.createRecords(baseId, tableName, records);
  
  console.log(`Created ${createdRecords.length} records`);
  console.log('First record:');
  console.log(JSON.stringify(createdRecords[0], null, 2));
}

/**
 * Update records in a table
 * @param {Array} args - Command arguments
 */
async function updateRecords(args) {
  if (args.length < 2) {
    console.error('Error: Table name and JSON file are required');
    console.log('Usage: node airtable-crud-cli.js update-records <tableName> <jsonFile>');
    process.exit(1);
  }
  
  const tableName = args[0];
  const jsonFile = args[1];
  
  // Read the JSON file
  let records;
  try {
    const jsonData = fs.readFileSync(jsonFile, 'utf8');
    records = JSON.parse(jsonData);
    
    if (!Array.isArray(records)) {
      console.error('Error: JSON file must contain an array of records');
      process.exit(1);
    }
    
    // Check if records have id and fields
    for (const record of records) {
      if (!record.id) {
        console.error('Error: Each record must have an id field');
        process.exit(1);
      }
      
      if (!record.fields || typeof record.fields !== 'object') {
        console.error('Error: Each record must have a fields object');
        process.exit(1);
      }
    }
  } catch (error) {
    console.error(`Error reading JSON file: ${error.message}`);
    process.exit(1);
  }
  
  console.log(`Updating ${records.length} records in table "${tableName}"...`);
  
  const updatedRecords = await crudUtils.updateRecords(baseId, tableName, records);
  
  console.log(`Updated ${updatedRecords.length} records`);
  console.log('First record:');
  console.log(JSON.stringify(updatedRecords[0], null, 2));
}

/**
 * Delete records from a table
 * @param {Array} args - Command arguments
 */
async function deleteRecords(args) {
  if (args.length < 2) {
    console.error('Error: Table name and record IDs are required');
    console.log('Usage: node airtable-crud-cli.js delete-records <tableName> <recordId1,recordId2,...>');
    process.exit(1);
  }
  
  const tableName = args[0];
  const recordIds = args[1].split(',');
  
  console.log(`Deleting ${recordIds.length} records from table "${tableName}"...`);
  
  const deletedRecords = await crudUtils.deleteRecords(baseId, tableName, recordIds);
  
  console.log(`Deleted ${deletedRecords.length} records`);
}

/**
 * Export records from a table to a JSON file
 * @param {Array} args - Command arguments
 */
async function exportRecords(args) {
  if (args.length < 2) {
    console.error('Error: Table name and output file are required');
    console.log('Usage: node airtable-crud-cli.js export-records <tableName> <outputFile> [maxRecords] [filterFormula]');
    process.exit(1);
  }
  
  const tableName = args[0];
  const outputFile = args[1];
  const maxRecords = args[2] ? parseInt(args[2]) : 100;
  const filterFormula = args[3] || null;
  
  console.log(`Exporting records from table "${tableName}" to ${outputFile}...`);
  console.log(`Max records: ${maxRecords}`);
  if (filterFormula) {
    console.log(`Filter: ${filterFormula}`);
  }
  
  const records = await crudUtils.readRecords(baseId, tableName, maxRecords, filterFormula);
  
  // Write records to file
  try {
    fs.writeFileSync(outputFile, JSON.stringify(records, null, 2));
    console.log(`Exported ${records.length} records to ${outputFile}`);
  } catch (error) {
    console.error(`Error writing to file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Import records from a JSON file to a table
 * @param {Array} args - Command arguments
 */
async function importRecords(args) {
  if (args.length < 2) {
    console.error('Error: Table name and input file are required');
    console.log('Usage: node airtable-crud-cli.js import-records <tableName> <inputFile> [--update] [--clear]');
    process.exit(1);
  }
  
  const tableName = args[0];
  const inputFile = args[1];
  const update = args.includes('--update');
  const clear = args.includes('--clear');
  
  // Read the JSON file
  let records;
  try {
    const jsonData = fs.readFileSync(inputFile, 'utf8');
    records = JSON.parse(jsonData);
    
    if (!Array.isArray(records)) {
      console.error('Error: JSON file must contain an array of records');
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error reading JSON file: ${error.message}`);
    process.exit(1);
  }
  
  console.log(`Importing ${records.length} records to table "${tableName}"...`);
  
  // Clear the table if requested
  if (clear) {
    console.log('Clearing existing records...');
    const existingRecords = await crudUtils.readRecords(baseId, tableName, 100000);
    
    if (existingRecords.length > 0) {
      const recordIds = existingRecords.map(record => record.id);
      await crudUtils.deleteRecords(baseId, tableName, recordIds);
      console.log(`Deleted ${existingRecords.length} existing records`);
    }
  }
  
  // Update existing records if requested
  if (update) {
    console.log('Updating existing records...');
    
    // Get existing records
    const existingRecords = await crudUtils.readRecords(baseId, tableName, 100000);
    const existingRecordsMap = {};
    
    // Create a map of existing records by a key field (assuming 'Name' is the key)
    existingRecords.forEach(record => {
      if (record.Name) {
        existingRecordsMap[record.Name] = record;
      }
    });
    
    // Separate records to update and create
    const recordsToUpdate = [];
    const recordsToCreate = [];
    
    records.forEach(record => {
      if (record.Name && existingRecordsMap[record.Name]) {
        // Record exists, update it
        recordsToUpdate.push({
          id: existingRecordsMap[record.Name].id,
          fields: record
        });
      } else {
        // Record doesn't exist, create it
        recordsToCreate.push(record);
      }
    });
    
    // Update existing records
    if (recordsToUpdate.length > 0) {
      const updatedRecords = await crudUtils.updateRecords(baseId, tableName, recordsToUpdate);
      console.log(`Updated ${updatedRecords.length} existing records`);
    }
    
    // Create new records
    if (recordsToCreate.length > 0) {
      const createdRecords = await crudUtils.createRecords(baseId, tableName, recordsToCreate);
      console.log(`Created ${createdRecords.length} new records`);
    }
  } else {
    // Create all records
    const createdRecords = await crudUtils.createRecords(baseId, tableName, records);
    console.log(`Created ${createdRecords.length} records`);
  }
}

/**
 * Show help
 */
function showHelp() {
  console.log('Airtable CRUD CLI');
  console.log('================');
  console.log('');
  console.log('Usage: node airtable-crud-cli.js <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  list-bases                                  List all accessible bases');
  console.log('  list-tables                                 List all tables in the base');
  console.log('  list-records <tableName> [max] [filter]     List records from a table');
  console.log('  get-record <tableName> <recordId>           Get a specific record');
  console.log('  create-records <tableName> <jsonFile>       Create records from a JSON file');
  console.log('  update-records <tableName> <jsonFile>       Update records from a JSON file');
  console.log('  delete-records <tableName> <id1,id2,...>    Delete records from a table');
  console.log('  export-records <tableName> <file> [max]     Export records to a JSON file');
  console.log('  import-records <tableName> <file> [flags]   Import records from a JSON file');
  console.log('  help                                        Show this help');
  console.log('');
  console.log('Flags for import-records:');
  console.log('  --update    Update existing records (match by Name field)');
  console.log('  --clear     Clear all existing records before import');
  console.log('');
  console.log('Examples:');
  console.log('  node airtable-crud-cli.js list-tables');
  console.log('  node airtable-crud-cli.js list-records "My Table" 10');
  console.log('  node airtable-crud-cli.js get-record "My Table" rec123456');
  console.log('  node airtable-crud-cli.js create-records "My Table" data.json');
  console.log('  node airtable-crud-cli.js export-records "My Table" export.json 1000');
  console.log('  node airtable-crud-cli.js import-records "My Table" import.json --update');
} 