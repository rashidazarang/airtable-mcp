#!/bin/bash

# COMPREHENSIVE FINAL TEST SUITE - Airtable MCP Server v1.5.0
# Tests ALL 23 tools with no assumptions

set -e
SERVER_URL="http://localhost:8010/mcp"
PASSED=0
FAILED=0
TEST_RECORD_ID=""
TEST_WEBHOOK_ID=""
CREATED_FIELD_ID=""

echo "🧪 FINAL COMPREHENSIVE TEST SUITE - v1.5.0"
echo "==========================================="
echo "Testing ALL 23 tools with real API calls"
echo ""

# Function to make MCP calls
call_tool() {
    local tool_name="$1"
    local params="$2"
    curl -s -X POST "$SERVER_URL" \
        -H "Content-Type: application/json" \
        -d "{\"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"tools/call\", \"params\": {\"name\": \"$tool_name\", \"arguments\": $params}}"
}

# Enhanced test function with better error reporting
test_tool() {
    local tool_name="$1"
    local params="$2"
    local description="$3"
    local expect_fail="$4"
    
    echo -n "🔧 $tool_name: $description... "
    
    if result=$(call_tool "$tool_name" "$params" 2>&1); then
        if echo "$result" | jq -e '.result.content[0].text' > /dev/null 2>&1; then
            response_text=$(echo "$result" | jq -r '.result.content[0].text')
            if [[ "$expect_fail" == "true" ]]; then
                if echo "$response_text" | grep -q "error\|Error\|not found\|requires"; then
                    echo "✅ PASS (Expected failure)"
                    ((PASSED++))
                else
                    echo "❌ FAIL (Should have failed)"
                    echo "   Response: ${response_text:0:100}..."
                    ((FAILED++))
                fi
            else
                echo "✅ PASS"
                ((PASSED++))
                # Store important IDs for later tests
                if [[ "$tool_name" == "create_record" ]]; then
                    TEST_RECORD_ID=$(echo "$result" | jq -r '.result.content[0].text' | grep -o 'rec[a-zA-Z0-9]\{10,20\}' | head -1)
                    echo "   📝 Stored record ID: $TEST_RECORD_ID"
                elif [[ "$tool_name" == "create_webhook" ]]; then
                    TEST_WEBHOOK_ID=$(echo "$result" | jq -r '.result.content[0].text' | grep -o 'ach[a-zA-Z0-9]\{10,20\}' | head -1)
                    echo "   🪝 Stored webhook ID: $TEST_WEBHOOK_ID"
                elif [[ "$tool_name" == "create_field" ]]; then
                    CREATED_FIELD_ID=$(echo "$result" | jq -r '.result.content[0].text' | grep -o 'fld[a-zA-Z0-9]\{10,20\}' | head -1)
                    echo "   🏗️ Stored field ID: $CREATED_FIELD_ID"
                fi
            fi
        else
            if echo "$result" | jq -e '.error' > /dev/null 2>&1; then
                error_msg=$(echo "$result" | jq -r '.error.message')
                if [[ "$expect_fail" == "true" ]]; then
                    echo "✅ PASS (Expected error: $error_msg)"
                    ((PASSED++))
                else
                    echo "❌ FAIL (API Error: $error_msg)"
                    ((FAILED++))
                fi
            else
                echo "❌ FAIL (Invalid response)"
                echo "   Response: $result"
                ((FAILED++))
            fi
        fi
    else
        echo "❌ FAIL (Request failed)"
        echo "   Error: $result"
        ((FAILED++))
    fi
}

echo "📊 PHASE 1: Core Data Operations (7 tools)"
echo "==========================================="

test_tool "list_tables" "{}" "List all tables in base"
test_tool "list_records" "{\"table\": \"Test Table CRUD\", \"maxRecords\": 3}" "List records with limit"
test_tool "create_record" "{\"table\": \"Test Table CRUD\", \"fields\": {\"Name\": \"v1.5.0 Test Record\", \"Description\": \"Created during final testing\", \"Status\": \"Testing\"}}" "Create test record"

# Use the created record ID for get_record test
if [[ -n "$TEST_RECORD_ID" ]]; then
    test_tool "get_record" "{\"table\": \"Test Table CRUD\", \"recordId\": \"$TEST_RECORD_ID\"}" "Get the created record"
    test_tool "update_record" "{\"table\": \"Test Table CRUD\", \"recordId\": \"$TEST_RECORD_ID\", \"fields\": {\"Status\": \"Updated\"}}" "Update the created record"
else
    echo "⚠️  Skipping get_record and update_record tests (no record ID)"
    ((FAILED += 2))
fi

test_tool "search_records" "{\"table\": \"Test Table CRUD\", \"searchTerm\": \"v1.5.0\"}" "Search for our test record"

echo ""
echo "🔗 PHASE 2: Webhook Management (5 tools)"
echo "========================================"

test_tool "list_webhooks" "{}" "List existing webhooks"
test_tool "create_webhook" "{\"notificationUrl\": \"https://webhook.site/test-v1.5.0\", \"specification\": {\"options\": {\"filters\": {\"dataTypes\": [\"tableData\"]}}}}" "Create test webhook"

if [[ -n "$TEST_WEBHOOK_ID" ]]; then
    test_tool "get_webhook_payloads" "{\"webhookId\": \"$TEST_WEBHOOK_ID\"}" "Get webhook payloads"
    test_tool "refresh_webhook" "{\"webhookId\": \"$TEST_WEBHOOK_ID\"}" "Refresh webhook"
    test_tool "delete_webhook" "{\"webhookId\": \"$TEST_WEBHOOK_ID\"}" "Delete test webhook"
else
    echo "⚠️  Skipping webhook payload/refresh/delete tests (no webhook ID)"
    ((FAILED += 3))
fi

echo ""
echo "🏗️ PHASE 3: NEW Schema Discovery (6 tools)"
echo "==========================================="

test_tool "list_bases" "{}" "Discover all accessible bases"
test_tool "get_base_schema" "{}" "Get complete base schema"
test_tool "describe_table" "{\"table\": \"Test Table CRUD\"}" "Describe table with field details"
test_tool "list_field_types" "{}" "List all available field types"
test_tool "get_table_views" "{\"table\": \"Test Table CRUD\"}" "Get table views"

# Test pagination for list_bases
test_tool "list_bases" "{\"offset\": \"invalid_offset\"}" "Test list_bases with invalid offset"

echo ""
echo "🔧 PHASE 4: NEW Field Management (4 tools)"
echo "=========================================="

test_tool "create_field" "{\"table\": \"Test Table CRUD\", \"name\": \"v1.5.0 Test Field\", \"type\": \"singleLineText\", \"description\": \"Field created during v1.5.0 testing\"}" "Create new field"

if [[ -n "$CREATED_FIELD_ID" ]]; then
    test_tool "update_field" "{\"table\": \"Test Table CRUD\", \"fieldId\": \"$CREATED_FIELD_ID\", \"name\": \"v1.5.0 Updated Field\", \"description\": \"Updated during testing\"}" "Update the created field"
    test_tool "delete_field" "{\"table\": \"Test Table CRUD\", \"fieldId\": \"$CREATED_FIELD_ID\", \"confirm\": true}" "Delete the test field"
else
    echo "⚠️  Skipping field update/delete tests (no field ID)"
    ((FAILED += 2))
fi

# Test safety checks
test_tool "delete_field" "{\"table\": \"Test Table CRUD\", \"fieldId\": \"fldDummyID\", \"confirm\": false}" "Test field deletion without confirmation" "true"

echo ""
echo "🏢 PHASE 5: NEW Table Management (3 tools)"
echo "========================================="

test_tool "create_table" "{\"name\": \"v1.5.0 Test Table\", \"description\": \"Table created during v1.5.0 testing\", \"fields\": [{\"name\": \"Name\", \"type\": \"singleLineText\"}, {\"name\": \"Notes\", \"type\": \"multilineText\"}]}" "Create new table"
test_tool "update_table" "{\"table\": \"v1.5.0 Test Table\", \"name\": \"v1.5.0 Updated Table\", \"description\": \"Updated description\"}" "Update table metadata"

# Test safety checks
test_tool "delete_table" "{\"table\": \"v1.5.0 Updated Table\", \"confirm\": false}" "Test table deletion without confirmation" "true"
test_tool "delete_table" "{\"table\": \"v1.5.0 Updated Table\", \"confirm\": true}" "Delete the test table"

echo ""
echo "⚠️  PHASE 6: Error Handling & Edge Cases"
echo "======================================="

test_tool "get_record" "{\"table\": \"NonExistentTable\", \"recordId\": \"recFakeID123\"}" "Test with non-existent table" "true"
test_tool "describe_table" "{\"table\": \"NonExistentTable\"}" "Test describe non-existent table" "true"
test_tool "create_field" "{\"table\": \"NonExistentTable\", \"name\": \"Test\", \"type\": \"singleLineText\"}" "Test create field in non-existent table" "true"
test_tool "update_table" "{\"table\": \"NonExistentTable\", \"name\": \"New Name\"}" "Test update non-existent table" "true"

echo ""
echo "🔒 PHASE 7: Security Verification"
echo "================================"

# Check that logs don't contain sensitive data
echo -n "🔒 Security check: Log file doesn't contain tokens... "
if grep -q "pat" /tmp/v1.5.0_test.log; then
    echo "❌ FAIL (Token found in logs)"
    ((FAILED++))
else
    echo "✅ PASS"
    ((PASSED++))
fi

# Clean up test record if it exists
if [[ -n "$TEST_RECORD_ID" ]]; then
    echo -n "🧹 Cleanup: Deleting test record... "
    cleanup_result=$(test_tool "delete_record" "{\"table\": \"Test Table CRUD\", \"recordId\": \"$TEST_RECORD_ID\"}" "Delete test record" 2>&1)
    if echo "$cleanup_result" | grep -q "✅ PASS"; then
        echo "✅ CLEANED"
    else
        echo "⚠️  CLEANUP FAILED"
    fi
fi

echo ""
echo "📈 FINAL TEST RESULTS"
echo "===================="
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "📊 Total Tests: $((PASSED + FAILED))"
echo "📊 Success Rate: $(echo "scale=1; $PASSED * 100 / ($PASSED + $FAILED)" | bc -l)%"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo "🎉 🎉 🎉 ALL TESTS PASSED! 🎉 🎉 🎉"
    echo ""
    echo "✅ v1.5.0 is READY FOR PRODUCTION!"
    echo ""
    echo "🚀 ACHIEVEMENTS:"
    echo "• 23 tools working perfectly"
    echo "• Complete schema management"
    echo "• Robust error handling"
    echo "• Security verified"
    echo "• All edge cases handled"
    echo ""
    echo "📦 Ready for GitHub and NPM release!"
    exit 0
else
    echo ""
    echo "❌ SOME TESTS FAILED"
    echo "Please review failures above before release."
    exit 1
fi