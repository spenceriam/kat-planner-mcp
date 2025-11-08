#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

console.log('Testing basic MCP server functionality...\\n');

// Start the production server
const server = spawn('node', ['dist/server-production.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let receivedResponse = false;

// Monitor server output
server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('SERVER OUTPUT:', output.trim());

  // Check for MCP protocol responses
  if (output.includes('jsonrpc')) {
    receivedResponse = true;
    console.log('✅ Received MCP protocol response');
  }
});

server.stderr.on('data', (data) => {
  const error = data.toString();
  console.error('ERROR:', error.trim());
});

server.on('close', (code) => {
  console.log(`\\nServer exited with code: ${code}`);
  if (!receivedResponse) {
    console.log('❌ No MCP protocol responses received');
  }
});

// Wait for server to start
await setTimeout(2000);

console.log('\\nSending tools/list request...');

// Send tools/list request (what Zed Editor should do)
const toolsListRequest = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
}) + '\\n';

server.stdin.write(toolsListRequest);

await setTimeout(3000);
server.kill();