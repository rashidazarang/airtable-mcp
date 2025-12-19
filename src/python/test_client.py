#!/usr/bin/env python3
"""
Simple test client for Airtable MCP
"""
import asyncio
import json
import os
import sys
import time
from typing import Dict, Any
from urllib.parse import quote

# Load credentials from environment variables
TOKEN = os.environ.get('AIRTABLE_TOKEN', 'YOUR_AIRTABLE_TOKEN_HERE')
BASE_ID = os.environ.get('AIRTABLE_BASE_ID', 'YOUR_BASE_ID_HERE')

if TOKEN == 'YOUR_AIRTABLE_TOKEN_HERE' or BASE_ID == 'YOUR_BASE_ID_HERE':
    print("Error: Please set AIRTABLE_TOKEN and AIRTABLE_BASE_ID environment variables")
    print("Example: export AIRTABLE_TOKEN=your_token_here")
    print("         export AIRTABLE_BASE_ID=your_base_id_here")
    sys.exit(1)

# Validate BASE_ID format to prevent injection
if not all(c.isalnum() or c in '-_' for c in BASE_ID):
    print(f"Error: Invalid BASE_ID format: {BASE_ID}")
    print("BASE_ID should only contain alphanumeric characters, hyphens, and underscores")
    sys.exit(1)

# Validate TOKEN format (basic check)
if not TOKEN or len(TOKEN) < 10:
    print("Error: Invalid AIRTABLE_TOKEN format")
    sys.exit(1)

# Helper function to directly make Airtable API calls
def api_call(endpoint, token=None):
    """Make a direct Airtable API call to test API access
    
    Args:
        endpoint: The API endpoint path (will be validated)
        token: The API token (will use global TOKEN if not provided)
    """
    import requests
    from urllib.parse import quote
    
    # Use global token if not provided
    if token is None:
        token = TOKEN
    
    # Validate and sanitize the endpoint to prevent injection
    if not isinstance(endpoint, str):
        raise ValueError("Endpoint must be a string")
    
    # Remove any potentially dangerous characters and validate format
    # Airtable endpoints should only contain alphanumeric, /, -, and _
    if not all(c.isalnum() or c in '/-_' for c in endpoint):
        raise ValueError(f"Invalid endpoint format: {endpoint}")
    
    # Additional validation: no double slashes, no dots (path traversal)
    if '//' in endpoint or '..' in endpoint:
        raise ValueError(f"Invalid endpoint format: {endpoint}")
    
    # Validate token format
    if not token or not isinstance(token, str) or len(token) < 10:
        raise ValueError("Invalid token format")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Use proper URL construction to prevent injection
    # Each part is validated separately
    base_url = "https://api.airtable.com/v0"
    # Remove leading/trailing slashes and construct safely
    clean_endpoint = endpoint.strip('/')
    url = f"{base_url}/{clean_endpoint}"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"API error: {str(e)}")
        return {"error": str(e)}

async def main():
    # Instead of using the MCP, let's directly test the Airtable API
    print("Testing direct API access...")
    
    # List bases
    print("\nListing bases:")
    result = api_call("meta/bases")
    if "error" in result:
        print(f"Error: {result['error']}")
    else:
        bases = result.get("bases", [])
        for i, base in enumerate(bases):
            print(f"{i+1}. {base['name']} (ID: {base['id']})")
    
    # List tables in the specified base
    # Construct endpoint safely without string interpolation vulnerabilities
    print(f"\nListing tables in base {BASE_ID}:")
    # BASE_ID is already validated, but we'll construct the path safely
    endpoint = "meta/bases/" + BASE_ID + "/tables"
    result = api_call(endpoint)
    if "error" in result:
        print(f"Error: {result['error']}")
    else:
        tables = result.get("tables", [])
        for i, table in enumerate(tables):
            print(f"{i+1}. {table['name']} (ID: {table['id']}, Fields: {len(table.get('fields', []))})")
            # Print fields
            print("   Fields:")
            for field in table.get('fields', []):
                print(f"   - {field['name']} ({field['type']})")

if __name__ == "__main__":
    asyncio.run(main()) 