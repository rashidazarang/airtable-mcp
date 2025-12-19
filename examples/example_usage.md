# Airtable MCP Example Usage

This document provides examples of how to use the Airtable MCP tools within a compatible MCP client like Cursor.

## Base Management

### List all available bases

```
Using the Airtable MCP, please list all the bases I have access to.
```

### Set the active base

```
Set the active Airtable base to "Project Management" (or use the base ID directly).
```

## Table Operations

### List all tables in the current base

```
Show me all the tables in my current Airtable base.
```

### View table structure

```
Show me the structure of the "Tasks" table, including all fields and their types.
```

## Record Operations

### List records

```
Show me the first 10 records from the "Clients" table.
```

### Filter records

```
Find all "Tasks" with a status of "In Progress" and due date before today.
```

### Get a specific record

```
Get the record with ID "rec123456" from the "Projects" table.
```

### Create a new record

```
Create a new record in the "Tasks" table with the following information:
- Title: "Complete project documentation"
- Status: "Not Started"
- Due Date: "2024-12-31"
- Assigned To: "John Smith"
```

### Update an existing record

```
Update the task with ID "rec123456" in the "Tasks" table:
- Change status to "In Progress"
- Update due date to "2024-11-30"
```

### Delete a record

```
Delete the record with ID "rec123456" from the "Tasks" table.
```

## Schema Management

### Export the schema

```
Export the schema of my current Airtable base in JSON format.
```

### Compare schemas

```
Compare this schema with my current base schema to identify any differences.
```

## Data Migration

### Generate field mapping

```
Generate a field mapping between the "Clients" and "Customers" tables.
```

### Migrate data

```
Migrate data from the "Clients" table to the "Customers" table using the generated mapping.
```

## Tips for Better Results

1. **Be specific** when referencing table and field names
2. **Use record IDs** when updating or deleting specific records
3. **Use natural language** to describe the operations you want to perform
4. **Check your base ID** is correctly set if you get unexpected results
5. **Format JSON data** properly when creating or updating records

## Combining Operations

You can combine multiple operations in a single request:

```
Please help me organize my project data:
1. First, show me all the tables in my base
2. Then, list the overdue tasks (status is not "Complete" and due date is before today)
3. Finally, update those tasks to have a status of "Urgent"
```

The Airtable MCP can help with complex workflows by understanding your intentions and executing the appropriate sequence of operations. 