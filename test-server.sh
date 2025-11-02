#!/bin/bash

# Simple MCP Server Test Script
# Demonstrates how to test KAT-PLANNER without requiring MCP client

echo "🧪 KAT-PLANNER MCP Server Testing"
echo "=================================="

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed!"
    exit 1
fi

# Run the test harness
echo "🧪 Running comprehensive test suite..."
node test-harness.mjs

if [ $? -eq 0 ]; then
    echo "🎉 All tests passed!"
    echo ""
    echo "📊 Test Summary:"
    echo "   ✅ health_check - Basic connectivity verification"
    echo "   ✅ refinement_tool - Project idea refinement"
    echo "   ✅ sdd_gen - Specification document generation"
    echo "   ✅ sdd_testing - Test specification generation"
    echo ""
    echo "🚀 The MCP server is ready for integration with Claude Code!"
else
    echo "❌ Some tests failed"
    exit 1
fi

echo "=================================="
echo "Test completed successfully!"