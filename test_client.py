#!/usr/bin/env python3
"""
Simple test client for Airtable MCP
"""
import asyncio
import json
import sys
import subprocess
import time
from typing import Dict, Any

# Define the token and base ID
TOKEN = "patnWSCSCmnsqeQ4I.2a3603372f6df67e51f9fe553012192019f2d81c3eab0f94ebd702d7fb63e338"
BASE_ID = "appi7fWMQcB3BNzPs"

# Helper function to directly make Airtable API calls
def api_call(endpoint, token=TOKEN):
    """Make a direct Airtable API call to test API access"""
    import requests
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    url = f"https://api.airtable.com/v0/{endpoint}"
    
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