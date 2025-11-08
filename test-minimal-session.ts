import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Minimal session manager
class MinimalSessionManager {
  createSession(userIdea: string): Promise<string> {
    return Promise.resolve(`session_${Date.now()}`);
  }

  getSession(sessionId: string): any {
    return { state: 'questioning', userIdea: 'test' };
  }

  updateSession(sessionId: string, updates: any): Promise<boolean> {
    return Promise.resolve(true);
  }
}

// Create a simplified MCP server with minimal session management
const server = new McpServer({
  name: 'minimal-kat-planner',
  version: '1.0.0',
});

const sessionManager = new MinimalSessionManager();

// Register a tool with minimal session management
server.registerTool('minimal_tool', {
  title: 'Minimal Tool',
  description: 'A tool with minimal session management',
  inputSchema: {
    userIdea: z.string().describe('The user idea'),
    mode: z.enum(['question', 'refine', 'approve']).describe('Current mode'),
    sessionId: z.string().optional().describe('Session ID')
  },
}, async (params) => {
  if (params.mode === 'question') {
    const sessionId = await sessionManager.createSession(params.userIdea);
    return {
      content: [{
        type: 'text' as const,
        text: `Question mode response with session: ${sessionId}`
      }],
      structuredContent: {
        sessionId,
        questions: ['What platform?', 'How many buttons?']
      }
    };
  }

  return {
    content: [{
      type: 'text' as const,
      text: `Response for mode: ${params.mode}`
    }],
  };
});

// Start the server
async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('Minimal MCP server started successfully!');
}

startServer().catch(console.error);