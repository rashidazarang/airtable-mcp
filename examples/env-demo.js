#!/usr/bin/env node

/**
 * Demo script that uses the AIRTABLE_BASE_ID from the .env file
 * Demonstrates various operations with the Airtable API
 */

require('dotenv').config();
const baseUtils = require('../tools/airtable-base');
const crudUtils = require('../tools/airtable-crud');
const schemaUtils = require('../tools/airtable-schema');

// Constants
const DEMO_TABLE_NAME = 'ENV Demo Table';
const SAMPLE_RECORDS = [
  { Name: 'Record from ENV Demo', Description: 'Created using AIRTABLE_BASE_ID from .env file', Status: 'Active' },
  { Name: 'Another ENV Record', Description: 'Second record from the environment demo', Status: 'Pending' }
];

async function runDemo() {
  console.log('=================================');
  console.log('     AIRTABLE ENV DEMO SCRIPT    ');
  console.log('=================================');
  
  // Check environment variables
  if (!process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN) {
    console.error('❌ Error: AIRTABLE_PERSONAL_ACCESS_TOKEN is not set in .env file');
    process.exit(1);
  }
  
  if (!process.env.AIRTABLE_BASE_ID) {
    console.error('❌ Error: AIRTABLE_BASE_ID is not set in .env file');
    process.exit(1);
  }
  
  const baseId = process.env.AIRTABLE_BASE_ID;
  console.log(`✅ Using AIRTABLE_BASE_ID: ${baseId}`);
  
  try {
    // Step 1: Verify base access
    console.log('\nStep 1: Verifying access to the base...');
    const baseAccess = await baseUtils.checkBaseAccess(baseId);
    
    if (!baseAccess.accessible) {
      console.error(`❌ Error: Cannot access base with ID ${baseId}`);
      console.error(`   Reason: ${baseAccess.error}`);
      process.exit(1);
    }
    
    console.log(`✅ Access confirmed to base: ${baseAccess.name}`);
    
    // Step 2: List existing tables
    console.log('\nStep 2: Listing existing tables...');
    const tables = await baseUtils.listTables(baseId);
    console.log(`✅ Found ${tables.length} tables in the base`);
    
    // Step 3: Check if our demo table exists
    console.log('\nStep 3: Checking if demo table exists...');
    const demoTableExists = await crudUtils.tableExists(baseId, DEMO_TABLE_NAME);
    
    if (demoTableExists) {
      console.log(`✅ Demo table "${DEMO_TABLE_NAME}" already exists`);
    } else {
      console.log(`ℹ️ Demo table "${DEMO_TABLE_NAME}" does not exist, creating it...`);
      
      // Step 4: Create the demo table
      console.log('\nStep 4: Creating the demo table...');
      const tableConfig = {
        name: DEMO_TABLE_NAME,
        description: 'Table created from the Environment Demo script',
        fields: [
          {
            name: 'Name',
            type: 'singleLineText',
            description: 'Record name'
          },
          {
            name: 'Description',
            type: 'multilineText',
            description: 'Record description'
          },
          {
            name: 'Status',
            type: 'singleSelect',
            options: {
              choices: [
                { name: 'Active' },
                { name: 'Pending' },
                { name: 'Completed' }
              ]
            },
            description: 'Current status'
          },
          {
            name: 'Created',
            type: 'date',
            options: {
              dateFormat: {
                name: 'local'
              }
            },
            description: 'Creation date'
          }
        ]
      };
      
      await schemaUtils.createTable(baseId, tableConfig);
      console.log(`✅ Created demo table: ${DEMO_TABLE_NAME}`);
    }
    
    // Step 5: Create sample records
    console.log('\nStep 5: Creating sample records...');
    // Add today's date to all records
    const recordsWithDate = SAMPLE_RECORDS.map(record => ({
      ...record,
      Created: new Date().toISOString().split('T')[0] // Format as YYYY-MM-DD
    }));
    
    const createdRecords = await crudUtils.createRecords(baseId, DEMO_TABLE_NAME, recordsWithDate);
    console.log(`✅ Created ${createdRecords.length} sample records`);
    
    // Step 6: Read records back
    console.log('\nStep 6: Reading records from the table...');
    const records = await crudUtils.readRecords(baseId, DEMO_TABLE_NAME, 100);
    console.log(`✅ Read ${records.length} records from the table`);
    
    console.log('\nSample record:');
    console.log(JSON.stringify(records[0], null, 2));
    
    // Step 7: Update a record
    console.log('\nStep 7: Updating the first record...');
    const recordToUpdate = {
      id: createdRecords[0].id,
      fields: {
        Description: createdRecords[0].Description + ' (UPDATED)',
        Status: 'Completed'
      }
    };
    
    const updatedRecords = await crudUtils.updateRecords(baseId, DEMO_TABLE_NAME, [recordToUpdate]);
    console.log(`✅ Updated ${updatedRecords.length} record`);
    
    // Step 8: Get the updated record
    console.log('\nStep 8: Getting the updated record...');
    const updatedRecord = await crudUtils.getRecord(baseId, DEMO_TABLE_NAME, createdRecords[0].id);
    console.log('Updated record:');
    console.log(JSON.stringify(updatedRecord, null, 2));
    
    // Step 9: Demonstrate filtering records
    console.log('\nStep 9: Filtering records by status...');
    const completedRecords = await crudUtils.readRecords(baseId, DEMO_TABLE_NAME, 100, 'Status="Completed"');
    console.log(`✅ Found ${completedRecords.length} records with Status="Completed"`);
    
    console.log('\n=================================');
    console.log('      ENV DEMO COMPLETED         ');
    console.log('=================================');
    console.log('\nThis script demonstrated:');
    console.log('1. Loading environment variables from .env file');
    console.log('2. Accessing an Airtable base using AIRTABLE_BASE_ID');
    console.log('3. Creating a table (if it doesn\'t exist)');
    console.log('4. Creating, reading, and updating records');
    console.log('5. Filtering records using Airtable formulas');
    console.log('\nAll operations used the AIRTABLE_BASE_ID environment variable');
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the demo
runDemo(); 