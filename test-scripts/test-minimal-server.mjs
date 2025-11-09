#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createReadStream } from 'fs';

async function main() {
  const server = new McpServer({
    name: 'kat-planner-minimal',
    version: '1.0.0',
  });

  // Simple health check tool
  server.registerTool('health_check', {
    title: 'Health Check',
    description: 'Basic health check to verify server is running',
    inputSchema: {},
  }, async () => {
    return {
      content: [{
        type: 'text',
        text: 'KAT-PLANNER Minimal MCP server is running!'
      }],
    };
  });

  // Simple tools/list response
  server.registerTool('tools/list', {
    title: 'List Tools',
    description: 'List all available tools',
    inputSchema: {},
  }, async () => {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify([
          { name: 'health_check', description: 'Basic health check' },
          { name: 'tools/list', description: 'List all available tools' }
        ])
      }],
    };
  });

  await server.connect(new StdioServerTransport());
}

main().catch(console.error);