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
from typing import Any, Dict, List, Optional, AsyncIterator, Callable
from dotenv import load_dotenv

print(f"Python version: {sys.version}")
print(f"Python executable: {sys.executable}")
print(f"Python path: {sys.path}")

# Import MCP-related modules - will be available when run with Python 3.10+
try:
    from mcp.server.fastmcp import FastMCP
    from mcp.server import stdio
    print("Successfully imported MCP modules")
except ImportError as e:
    print(f"Error importing MCP modules: {e}")
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

# Authentication middleware
@mcp.middleware
async def auth_middleware(context, next_handler):
    # Skip auth check for tool listing
    if hasattr(context, 'operation') and context.operation == "list_tools":
        return await next_handler(context)
    
    # Allow all operations without a token check - actual API calls will be checked later
    return await next_handler(context)

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
    if not server_state["token"]:
        return "Please provide an Airtable API token to list records."
    
    base = server_state["base_id"]
    
    if not base:
        return "Error: No base ID set. Please set a base ID."
    
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
    if not server_state["token"]:
        return "Please provide an Airtable API token to get records."
    
    base = server_state["base_id"]
    
    if not base:
        return "Error: No base ID set. Please set a base ID."
    
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
    if not server_state["token"]:
        return "Please provide an Airtable API token to create records."
    
    base = server_state["base_id"]
    
    if not base:
        return "Error: No base ID set. Please set a base ID."
    
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
    if not server_state["token"]:
        return "Please provide an Airtable API token to update records."
    
    base = server_state["base_id"]
    
    if not base:
        return "Error: No base ID set. Please set a base ID."
    
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
async def set_base_id(base_id: str) -> str:
    """Set the current Airtable base ID"""
    server_state["base_id"] = base_id
    return f"Base ID set to: {base_id}"


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
            logger.info("Tool listing will work but API calls will require a token")
        
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