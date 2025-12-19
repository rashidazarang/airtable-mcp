#!/bin/bash

echo "🎯 COMPREHENSIVE TEST - AIRTABLE MCP v1.4.0"
echo "==========================================="
echo ""

PASSED=0
FAILED=0
TOTAL=0

# Test function
test_feature() {
    local name=$1
    local result=$2
    ((TOTAL++))
    
    if [ "$result" = "PASS" ]; then
        echo "✅ $name"
        ((PASSED++))
    else
        echo "❌ $name"
        ((FAILED++))
    fi
}

echo "📊 TESTING ALL 12 TOOLS"
echo "======================="
echo ""

# 1. List tables
result=$(curl -s -X POST http://localhost:8010/mcp -H "Content-Type: application/json" \
    -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "list_tables"}}')
if [[ "$result" == *"table"* ]]; then
    test_feature "list_tables" "PASS"
else
    test_feature "list_tables" "FAIL"
fi

# 2. Create record
result=$(curl -s -X POST http://localhost:8010/mcp -H "Content-Type: application/json" \
    -d '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "create_record", "arguments": {"table": "tblH7TnJxYpNqhQYK", "fields": {"Name": "Final Test", "Status": "Active"}}}}')
if [[ "$result" == *"Successfully created"* ]]; then
    test_feature "create_record" "PASS"
    RECORD_ID=$(echo "$result" | grep -o 'rec[a-zA-Z0-9]\{10,20\}' | head -1)
else
    test_feature "create_record" "FAIL"
    RECORD_ID=""
fi

# 3. Get record
if [ ! -z "$RECORD_ID" ]; then
    result=$(curl -s -X POST http://localhost:8010/mcp -H "Content-Type: application/json" \
        -d "{\"jsonrpc\": \"2.0\", \"id\": 3, \"method\": \"tools/call\", \"params\": {\"name\": \"get_record\", \"arguments\": {\"table\": \"tblH7TnJxYpNqhQYK\", \"recordId\": \"$RECORD_ID\"}}}")
    [[ "$result" == *"Record $RECORD_ID"* ]] && test_feature "get_record" "PASS" || test_feature "get_record" "FAIL"
else
    test_feature "get_record" "SKIP"
fi

# 4. Update record
if [ ! -z "$RECORD_ID" ]; then
    result=$(curl -s -X POST http://localhost:8010/mcp -H "Content-Type: application/json" \
        -d "{\"jsonrpc\": \"2.0\", \"id\": 4, \"method\": \"tools/call\", \"params\": {\"name\": \"update_record\", \"arguments\": {\"table\": \"tblH7TnJxYpNqhQYK\", \"recordId\": \"$RECORD_ID\", \"fields\": {\"Status\": \"Completed\"}}}}")
    [[ "$result" == *"Successfully updated"* ]] && test_feature "update_record" "PASS" || test_feature "update_record" "FAIL"
else
    test_feature "update_record" "SKIP"
fi

# 5. List records
result=$(curl -s -X POST http://localhost:8010/mcp -H "Content-Type: application/json" \
    -d '{"jsonrpc": "2.0", "id": 5, "method": "tools/call", "params": {"name": "list_records", "arguments": {"table": "tblH7TnJxYpNqhQYK", "maxRecords": 3}}}')
[[ "$result" == *"record"* ]] && test_feature "list_records" "PASS" || test_feature "list_records" "FAIL"

# 6. Search records
result=$(curl -s -X POST http://localhost:8010/mcp -H "Content-Type: application/json" \
    -d '{"jsonrpc": "2.0", "id": 6, "method": "tools/call", "params": {"name": "search_records", "arguments": {"table": "tblH7TnJxYpNqhQYK", "maxRecords": 3}}}')
[[ "$result" == *"record"* ]] && test_feature "search_records" "PASS" || test_feature "search_records" "FAIL"

# 7. Delete record
if [ ! -z "$RECORD_ID" ]; then
    result=$(curl -s -X POST http://localhost:8010/mcp -H "Content-Type: application/json" \
        -d "{\"jsonrpc\": \"2.0\", \"id\": 7, \"method\": \"tools/call\", \"params\": {\"name\": \"delete_record\", \"arguments\": {\"table\": \"tblH7TnJxYpNqhQYK\", \"recordId\": \"$RECORD_ID\"}}}")
    [[ "$result" == *"Successfully deleted"* ]] && test_feature "delete_record" "PASS" || test_feature "delete_record" "FAIL"
else
    test_feature "delete_record" "SKIP"
fi

# 8. List webhooks
result=$(curl -s -X POST http://localhost:8010/mcp -H "Content-Type: application/json" \
    -d '{"jsonrpc": "2.0", "id": 8, "method": "tools/call", "params": {"name": "list_webhooks"}}')
[[ "$result" == *"webhook"* ]] && test_feature "list_webhooks" "PASS" || test_feature "list_webhooks" "FAIL"

# 9. Create webhook
result=$(curl -s -X POST http://localhost:8010/mcp -H "Content-Type: application/json" \
    -d '{"jsonrpc": "2.0", "id": 9, "method": "tools/call", "params": {"name": "create_webhook", "arguments": {"notificationUrl": "https://webhook.site/test-final"}}}')
if [[ "$result" == *"Successfully created"* ]]; then
    test_feature "create_webhook" "PASS"
    WEBHOOK_ID=$(echo "$result" | grep -o 'ach[a-zA-Z0-9]*' | head -1)
else
    test_feature "create_webhook" "FAIL"
    WEBHOOK_ID=""
fi

# 10. Get webhook payloads
if [ ! -z "$WEBHOOK_ID" ]; then
    result=$(curl -s -X POST http://localhost:8010/mcp -H "Content-Type: application/json" \
        -d "{\"jsonrpc\": \"2.0\", \"id\": 10, \"method\": \"tools/call\", \"params\": {\"name\": \"get_webhook_payloads\", \"arguments\": {\"webhookId\": \"$WEBHOOK_ID\"}}}")
    [[ "$result" == *"payload"* ]] && test_feature "get_webhook_payloads" "PASS" || test_feature "get_webhook_payloads" "FAIL"
else
    test_feature "get_webhook_payloads" "SKIP"
fi

# 11. Refresh webhook
if [ ! -z "$WEBHOOK_ID" ]; then
    result=$(curl -s -X POST http://localhost:8010/mcp -H "Content-Type: application/json" \
        -d "{\"jsonrpc\": \"2.0\", \"id\": 11, \"method\": \"tools/call\", \"params\": {\"name\": \"refresh_webhook\", \"arguments\": {\"webhookId\": \"$WEBHOOK_ID\"}}}")
    [[ "$result" == *"refreshed"* ]] && test_feature "refresh_webhook" "PASS" || test_feature "refresh_webhook" "FAIL"
else
    test_feature "refresh_webhook" "SKIP"
fi

# 12. Delete webhook
if [ ! -z "$WEBHOOK_ID" ]; then
    result=$(curl -s -X POST http://localhost:8010/mcp -H "Content-Type: application/json" \
        -d "{\"jsonrpc\": \"2.0\", \"id\": 12, \"method\": \"tools/call\", \"params\": {\"name\": \"delete_webhook\", \"arguments\": {\"webhookId\": \"$WEBHOOK_ID\"}}}")
    [[ "$result" == *"deleted"* ]] && test_feature "delete_webhook" "PASS" || test_feature "delete_webhook" "FAIL"
else
    test_feature "delete_webhook" "SKIP"
fi

echo ""
echo "📈 FINAL RESULTS"
echo "==============="
echo "Total Tests: $TOTAL"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "Success Rate: $(( PASSED * 100 / TOTAL ))%"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo "🎉 ALL TESTS PASSED! v1.4.0 is ready for production!"
    exit 0
else
    echo ""
    echo "⚠️  $FAILED test(s) failed. Please review."
    exit 1
fi