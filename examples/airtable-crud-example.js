/**
 * Example script demonstrating how to use the Airtable CRUD utilities
 */
const dotenv = require('dotenv');
const baseUtils = require('../tools/airtable-base');
const crudUtils = require('../tools/airtable-crud');
const schemaUtils = require('../tools/airtable-schema');

// Load environment variables
dotenv.config();

// Configuration
const EXAMPLE_TABLE_NAME = 'Example Tasks';
const EXAMPLE_RECORDS = [
  { 
    Name: 'Complete project documentation', 
    Description: 'Write comprehensive documentation for the project', 
    Status: 'Not Started', 
    Priority: 'High',
    DueDate: '2023-12-31'
  },
  { 
    Name: 'Fix login bug', 
    Description: 'Users are experiencing issues with the login process', 
    Status: 'In Progress', 
    Priority: 'Critical',
    DueDate: '2023-11-15'
  },
  { 
    Name: 'Add new feature', 
    Description: 'Implement the new feature requested by the client', 
    Status: 'Not Started', 
    Priority: 'Medium',
    DueDate: '2024-01-15'
  }
];

/**
 * Main function to run the example
 */
async function runExample() {
  console.log('Starting Airtable CRUD Example...\n');
  
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!baseId) {
    console.error('AIRTABLE_BASE_ID not set in .env file');
    process.exit(1);
  }
  
  try {
    // Step 1: Check if we have access to the base
    console.log('Step 1: Checking base access...');
    const bases = await baseUtils.listAllBases();
    const hasAccess = bases.some(base => base.id === baseId);
    
    if (!hasAccess) {
      throw new Error(`No access to base with ID: ${baseId}`);
    }
    
    console.log(`✅ Access confirmed to base: ${baseId}\n`);
    
    // Step 2: List existing tables
    console.log('Step 2: Listing existing tables...');
    const tables = await baseUtils.listTables(baseId);
    console.log(`Found ${tables.length} tables in the base:`);
    tables.forEach(table => console.log(`- ${table.name}`));
    console.log();
    
    // Step 3: Check if our example table exists
    console.log('Step 3: Checking if example table exists...');
    let tableExists = await crudUtils.tableExists(baseId, EXAMPLE_TABLE_NAME);
    
    if (tableExists) {
      console.log(`Table "${EXAMPLE_TABLE_NAME}" already exists\n`);
    } else {
      console.log(`Table "${EXAMPLE_TABLE_NAME}" does not exist, creating it...\n`);
      
      // Step 4: Create the example table
      console.log('Step 4: Creating example table...');
      const tableConfig = {
        name: EXAMPLE_TABLE_NAME,
        description: 'Example table for demonstrating CRUD operations',
        fields: [
          {
            name: 'Name',
            type: 'singleLineText',
            description: 'Task name'
          },
          {
            name: 'Description',
            type: 'multilineText',
            description: 'Task description'
          },
          {
            name: 'Status',
            type: 'singleSelect',
            options: {
              choices: [
                { name: 'Not Started' },
                { name: 'In Progress' },
                { name: 'Completed' }
              ]
            },
            description: 'Current status of the task'
          },
          {
            name: 'Priority',
            type: 'singleSelect',
            options: {
              choices: [
                { name: 'Low' },
                { name: 'Medium' },
                { name: 'High' },
                { name: 'Critical' }
              ]
            },
            description: 'Task priority'
          },
          {
            name: 'DueDate',
            type: 'date',
            description: 'When the task is due',
            options: {
              dateFormat: {
                name: 'local'
              }
            }
          }
        ]
      };
      
      await schemaUtils.createTable(baseId, tableConfig);
      console.log(`✅ Created table: ${EXAMPLE_TABLE_NAME}\n`);
    }
    
    // Step 5: Create records
    console.log('Step 5: Creating example records...');
    const createdRecords = await crudUtils.createRecords(baseId, EXAMPLE_TABLE_NAME, EXAMPLE_RECORDS);
    console.log(`✅ Created ${createdRecords.length} records\n`);
    
    // Step 6: Read all records
    console.log('Step 6: Reading all records...');
    const allRecords = await crudUtils.readRecords(baseId, EXAMPLE_TABLE_NAME, 100);
    console.log(`✅ Read ${allRecords.length} records`);
    console.log('Sample record:');
    console.log(JSON.stringify(allRecords[0], null, 2));
    console.log();
    
    // Step 7: Filter records
    console.log('Step 7: Filtering records by status...');
    const notStartedRecords = await crudUtils.readRecords(
      baseId, 
      EXAMPLE_TABLE_NAME, 
      100, 
      'Status="Not Started"'
    );
    console.log(`✅ Found ${notStartedRecords.length} records with Status="Not Started"`);
    notStartedRecords.forEach(record => console.log(`- ${record.Name} (Priority: ${record.Priority})`));
    console.log();
    
    // Step 8: Update records
    console.log('Step 8: Updating records...');
    const recordsToUpdate = notStartedRecords.map(record => ({
      id: record.id,
      fields: { Status: 'In Progress' }
    }));
    
    const updatedRecords = await crudUtils.updateRecords(baseId, EXAMPLE_TABLE_NAME, recordsToUpdate);
    console.log(`✅ Updated ${updatedRecords.length} records to Status="In Progress"\n`);
    
    // Step 9: Verify updates
    console.log('Step 9: Verifying updates...');
    const inProgressRecords = await crudUtils.readRecords(
      baseId, 
      EXAMPLE_TABLE_NAME, 
      100, 
      'Status="In Progress"'
    );
    console.log(`✅ Found ${inProgressRecords.length} records with Status="In Progress"`);
    inProgressRecords.forEach(record => console.log(`- ${record.Name} (Priority: ${record.Priority})`));
    console.log();
    
    // Step 10: Delete records (optional - commented out to preserve data)
    console.log('Step 10: Deleting records (optional)...');
    console.log('Skipping deletion to preserve example data.');
    console.log('To delete records, uncomment the code below:');
    console.log('```');
    console.log('const recordIdsToDelete = allRecords.map(record => record.id);');
    console.log('const deletedRecords = await crudUtils.deleteRecords(baseId, EXAMPLE_TABLE_NAME, recordIdsToDelete);');
    console.log('console.log(`✅ Deleted ${deletedRecords.length} records`);');
    console.log('```\n');
    
    console.log('Example completed successfully!');
    console.log('You can now view the data in your Airtable base.');
    
  } catch (error) {
    console.error('Error during example:', error.message);
    process.exit(1);
  }
}

// Run the example
runExample(); 