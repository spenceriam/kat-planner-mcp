import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Create a simplified MCP server without session management
const server = new McpServer({
  name: 'simple-kat-planner',
  version: '1.0.0',
});

// Register a simple test tool
server.registerTool('simple_tool', {
  title: 'Simple Tool',
  description: 'A simple tool without session management',
  inputSchema: {
    userIdea: z.string().describe('The user idea')
  },
}, async (params) => {
  return {
    content: [{
      type: 'text' as const,
      text: `Simple response: ${params.userIdea}`
    }],
  };
});

// Start the server
async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('Simple MCP server started successfully!');
}

startServer().catch(console.error);