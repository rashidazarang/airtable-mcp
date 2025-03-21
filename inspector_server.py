#!/usr/bin/env python3
"""
Airtable MCP Inspector Server
-----------------------------
A simple MCP server that implements the Airtable tools
"""
import os
import sys
import json
import logging
import requests
import argparse
from typing import Optional, Dict, Any, List

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    print("Error: MCP SDK not found. Please install with 'pip install mcp'")
    sys.exit(1)

# Parse command line arguments
def parse_args():
    parser = argparse.ArgumentParser(description="Airtable MCP Server")
    parser.add_argument("--token", dest="api_token", help="Airtable Personal Access Token")
    parser.add_argument("--base", dest="base_id", help="Airtable Base ID")
    parser.add_argument("--config", dest="config_json", help="Configuration as JSON (for Smithery integration)")
    return parser.parse_args()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("airtable-mcp")

# Parse arguments
args = parse_args()

# Handle config JSON from Smithery if provided
config = {}
if args.config_json:
    try:
        # Strip any trailing quotes or backslashes that might be present
        config_str = args.config_json.rstrip('\\"')
        logger.info(f"Parsing config: {config_str}")
        config = json.loads(config_str)
        logger.info(f"Successfully parsed config: {config}")
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse config JSON: {e}")
        logger.error(f"Raw config string: {args.config_json}")

# Create MCP server
app = FastMCP("Airtable Tools")

# Get token from arguments, config, or environment
token = args.api_token or config.get("airtable_token", "") or os.environ.get("AIRTABLE_PERSONAL_ACCESS_TOKEN", "")
# Clean up token if it has trailing quote
if token and token.endswith('"'):
    token = token[:-1]
    
base_id = args.base_id or config.get("base_id", "") or os.environ.get("AIRTABLE_BASE_ID", "")

if not token:
    logger.warning("No Airtable API token provided. Use --token, --config, or set AIRTABLE_PERSONAL_ACCESS_TOKEN environment variable.")
else:
    logger.info(f"Using Airtable token: {token[:5]}...{token[-5:]}")

if base_id:
    logger.info(f"Using base ID: {base_id}")
else:
    logger.warning("No base ID provided. Use --base, --config, or set AIRTABLE_BASE_ID environment variable.")

# Helper functions for Airtable API calls
async def api_call(endpoint, method="GET", data=None, params=None):
    """Make an Airtable API call"""
    if not token:
        return {"error": "No Airtable API token provided. Use --token, --config, or set AIRTABLE_PERSONAL_ACCESS_TOKEN environment variable."}
    
    headers = {
        "Authorization": f"Bearer {token}",
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
@app.tool()
async def list_bases() -> str:
    """List all accessible Airtable bases"""
    if not token:
        return "Please provide an Airtable API token to list your bases."
    
    result = await api_call("meta/bases")
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    bases = result.get("bases", [])
    if not bases:
        return "No bases found accessible with your token."
    
    base_list = [f"{i+1}. {base['name']} (ID: {base['id']})" for i, base in enumerate(bases)]
    return "Available bases:\n" + "\n".join(base_list)

@app.tool()
async def list_tables(base_id_param: Optional[str] = None) -> str:
    """List all tables in the specified base or the default base"""
    global base_id
    current_base = base_id_param or base_id
    
    if not token:
        return "Please provide an Airtable API token to list tables."
    
    if not current_base:
        return "Error: No base ID provided. Please specify a base_id or set AIRTABLE_BASE_ID environment variable."
    
    result = await api_call(f"meta/bases/{current_base}/tables")
    
    if "error" in result:
        return f"Error: {result['error']}"
    
    tables = result.get("tables", [])
    if not tables:
        return "No tables found in this base."
    
    table_list = [f"{i+1}. {table['name']} (ID: {table['id']}, Fields: {len(table.get('fields', []))})" 
                 for i, table in enumerate(tables)]
    return "Tables in this base:\n" + "\n".join(table_list)

@app.tool()
async def list_records(table_name: str, max_records: Optional[int] = 100, filter_formula: Optional[str] = None) -> str:
    """List records from a table with optional filtering"""
    if not token:
        return "Please provide an Airtable API token to list records."
    
    if not base_id:
        return "Error: No base ID set. Please use --base or set AIRTABLE_BASE_ID environment variable."
    
    params = {"maxRecords": max_records}
    
    if filter_formula:
        params["filterByFormula"] = filter_formula
    
    result = await api_call(f"{base_id}/{table_name}", params=params)
    
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

@app.tool()
async def get_record(table_name: str, record_id: str) -> str:
    """Get a specific record from a table"""
    if not token:
        return "Please provide an Airtable API token to get records."
    
    if not base_id:
        return "Error: No base ID set. Please set AIRTABLE_BASE_ID environment variable."
    
    result = await api_call(f"{base_id}/{table_name}/{record_id}")
    
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

@app.tool()
async def create_records(table_name: str, records_json: str) -> str:
    """Create records in a table from JSON string"""
    if not token:
        return "Please provide an Airtable API token to create records."
    
    if not base_id:
        return "Error: No base ID set. Please set AIRTABLE_BASE_ID environment variable."
    
    try:
        records_data = json.loads(records_json)
        
        # Format the records for Airtable API
        if not isinstance(records_data, list):
            records_data = [records_data]
        
        records = [{"fields": record} for record in records_data]
        
        data = {"records": records}
        result = await api_call(f"{base_id}/{table_name}", method="POST", data=data)
        
        if "error" in result:
            return f"Error: {result['error']}"
        
        created_records = result.get("records", [])
        return f"Successfully created {len(created_records)} records."
        
    except json.JSONDecodeError:
        return "Error: Invalid JSON format in records_json parameter."
    except Exception as e:
        return f"Error creating records: {str(e)}"

@app.tool()
async def update_records(table_name: str, records_json: str) -> str:
    """Update records in a table from JSON string"""
    if not token:
        return "Please provide an Airtable API token to update records."
    
    if not base_id:
        return "Error: No base ID set. Please set AIRTABLE_BASE_ID environment variable."
    
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
        result = await api_call(f"{base_id}/{table_name}", method="PATCH", data=data)
        
        if "error" in result:
            return f"Error: {result['error']}"
        
        updated_records = result.get("records", [])
        return f"Successfully updated {len(updated_records)} records."
        
    except json.JSONDecodeError:
        return "Error: Invalid JSON format in records_json parameter."
    except Exception as e:
        return f"Error updating records: {str(e)}"

@app.tool()
async def set_base_id(base_id_param: str) -> str:
    """Set the current Airtable base ID"""
    global base_id
    base_id = base_id_param
    return f"Base ID set to: {base_id}"

if __name__ == "__main__":
    app.run() 