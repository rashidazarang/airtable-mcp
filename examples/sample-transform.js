/**
 * Sample transform function for syncing data between tables
 * 
 * This module demonstrates how to transform records when syncing
 * between two tables with different schemas.
 * 
 * To use with the airtable-crud.js sync command:
 * node airtable-crud.js sync "Source Table" "Target Table" sample-transform.js
 */

/**
 * Transform function that converts records from source table format to target table format
 * @param {Object} sourceRecord - Record from the source table
 * @returns {Object} - Transformed record for the target table
 */
function transform(sourceRecord) {
  // Example: Converting a customer record to a simplified format
  
  // Extract the needed fields
  const { id, Name, Email, Phone, "Company Name": Company, "Date Added": DateAdded, Status } = sourceRecord;
  
  // Create the transformed record
  const transformedRecord = {
    // You can optionally include the source record ID
    // This is useful for updating existing records in sync operations
    // "Source Record ID": id,
    
    // Map fields from source to target
    CustomerName: Name,
    CustomerEmail: Email,
    CustomerPhone: Phone || '',
    Organization: Company || 'Individual',
    
    // Transform dates
    JoinDate: DateAdded,
    
    // Add calculated fields
    CustomerCategory: Company ? 'Business' : 'Individual',
    
    // Transform status to a different format
    IsActive: Status === 'Active',
    
    // Add constant values
    DataSource: 'Customer Table Sync',
    LastSyncedAt: new Date().toISOString()
  };
  
  return transformedRecord;
}

// You can define other utility functions here

/**
 * Helper function to clean and format phone numbers
 * @param {string} phone - Raw phone number
 * @returns {string} - Formatted phone number
 */
function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  // Remove non-numeric characters
  const cleaned = ('' + phone).replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  
  return phone;
}

// Export the transform function
module.exports = {
  transform
}; 