#!/usr/bin/env python3
"""
MCP Tool Inspector
-----------------
A simple script to list tools in a format Smithery can understand
"""
import json

# Define the tools manually
tools = [
    {
        "name": "list_bases",
        "description": "List all accessible Airtable bases",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        },
        "returns": {
            "type": "string"
        }
    },
    {
        "name": "list_tables",
        "description": "List all tables in the specified base or the default base",
        "parameters": {
            "type": "object",
            "properties": {
                "base_id": {
                    "type": "string",
                    "description": "Optional base ID to use instead of the default"
                }
            },
            "required": []
        },
        "returns": {
            "type": "string"
        }
    },
    {
        "name": "list_records",
        "description": "List records from a table with optional filtering",
        "parameters": {
            "type": "object",
            "properties": {
                "table_name": {
                    "type": "string",
                    "description": "Name of the table to list records from"
                },
                "max_records": {
                    "type": "integer",
                    "description": "Maximum number of records to return (default: 100)"
                },
                "filter_formula": {
                    "type": "string",
                    "description": "Optional Airtable formula to filter records"
                }
            },
            "required": ["table_name"]
        },
        "returns": {
            "type": "string"
        }
    },
    {
        "name": "get_record",
        "description": "Get a specific record from a table",
        "parameters": {
            "type": "object",
            "properties": {
                "table_name": {
                    "type": "string",
                    "description": "Name of the table"
                },
                "record_id": {
                    "type": "string",
                    "description": "ID of the record to retrieve"
                }
            },
            "required": ["table_name", "record_id"]
        },
        "returns": {
            "type": "string"
        }
    },
    {
        "name": "create_records",
        "description": "Create records in a table from JSON string",
        "parameters": {
            "type": "object",
            "properties": {
                "table_name": {
                    "type": "string",
                    "description": "Name of the table"
                },
                "records_json": {
                    "type": "string",
                    "description": "JSON string containing the records to create"
                }
            },
            "required": ["table_name", "records_json"]
        },
        "returns": {
            "type": "string"
        }
    },
    {
        "name": "update_records",
        "description": "Update records in a table from JSON string",
        "parameters": {
            "type": "object",
            "properties": {
                "table_name": {
                    "type": "string",
                    "description": "Name of the table"
                },
                "records_json": {
                    "type": "string",
                    "description": "JSON string containing the records to update with IDs"
                }
            },
            "required": ["table_name", "records_json"]
        },
        "returns": {
            "type": "string"
        }
    },
    {
        "name": "set_base_id",
        "description": "Set the current Airtable base ID",
        "parameters": {
            "type": "object",
            "properties": {
                "base_id": {
                    "type": "string",
                    "description": "Base ID to set as the current base"
                }
            },
            "required": ["base_id"]
        },
        "returns": {
            "type": "string"
        }
    }
]

# Print the tools as JSON
print(json.dumps({"tools": tools}, indent=2)) 