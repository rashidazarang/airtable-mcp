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
async def delete_records(table_name: str, record_ids: str) -> str:
    """Delete records from a table by their IDs (comma-separated or JSON array)"""
    if not server_state["token"]:
        return "Please provide an Airtable API token to delete records."
    
    base = server_state["base_id"]
    
    if not base:
        return "Error: No base ID set. Please set a base ID."
    
    try:
        # Handle both comma-separated and JSON array formats
        if record_ids.startswith("["):
            ids_list = json.loads(record_ids)
        else:
            ids_list = [rid.strip() for rid in record_ids.split(",")]
        
        # Delete records in batches of 10 (Airtable API limit)
        deleted_count = 0
        for i in range(0, len(ids_list), 10):
            batch = ids_list[i:i+10]
            params = {"records[]": batch}
            
            result = await api_call(f"{base}/{table_name}", method="DELETE", params=params)
            
            if "error" in result:
                return f"Error deleting records: {result['error']}"
            
            deleted_count += len(result.get("records", []))
        
        return f"Successfully deleted {deleted_count} records."
        
    except json.JSONDecodeError:
        return "Error: Invalid format for record_ids. Use comma-separated IDs or JSON array."
    except Exception as e:
        return f"Error deleting records: {str(e)}"


@mcp.tool()
async def set_base_id(base_id: str) -> str:
    """Set the current Airtable base ID"""
    server_state["base_id"] = base_id
    return f"Base ID set to: {base_id}"


# Resources implementation for MCP protocol
@mcp.resource("airtable://base/{base_id}")
async def get_base_resource(base_id: str) -> Dict:
    """Get base metadata as a resource"""
    if not server_state["token"]:
        return {"error": "No Airtable API token provided"}
    
    result = await api_call(f"meta/bases/{base_id}/tables")
    if "error" in result:
        return {"error": result["error"]}
    
    tables = result.get("tables", [])
    return {
        "base_id": base_id,
        "tables_count": len(tables),
        "tables": [{"id": t["id"], "name": t["name"]} for t in tables]
    }


@mcp.resource("airtable://base/{base_id}/table/{table_name}")
async def get_table_resource(base_id: str, table_name: str) -> Dict:
    """Get table data as a resource"""
    if not server_state["token"]:
        return {"error": "No Airtable API token provided"}
    
    result = await api_call(f"{base_id}/{table_name}", params={"maxRecords": 100})
    if "error" in result:
        return {"error": result["error"]}
    
    records = result.get("records", [])
    return {
        "base_id": base_id,
        "table_name": table_name,
        "records_count": len(records),
        "records": records
    }


# Roots implementation for filesystem access
@mcp.rpc_method("roots/list")
async def roots_list() -> Dict:
    """List available filesystem roots for data import/export"""
    roots = [
        {
            "uri": "file:///tmp/airtable-exports",
            "name": "Airtable Exports Directory"
        }
    ]
    return {"roots": roots}


# Prompts implementation for guided interactions
@mcp.rpc_method("prompts/list")
async def prompts_list() -> Dict:
    """List available prompt templates"""
    prompts = [
        {
            "name": "analyze_base",
            "description": "Analyze an Airtable base structure and suggest optimizations",
            "arguments": [
                {
                    "name": "base_id",
                    "description": "The Airtable base ID to analyze",
                    "required": True
                }
            ]
        },
        {
            "name": "create_table_schema",
            "description": "Generate a table schema based on requirements",
            "arguments": [
                {
                    "name": "requirements",
                    "description": "Description of the table requirements",
                    "required": True
                },
                {
                    "name": "table_name",
                    "description": "Name for the new table",
                    "required": True
                }
            ]
        },
        {
            "name": "data_migration",
            "description": "Plan data migration between tables or bases",
            "arguments": [
                {
                    "name": "source",
                    "description": "Source table/base identifier",
                    "required": True
                },
                {
                    "name": "destination",
                    "description": "Destination table/base identifier",
                    "required": True
                }
            ]
        }
    ]
    return {"prompts": prompts}


@mcp.rpc_method("prompts/get")
async def prompts_get(name: str, arguments: Optional[Dict] = None) -> Dict:
    """Get a specific prompt template with filled arguments"""
    
    prompts_templates = {
        "analyze_base": """Analyze the Airtable base '{base_id}' and provide:
1. Overview of all tables and their relationships
2. Data quality assessment
3. Performance optimization suggestions
4. Schema improvement recommendations
5. Automation opportunities""",
        
        "create_table_schema": """Create a table schema for '{table_name}' with these requirements:
{requirements}

Please provide:
1. Field definitions with appropriate types
2. Validation rules
3. Linked record relationships
4. Views and filters setup
5. Sample data structure""",
        
        "data_migration": """Plan a data migration from '{source}' to '{destination}':
1. Analyze source structure
2. Map fields between source and destination
3. Identify data transformation needs
4. Handle relationship mappings
5. Provide migration script
6. Include validation steps"""
    }
    
    if name not in prompts_templates:
        return {"error": f"Unknown prompt: {name}"}
    
    template = prompts_templates[name]
    
    if arguments:
        try:
            prompt = template.format(**arguments)
        except KeyError as e:
            return {"error": f"Missing required argument: {e}"}
    else:
        prompt = template
    
    return {
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }


# Sampling implementation for completion suggestions
@mcp.rpc_method("completion/complete")
async def completion_complete(ref: Dict, argument: Dict, partial: str) -> Dict:
    """Provide completion suggestions for partial inputs"""
    
    completions = []
    
    # Handle tool argument completions
    if ref.get("type") == "ref/tool":
        tool_name = ref.get("name")
        arg_name = argument.get("name")
        
        if tool_name == "list_tables" and arg_name == "base_id":
            # Suggest recent base IDs
            if server_state["base_id"]:
                completions.append({
                    "value": server_state["base_id"],
                    "label": "Current base",
                    "insertText": server_state["base_id"]
                })
        
        elif tool_name == "list_records" and arg_name == "filter_formula":
            # Suggest common filter formulas
            formulas = [
                "{Status} = 'Active'",
                "NOT({Completed})",
                "AND({Priority} = 'High', {Status} = 'Open')",
                "OR({Assigned} = 'Me', {Assigned} = BLANK())",
                "DATETIME_DIFF(TODAY(), {DueDate}, 'days') < 7"
            ]
            for formula in formulas:
                if not partial or partial.lower() in formula.lower():
                    completions.append({
                        "value": formula,
                        "label": formula,
                        "insertText": formula
                    })
        
        elif tool_name in ["create_records", "update_records"] and arg_name == "records_json":
            # Suggest JSON templates
            templates = [
                '{"Name": "New Item", "Status": "Active"}',
                '[{"Name": "Item 1"}, {"Name": "Item 2"}]',
                '{"id": "rec123", "fields": {"Status": "Updated"}}'
            ]
            for template in templates:
                completions.append({
                    "value": template,
                    "label": f"Template: {template[:30]}...",
                    "insertText": template
                })
    
    return {
        "completion": {
            "values": completions[:10]  # Limit to 10 suggestions
        }
    }


# Resources list implementation
@mcp.rpc_method("resources/list")
async def resources_list() -> Dict:
    """List available Airtable resources"""
    resources = []
    
    # Add resource templates even without a base configured
    resources.append({
        "uri": "airtable://templates/base-schema",
        "name": "Base Schema Template",
        "description": "Template for creating base schemas",
        "mimeType": "application/json"
    })
    
    resources.append({
        "uri": "airtable://templates/automation-scripts",
        "name": "Automation Scripts",
        "description": "Common Airtable automation scripts",
        "mimeType": "text/javascript"
    })
    
    if server_state["base_id"]:
        # Add base resource
        resources.append({
            "uri": f"airtable://base/{server_state['base_id']}",
            "name": "Current Airtable Base",
            "description": f"Base ID: {server_state['base_id']}",
            "mimeType": "application/json"
        })
        
        # Try to add table resources if we have access
        if server_state["token"]:
            result = await api_call(f"meta/bases/{server_state['base_id']}/tables")
            if "tables" in result:
                for table in result.get("tables", []):
                    fields_count = len(table.get("fields", []))
                    resources.append({
                        "uri": f"airtable://base/{server_state['base_id']}/table/{table['name']}",
                        "name": f"Table: {table['name']}",
                        "description": f"{fields_count} fields, ID: {table['id']}",
                        "mimeType": "application/json"
                    })
    
    return {"resources": resources}


# Resources read implementation
@mcp.rpc_method("resources/read")
async def resources_read(uri: str) -> Dict:
    """Read a specific resource by URI"""
    
    # Handle template resources
    if uri == "airtable://templates/base-schema":
        return {
            "contents": [
                {
                    "uri": uri,
                    "mimeType": "application/json",
                    "text": json.dumps({
                        "tables": [
                            {
                                "name": "Projects",
                                "fields": [
                                    {"name": "Name", "type": "singleLineText"},
                                    {"name": "Status", "type": "singleSelect", "options": ["Planning", "Active", "Complete"]},
                                    {"name": "Start Date", "type": "date"},
                                    {"name": "End Date", "type": "date"},
                                    {"name": "Owner", "type": "collaborator"},
                                    {"name": "Tasks", "type": "linkedRecords"}
                                ]
                            },
                            {
                                "name": "Tasks",
                                "fields": [
                                    {"name": "Title", "type": "singleLineText"},
                                    {"name": "Description", "type": "multilineText"},
                                    {"name": "Project", "type": "linkedRecords"},
                                    {"name": "Assignee", "type": "collaborator"},
                                    {"name": "Priority", "type": "singleSelect", "options": ["Low", "Medium", "High"]},
                                    {"name": "Complete", "type": "checkbox"}
                                ]
                            }
                        ]
                    }, indent=2)
                }
            ]
        }
    
    elif uri == "airtable://templates/automation-scripts":
        return {
            "contents": [
                {
                    "uri": uri,
                    "mimeType": "text/javascript",
                    "text": """// Common Airtable Automation Scripts

// 1. Send notification when record matches condition
function notifyOnCondition(record) {
    if (record.getCellValue('Status') === 'Urgent') {
        // Send notification logic here
        console.log('Urgent task:', record.getCellValue('Name'));
    }
}

// 2. Auto-calculate fields
function calculateFields(record) {
    const startDate = record.getCellValue('Start Date');
    const endDate = record.getCellValue('End Date');
    if (startDate && endDate) {
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        return { 'Duration (days)': duration };
    }
}

// 3. Bulk update records
async function bulkUpdate(table, condition, updates) {
    const query = await table.selectRecordsAsync();
    const recordsToUpdate = query.records.filter(condition);
    
    const updatePromises = recordsToUpdate.map(record => 
        table.updateRecordAsync(record.id, updates)
    );
    
    await Promise.all(updatePromises);
}"""
                }
            ]
        }
    
    # Handle base and table resources
    elif uri.startswith("airtable://base/"):
        parts = uri.replace("airtable://base/", "").split("/table/")
        if len(parts) == 2:
            base_id, table_name = parts
            result = await get_table_resource(base_id, table_name)
            return {
                "contents": [
                    {
                        "uri": uri,
                        "mimeType": "application/json",
                        "text": json.dumps(result, indent=2)
                    }
                ]
            }
        elif len(parts) == 1:
            base_id = parts[0]
            result = await get_base_resource(base_id)
            return {
                "contents": [
                    {
                        "uri": uri,
                        "mimeType": "application/json",
                        "text": json.dumps(result, indent=2)
                    }
                ]
            }
    
    return {"error": f"Unknown resource URI: {uri}"}


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