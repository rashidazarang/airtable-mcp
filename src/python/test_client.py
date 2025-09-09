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

# Helper function to directly make Airtable API calls
def api_call(endpoint, token=TOKEN):
    """Make a direct Airtable API call to test API access"""
    import requests
    
    # Validate and sanitize the endpoint to prevent injection
    if not isinstance(endpoint, str):
        raise ValueError("Endpoint must be a string")
    
    # Remove any potentially dangerous characters and validate format
    # Airtable endpoints should only contain alphanumeric, /, -, and _
    if not all(c.isalnum() or c in '/-_' for c in endpoint):
        raise ValueError(f"Invalid endpoint format: {endpoint}")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Use proper URL construction to prevent injection
    base_url = "https://api.airtable.com/v0"
    url = f"{base_url}/{endpoint.lstrip('/')}"
    
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
    print(f"\nListing tables in base {BASE_ID}:")
    result = api_call(f"meta/bases/{BASE_ID}/tables")
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