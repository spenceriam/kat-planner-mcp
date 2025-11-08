import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Create a minimal MCP server
const server = new McpServer({
  name: 'test-server',
  version: '1.0.0',
});

// Register a simple test tool
server.registerTool('test_tool', {
  title: 'Test Tool',
  description: 'A simple test tool',
  inputSchema: {
    message: z.string().describe('The message to return')
  },
}, async (params) => {
  return {
    content: [{
      type: 'text' as const,
      text: `Test response: ${params.message}`
    }],
  };
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
console.log('Test MCP server started successfully!');