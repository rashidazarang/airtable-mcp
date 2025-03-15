#!/usr/bin/env python3
"""
Airtable MCP Server
-------------------
This is a Model Context Protocol (MCP) server that exposes Airtable operations as tools.
"""
import os
import sys
import json
import asyncio
import logging
import argparse
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional, AsyncIterator
from dotenv import load_dotenv

# Import MCP-related modules - will be available when run with Python 3.10+
try:
    from mcp.server.fastmcp import FastMCP
    from mcp.server import stdio
except ImportError:
    print("Error: MCP SDK requires Python 3.10+")
    print("Please install Python 3.10 or newer and try again.")
    sys.exit(1)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("airtable-mcp")

# Parse command line arguments
def parse_args():
    parser = argparse.ArgumentParser(description="Airtable MCP Server")
    parser.add_argument("--token", dest="api_token", help="Airtable Personal Access Token")
    parser.add_argument("--base", dest="base_id", help="Airtable Base ID")
    parser.add_argument("--port", type=int, default=8080, help="MCP server port for dev mode")
    parser.add_argument("--host", default="127.0.0.1", help="MCP server host for dev mode")
    parser.add_argument("--dev", action="store_true", help="Run in development mode")
    return parser.parse_args()

# Load environment variables as fallback
load_dotenv()

# Create MCP server
mcp = FastMCP("Airtable Tools")

# Server state will be initialized in main()
server_state = {
    "base_id": "",
    "token": "",
}

# Helper functions for Airtable API calls
async def api_call(endpoint, method="GET", data=None, params=None):
    """Make an Airtable API call"""
    import requests
    
    # Check if token is available before making API calls
    if not server_state["token"]:
        return {"error": "No Airtable API token provided. Please set via --token or AIRTABLE_PERSONAL_ACCESS_TOKEN"}
    
    headers = {
        "Authorization": f"Bearer {server_state['token']}",
        "Content-Type": "application/json"
    }
    
    url = f"https://api.airtable.com/v0/{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, params=params)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data)
        elif method == "PATCH":
            response = requests.patch(url, headers=headers, json=data)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, params=params)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"API call error: {str(e)}")
        return {"error": str(e)}


# Define MCP tool functions

@mcp.tool()
async def list_bases() -> str:
    """List all accessible Airtable bases"""
    # Check for token - return informational message if missing
    if not server_state["token"]:
        return "Please provide an Airtable API token to list your bases."
    
    result = await api_call("meta/bases")
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    bases = result.get("bases", [])
    if not bases:
        return "No bases found accessible with your token."
    
    base_list = [f"{i+1}. {base['name']} (ID: {base['id']})" for i, base in enumerate(bases)]
    return "Available bases:\n" + "\n".join(base_list)


@mcp.tool()
async def list_tables(base_id: Optional[str] = None) -> str:
    """List all tables in the specified base or the default base"""
    # Check for token - return informational message if missing
    if not server_state["token"]:
        return "Please provide an Airtable API token to list tables."
    
    base = base_id or server_state["base_id"]
    
    if not base:
        return "Error: No base ID provided. Please specify a base_id or set AIRTABLE_BASE_ID in your .env file."
    
    result = await api_call(f"meta/bases/{base}/tables")
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    tables = result.get("tables", [])
    if not tables:
        return "No tables found in this base."
    
    table_list = [f"{i+1}. {table['name']} (ID: {table['id']}, Fields: {len(table.get('fields', []))})" 
                 for i, table in enumerate(tables)]
    return "Tables in this base:\n" + "\n".join(table_list)


@mcp.tool()
async def list_records(table_name: str, max_records: Optional[int] = 100, filter_formula: Optional[str] = None) -> str:
    """List records from a table with optional filtering"""
    base = server_state["base_id"]
    
    if not base:
        return "Error: No base ID set. Please set AIRTABLE_BASE_ID in your .env file."
    
    params = {"maxRecords": max_records}
    
    if filter_formula:
        params["filterByFormula"] = filter_formula
    
    result = await api_call(f"{base}/{table_name}", params=params)
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    records = result.get("records", [])
    if not records:
        return "No records found in this table."
    
    # Format the records for display
    formatted_records = []
    for i, record in enumerate(records):
        record_id = record.get("id", "unknown")
        fields = record.get("fields", {})
        field_text = ", ".join([f"{k}: {v}" for k, v in fields.items()])
        formatted_records.append(f"{i+1}. ID: {record_id} - {field_text}")
    
    return "Records:\n" + "\n".join(formatted_records)


@mcp.tool()
async def get_record(table_name: str, record_id: str) -> str:
    """Get a specific record from a table"""
    base = server_state["base_id"]
    
    if not base:
        return "Error: No base ID set. Please set AIRTABLE_BASE_ID in your .env file."
    
    result = await api_call(f"{base}/{table_name}/{record_id}")
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    fields = result.get("fields", {})
    if not fields:
        return f"Record {record_id} found but contains no fields."
    
    # Format the fields for display
    formatted_fields = []
    for key, value in fields.items():
        formatted_fields.append(f"{key}: {value}")
    
    return f"Record ID: {record_id}\n" + "\n".join(formatted_fields)


@mcp.tool()
async def create_records(table_name: str, records_json: str) -> str:
    """Create records in a table from JSON string"""
    base = server_state["base_id"]
    
    if not base:
        return "Error: No base ID set. Please set AIRTABLE_BASE_ID in your .env file."
    
    try:
        records_data = json.loads(records_json)
        
        # Format the records for Airtable API
        if not isinstance(records_data, list):
            records_data = [records_data]
        
        records = [{"fields": record} for record in records_data]
        
        data = {"records": records}
        result = await api_call(f"{base}/{table_name}", method="POST", data=data)
        
        if "error" in result:
            return f"Error: {result['error']}"
        
        created_records = result.get("records", [])
        return f"Successfully created {len(created_records)} records."
        
    except json.JSONDecodeError:
        return "Error: Invalid JSON format in records_json parameter."
    except Exception as e:
        return f"Error creating records: {str(e)}"


@mcp.tool()
async def update_records(table_name: str, records_json: str) -> str:
    """Update records in a table from JSON string"""
    base = server_state["base_id"]
    
    if not base:
        return "Error: No base ID set. Please set AIRTABLE_BASE_ID in your .env file."
    
    try:
        records_data = json.loads(records_json)
        
        # Format the records for Airtable API
        if not isinstance(records_data, list):
            records_data = [records_data]
        
        records = []
        for record in records_data:
            if "id" not in record:
                return "Error: Each record must have an 'id' field."
            
            rec_id = record.pop("id")
            fields = record.get("fields", record)  # Support both {id, fields} format and direct fields
            records.append({"id": rec_id, "fields": fields})
        
        data = {"records": records}
        result = await api_call(f"{base}/{table_name}", method="PATCH", data=data)
        
        if "error" in result:
            return f"Error: {result['error']}"
        
        updated_records = result.get("records", [])
        return f"Successfully updated {len(updated_records)} records."
        
    except json.JSONDecodeError:
        return "Error: Invalid JSON format in records_json parameter."
    except Exception as e:
        return f"Error updating records: {str(e)}"


@mcp.tool()
async def delete_records(table_name: str, record_ids: str) -> str:
    """Delete records from a table by IDs (comma-separated)"""
    base = server_state["base_id"]
    
    if not base:
        return "Error: No base ID set. Please set AIRTABLE_BASE_ID in your .env file."
    
    try:
        # Parse comma-separated IDs
        ids = [id.strip() for id in record_ids.split(",")]
        
        if not ids:
            return "Error: No record IDs provided."
        
        # Delete records one by one
        deleted_count = 0
        for record_id in ids:
            result = await api_call(f"{base}/{table_name}/{record_id}", method="DELETE")
            if "error" not in result:
                deleted_count += 1
        
        return f"Successfully deleted {deleted_count} out of {len(ids)} records."
        
    except Exception as e:
        return f"Error deleting records: {str(e)}"


@mcp.tool()
async def export_records(table_name: str, max_records: Optional[int] = 100) -> str:
    """Export records from a table as JSON string"""
    base = server_state["base_id"]
    
    if not base:
        return "Error: No base ID set. Please set AIRTABLE_BASE_ID in your .env file."
    
    params = {"maxRecords": max_records}
    result = await api_call(f"{base}/{table_name}", params=params)
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    records = result.get("records", [])
    if not records:
        return "No records found in this table."
    
    # Format the records for export
    formatted_records = []
    for record in records:
        rec = {
            "id": record.get("id", ""),
            **record.get("fields", {})
        }
        formatted_records.append(rec)
    
    return json.dumps(formatted_records, indent=2)


@mcp.tool()
async def import_records(table_name: str, records_json: str, update_existing: Optional[bool] = False) -> str:
    """Import records to a table from JSON string"""
    if update_existing:
        return await update_records(table_name, records_json)
    else:
        return await create_records(table_name, records_json)


@mcp.tool()
async def create_tables(schema_json: str) -> str:
    """Create tables from a JSON schema"""
    base = server_state["base_id"]
    
    if not base:
        return "Error: No base ID set. Please set AIRTABLE_BASE_ID in your .env file."
    
    try:
        schema = json.loads(schema_json)
        tables = schema.get("tables", [])
        
        if not tables:
            return "Error: No tables defined in schema_json."
        
        created_tables = []
        for table in tables:
            if "name" not in table or "fields" not in table:
                continue
                
            # Create the table
            data = {
                "name": table["name"],
                "description": table.get("description", ""),
                "fields": []
            }
            
            # Add fields to the table
            for field in table["fields"]:
                if "name" not in field or "type" not in field:
                    continue
                    
                field_data = {
                    "name": field["name"],
                    "type": field["type"],
                    "description": field.get("description", "")
                }
                
                # Add options if present
                if "options" in field:
                    field_data["options"] = field["options"]
                    
                data["fields"].append(field_data)
            
            # Create the table via Airtable API
            result = await api_call(f"meta/bases/{base}/tables", method="POST", data=data)
            
            if "error" in result:
                created_tables.append(f"Failed to create table {table['name']}: {result['error']}")
            else:
                created_tables.append(f"Created table {table['name']} with {len(data['fields'])} fields")
        
        return "\n".join(created_tables)
        
    except json.JSONDecodeError:
        return "Error: Invalid JSON format in schema_json parameter."
    except Exception as e:
        return f"Error creating tables: {str(e)}"


@mcp.tool()
async def update_schema(schema_json: str) -> str:
    """Update existing tables to match a JSON schema"""
    base = server_state["base_id"]
    
    if not base:
        return "Error: No base ID set. Please set AIRTABLE_BASE_ID in your .env file."
    
    try:
        schema = json.loads(schema_json)
        tables = schema.get("tables", [])
        
        if not tables:
            return "Error: No tables defined in schema_json."
        
        # First, get existing tables
        existing_tables_result = await api_call(f"meta/bases/{base}/tables")
        if "error" in existing_tables_result:
            return f"Error: {existing_tables_result['error']}"
            
        existing_tables = existing_tables_result.get("tables", [])
        existing_table_names = {table["name"] for table in existing_tables}
        
        # Process each table in the schema
        update_results = []
        for table in tables:
            if "name" not in table or "fields" not in table:
                continue
                
            table_name = table["name"]
            
            if table_name in existing_table_names:
                # Update existing table
                # Find the existing table to get its ID
                existing_table = next((t for t in existing_tables if t["name"] == table_name), None)
                
                if existing_table:
                    table_id = existing_table["id"]
                    existing_fields = {field["name"]: field for field in existing_table.get("fields", [])}
                    
                    # Prepare fields to update or add
                    fields_to_update = []
                    for field in table["fields"]:
                        if "name" not in field or "type" not in field:
                            continue
                            
                        field_name = field["name"]
                        
                        if field_name in existing_fields:
                            # Update existing field
                            field_data = {
                                "id": existing_fields[field_name]["id"],
                                "name": field_name,
                                "type": field["type"]
                            }
                            
                            if "description" in field:
                                field_data["description"] = field["description"]
                                
                            if "options" in field:
                                field_data["options"] = field["options"]
                                
                            fields_to_update.append(field_data)
                        else:
                            # Add new field
                            field_data = {
                                "name": field_name,
                                "type": field["type"]
                            }
                            
                            if "description" in field:
                                field_data["description"] = field["description"]
                                
                            if "options" in field:
                                field_data["options"] = field["options"]
                                
                            # Create the field
                            field_result = await api_call(
                                f"meta/bases/{base}/tables/{table_id}/fields", 
                                method="POST", 
                                data=field_data
                            )
                            
                            if "error" in field_result:
                                update_results.append(f"Failed to add field {field_name} to table {table_name}: {field_result['error']}")
                            else:
                                update_results.append(f"Added field {field_name} to table {table_name}")
                    
                    # Update existing fields
                    if fields_to_update:
                        update_data = {"fields": fields_to_update}
                        update_result = await api_call(
                            f"meta/bases/{base}/tables/{table_id}/fields", 
                            method="PATCH", 
                            data=update_data
                        )
                        
                        if "error" in update_result:
                            update_results.append(f"Failed to update fields in table {table_name}: {update_result['error']}")
                        else:
                            update_results.append(f"Updated {len(fields_to_update)} fields in table {table_name}")
                    
            else:
                # Create new table
                create_result = await create_tables(json.dumps({"tables": [table]}))
                update_results.append(create_result)
        
        return "\n".join(update_results)
        
    except json.JSONDecodeError:
        return "Error: Invalid JSON format in schema_json parameter."
    except Exception as e:
        return f"Error updating schema: {str(e)}"


@mcp.tool()
async def set_base_id(base_id: str) -> str:
    """Set the current Airtable base ID"""
    server_state["base_id"] = base_id
    return f"Base ID set to: {base_id}"


@mcp.tool()
async def inspect_table(table_name: str) -> str:
    """Get detailed information about a table's structure and fields"""
    base = server_state["base_id"]
    
    if not base:
        return "Error: No base ID set. Please set AIRTABLE_BASE_ID in your .env file."
    
    try:
        # Get table metadata
        tables_result = await api_call(f"meta/bases/{base}/tables")
        
        if "error" in tables_result:
            return f"Error accessing tables: {tables_result['error']}"
        
        tables = tables_result.get("tables", [])
        table = next((t for t in tables if t["name"] == table_name), None)
        
        if not table:
            return f"Error: Table '{table_name}' not found in base."
        
        # Get fields
        fields = table.get("fields", [])
        
        # Format the output
        output = [f"Table: {table_name} (ID: {table.get('id', 'unknown')})"]
        output.append(f"Description: {table.get('description', 'No description')}")
        output.append(f"Fields: {len(fields)}")
        output.append("\nField Details:")
        
        for i, field in enumerate(fields):
            field_name = field.get("name", "Unnamed Field")
            field_type = field.get("type", "unknown")
            field_id = field.get("id", "unknown")
            field_desc = field.get("description", "")
            
            output.append(f"\n{i+1}. {field_name} ({field_type})")
            output.append(f"   ID: {field_id}")
            if field_desc:
                output.append(f"   Description: {field_desc}")
            
            # Add options if present
            options = field.get("options", {})
            if options:
                opt_str = ", ".join([f"{k}: {v}" for k, v in options.items()])
                output.append(f"   Options: {opt_str}")
        
        return "\n".join(output)
        
    except Exception as e:
        return f"Error inspecting table: {str(e)}"


@mcp.tool()
async def export_schema(output_format: str = "json") -> str:
    """Export the schema of the current base in JSON or CSV format"""
    base = server_state["base_id"]
    
    if not base:
        return "Error: No base ID set. Please set AIRTABLE_BASE_ID in your .env file."
    
    try:
        # Get table metadata
        tables_result = await api_call(f"meta/bases/{base}/tables")
        
        if "error" in tables_result:
            return f"Error accessing tables: {tables_result['error']}"
        
        tables = tables_result.get("tables", [])
        
        if not tables:
            return "No tables found in the base."
        
        # Create the schema
        schema = {
            "tables": []
        }
        
        for table in tables:
            table_schema = {
                "name": table.get("name", "Unnamed Table"),
                "id": table.get("id", ""),
                "description": table.get("description", ""),
                "fields": []
            }
            
            for field in table.get("fields", []):
                field_schema = {
                    "name": field.get("name", "Unnamed Field"),
                    "id": field.get("id", ""),
                    "type": field.get("type", "unknown"),
                    "description": field.get("description", "")
                }
                
                # Add options if present
                if "options" in field:
                    field_schema["options"] = field["options"]
                
                table_schema["fields"].append(field_schema)
            
            schema["tables"].append(table_schema)
        
        # Format output based on requested format
        if output_format.lower() == "csv":
            # Convert to CSV format
            csv_rows = ["table_name,field_name,field_type,field_description"]
            
            for table in schema["tables"]:
                table_name = table["name"]
                for field in table["fields"]:
                    field_name = field["name"]
                    field_type = field["type"]
                    field_desc = field["description"].replace(",", ";")  # Escape commas
                    csv_rows.append(f"{table_name},{field_name},{field_type},{field_desc}")
            
            return "\n".join(csv_rows)
        else:
            # Return as JSON
            return json.dumps(schema, indent=2)
        
    except Exception as e:
        return f"Error exporting schema: {str(e)}"


@mcp.tool()
async def compare_schemas(schema_json: str) -> str:
    """Compare the provided schema with the current base schema"""
    base = server_state["base_id"]
    
    if not base:
        return "Error: No base ID set. Please set AIRTABLE_BASE_ID in your .env file."
    
    try:
        # Parse the provided schema
        schema = json.loads(schema_json)
        schema_tables = schema.get("tables", [])
        
        # Get the current base schema
        tables_result = await api_call(f"meta/bases/{base}/tables")
        
        if "error" in tables_result:
            return f"Error accessing tables: {tables_result['error']}"
        
        current_tables = tables_result.get("tables", [])
        
        # Build a lookup for the current tables and fields
        current_table_dict = {table["name"]: table for table in current_tables}
        current_field_dict = {}
        
        for table in current_tables:
            table_name = table["name"]
            current_field_dict[table_name] = {field["name"]: field for field in table.get("fields", [])}
        
        # Compare schemas
        comparison = []
        comparison.append("Schema Comparison Report")
        comparison.append("======================\n")
        
        # Check for tables in schema but not in current base
        schema_table_names = [table["name"] for table in schema_tables]
        current_table_names = list(current_table_dict.keys())
        
        missing_tables = [name for name in schema_table_names if name not in current_table_names]
        if missing_tables:
            comparison.append("Missing Tables (in schema but not in base):")
            for name in missing_tables:
                comparison.append(f"- {name}")
            comparison.append("")
        
        # Check for tables in current base but not in schema
        extra_tables = [name for name in current_table_names if name not in schema_table_names]
        if extra_tables:
            comparison.append("Extra Tables (in base but not in schema):")
            for name in extra_tables:
                comparison.append(f"- {name}")
            comparison.append("")
        
        # Compare fields for tables that exist in both
        field_differences = []
        
        for table in schema_tables:
            table_name = table["name"]
            
            if table_name in current_table_dict:
                schema_fields = {field["name"]: field for field in table.get("fields", [])}
                current_fields = current_field_dict[table_name]
                
                # Fields in schema but not in current table
                missing_fields = [name for name in schema_fields.keys() if name not in current_fields]
                if missing_fields:
                    field_differences.append(f"Table '{table_name}' is missing fields:")
                    for name in missing_fields:
                        field = schema_fields[name]
                        field_differences.append(f"  - {name} ({field.get('type', 'unknown')})")
                
                # Fields in current table but not in schema
                extra_fields = [name for name in current_fields.keys() if name not in schema_fields]
                if extra_fields:
                    field_differences.append(f"Table '{table_name}' has extra fields:")
                    for name in extra_fields:
                        field = current_fields[name]
                        field_differences.append(f"  - {name} ({field.get('type', 'unknown')})")
                
                # Check for type differences in fields that exist in both
                type_differences = []
                for name, schema_field in schema_fields.items():
                    if name in current_fields:
                        current_field = current_fields[name]
                        if schema_field.get("type") != current_field.get("type"):
                            type_differences.append(
                                f"  - {name}: {current_field.get('type', 'unknown')} vs {schema_field.get('type', 'unknown')} in schema"
                            )
                
                if type_differences:
                    field_differences.append(f"Table '{table_name}' has field type differences:")
                    field_differences.extend(type_differences)
        
        if field_differences:
            comparison.append("Field Differences:")
            comparison.extend(field_differences)
            comparison.append("")
        
        if not missing_tables and not extra_tables and not field_differences:
            comparison.append("The schemas are identical.")
        
        return "\n".join(comparison)
        
    except json.JSONDecodeError:
        return "Error: Invalid JSON format in schema_json parameter."
    except Exception as e:
        return f"Error comparing schemas: {str(e)}"


@mcp.tool()
async def generate_field_mapping(source_table: str, target_table: str) -> str:
    """Generate a field mapping between two tables"""
    base = server_state["base_id"]
    
    if not base:
        return "Error: No base ID set. Please set AIRTABLE_BASE_ID in your .env file."
    
    try:
        # Get table metadata
        tables_result = await api_call(f"meta/bases/{base}/tables")
        
        if "error" in tables_result:
            return f"Error accessing tables: {tables_result['error']}"
        
        tables = tables_result.get("tables", [])
        
        # Find the source and target tables
        source = next((t for t in tables if t["name"] == source_table), None)
        target = next((t for t in tables if t["name"] == target_table), None)
        
        if not source:
            return f"Error: Source table '{source_table}' not found."
        
        if not target:
            return f"Error: Target table '{target_table}' not found."
        
        # Get the fields
        source_fields = source.get("fields", [])
        target_fields = target.get("fields", [])
        
        # Create field name lists
        source_field_names = [field.get("name") for field in source_fields]
        target_field_names = [field.get("name") for field in target_fields]
        
        # Generate automatic field mapping based on name matching
        field_mapping = {}
        
        for source_name in source_field_names:
            # Direct match
            if source_name in target_field_names:
                field_mapping[source_name] = source_name
            # Case-insensitive match
            else:
                lower_source = source_name.lower()
                lower_targets = [t.lower() for t in target_field_names]
                if lower_source in lower_targets:
                    idx = lower_targets.index(lower_source)
                    field_mapping[source_name] = target_field_names[idx]
        
        # Format the output
        if not field_mapping:
            return "No matching fields found between the tables."
            
        # Generate the mapping as JSON
        mapping_json = json.dumps(field_mapping, indent=2)
        
        return f"Field mapping between '{source_table}' and '{target_table}':\n\n{mapping_json}"
        
    except Exception as e:
        return f"Error generating field mapping: {str(e)}"


@mcp.tool()
async def migrate_data(source_table: str, target_table: str, mapping_json: str = "", max_records: int = 100) -> str:
    """Migrate data from one table to another using the specified field mapping"""
    base = server_state["base_id"]
    
    if not base:
        return "Error: No base ID set. Please set AIRTABLE_BASE_ID in your .env file."
    
    try:
        # Parse the field mapping if provided
        field_mapping = {}
        if mapping_json:
            field_mapping = json.loads(mapping_json)
        else:
            # Generate automatic mapping if not provided
            mapping_result = await generate_field_mapping(source_table, target_table)
            if "Error" in mapping_result:
                return mapping_result
                
            # Extract the JSON part from the response
            json_start = mapping_result.find('{')
            if json_start != -1:
                mapping_json = mapping_result[json_start:]
                field_mapping = json.loads(mapping_json)
        
        # Get source records
        source_records_result = await api_call(f"{base}/{source_table}", params={"maxRecords": max_records})
        
        if "error" in source_records_result:
            return f"Error accessing source table: {source_records_result['error']}"
        
        source_records = source_records_result.get("records", [])
        
        if not source_records:
            return f"No records found in source table '{source_table}'."
        
        # Transform records using the mapping
        target_records = []
        
        for record in source_records:
            source_fields = record.get("fields", {})
            target_fields = {}
            
            for source_field, target_field in field_mapping.items():
                if source_field in source_fields:
                    target_fields[target_field] = source_fields[source_field]
            
            if target_fields:  # Only add if there are mapped fields
                target_records.append({"fields": target_fields})
        
        # Create records in the target table
        if not target_records:
            return "No records to migrate after applying field mapping."
            
        # Split into batches of 10 records (Airtable API limit)
        batch_size = 10
        migrated_count = 0
        
        for i in range(0, len(target_records), batch_size):
            batch = target_records[i:i+batch_size]
            batch_data = {"records": batch}
            
            create_result = await api_call(f"{base}/{target_table}", method="POST", data=batch_data)
            
            if "error" in create_result:
                return f"Error creating records in target table: {create_result['error']}"
            
            migrated_count += len(create_result.get("records", []))
        
        return f"Successfully migrated {migrated_count} records from '{source_table}' to '{target_table}'."
        
    except json.JSONDecodeError:
        return "Error: Invalid JSON format in mapping_json parameter."
    except Exception as e:
        return f"Error migrating data: {str(e)}"


@mcp.resource("airtable://current-base")
async def get_current_base() -> str:
    """Get information about the current Airtable base"""
    base_id = server_state["base_id"]
    
    if not base_id:
        return "No base ID currently set."
    
    try:
        result = await api_call(f"meta/bases/{base_id}")
        
        if "error" in result:
            return f"Error: {result['error']}"
        
        base_name = result.get("name", "Unknown")
        return f"Current base: {base_name} (ID: {base_id})"
    except Exception as e:
        return f"Error getting base info: {str(e)}"


def main():
    """Run the MCP server"""
    try:
        # Parse command line arguments
        args = parse_args()
        
        # Set server state from command line args or fallback to env vars
        server_state["token"] = args.api_token or os.getenv("AIRTABLE_PERSONAL_ACCESS_TOKEN", "")
        server_state["base_id"] = args.base_id or os.getenv("AIRTABLE_BASE_ID", "")
        
        if not server_state["token"]:
            logger.warning("No Airtable API token provided. Please set via --token or AIRTABLE_PERSONAL_ACCESS_TOKEN")
            logger.info("Tool listing will still work but API calls will require a token")
        
        # Setup asyncio event loop
        if sys.platform == 'win32':
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

        # Run the server
        if args.dev:
            # Development mode
            mcp.run(host=args.host, port=args.port)
        else:
            # Production mode - stdio interface for MCP
            mcp.run()
            
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main() 