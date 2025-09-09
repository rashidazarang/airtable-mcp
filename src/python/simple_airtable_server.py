#!/usr/bin/env python3
"""
Simple Airtable MCP Server for Claude
-------------------------------------
A minimal MCP server that implements Airtable tools and Claude's special methods
"""
import os
import sys
import json
import logging
import requests
import traceback
from typing import Dict, Any, List, Optional

# Check if MCP SDK is installed
try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    print("Error: MCP SDK not found. Please install with 'pip install mcp'")
    sys.exit(1)

# Parse command line arguments
if len(sys.argv) < 5:
    print("Usage: python3 simple_airtable_server.py --token YOUR_TOKEN --base YOUR_BASE_ID")
    sys.exit(1)

# Get the token and base ID from command line arguments
token = None
base_id = None
for i in range(1, len(sys.argv)):
    if sys.argv[i] == "--token" and i+1 < len(sys.argv):
        token = sys.argv[i+1]
    elif sys.argv[i] == "--base" and i+1 < len(sys.argv):
        base_id = sys.argv[i+1]

if not token:
    print("Error: No Airtable token provided. Use --token parameter.")
    sys.exit(1)

if not base_id:
    print("Error: No base ID provided. Use --base parameter.")
    sys.exit(1)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("airtable-mcp")

# Create MCP server
app = FastMCP("Airtable Tools")

# Helper function for Airtable API calls
async def airtable_api_call(endpoint, method="GET", data=None, params=None):
    """Make an Airtable API call with error handling"""
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
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"API call error: {str(e)}")
        return {"error": str(e)}

# Claude-specific methods
@app.rpc_method("resources/list")
async def resources_list(params: Dict = None) -> Dict:
    """List available Airtable resources for Claude"""
    try:
        # Return a simple list of resources
        resources = [
            {"id": "airtable_tables", "name": "Airtable Tables", "description": "Tables in your Airtable base"}
        ]
        return {"resources": resources}
    except Exception as e:
        logger.error(f"Error in resources/list: {str(e)}")
        return {"error": {"code": -32000, "message": str(e)}}

@app.rpc_method("prompts/list")
async def prompts_list(params: Dict = None) -> Dict:
    """List available prompts for Claude"""
    try:
        # Return a simple list of prompts
        prompts = [
            {"id": "tables_prompt", "name": "List Tables", "description": "List all tables"}
        ]
        return {"prompts": prompts}
    except Exception as e:
        logger.error(f"Error in prompts/list: {str(e)}")
        return {"error": {"code": -32000, "message": str(e)}}

# Airtable tool functions
@app.tool()
async def list_tables() -> str:
    """List all tables in the specified base"""
    try:
        result = await airtable_api_call(f"meta/bases/{base_id}/tables")
        
        if "error" in result:
            return f"Error: {result['error']}"
        
        tables = result.get("tables", [])
        if not tables:
            return "No tables found in this base."
        
        table_list = [f"{i+1}. {table['name']} (ID: {table['id']})" 
                    for i, table in enumerate(tables)]
        return "Tables in this base:\n" + "\n".join(table_list)
    except Exception as e:
        return f"Error listing tables: {str(e)}"

@app.tool()
async def list_records(table_name: str, max_records: int = 100) -> str:
    """List records from a table"""
    try:
        params = {"maxRecords": max_records}
        result = await airtable_api_call(f"{base_id}/{table_name}", params=params)
        
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
    except Exception as e:
        return f"Error listing records: {str(e)}"

# Start the server
if __name__ == "__main__":
    print(f"Starting Airtable MCP Server with token {token[:5]}...{token[-5:]} and base {base_id}")
    app.start() 