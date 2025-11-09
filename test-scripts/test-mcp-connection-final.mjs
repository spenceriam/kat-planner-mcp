#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

console.log('Testing KAT-PLANNER MCP server connection...\n');

// Start your production server
const server = spawn('node', ['dist/server-production.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let serverReady = false;
let receivedToolsList = false;

// Monitor server output
server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('SERVER:', output.trim());

  // Check if server started successfully
  if (output.includes('KAT-PLANNER Production MCP server started successfully')) {
    serverReady = true;
    console.log('✅ Server is ready for MCP requests\n');
  }

  // Check for MCP protocol responses
  if (output.includes('"jsonrpc":"2.0"')) {
    receivedToolsList = true;
    console.log('✅ Received MCP protocol response\n');
  }
});

server.stderr.on('data', (data) => {
  const error = data.toString();
  console.error('ERROR:', error.trim());
});

server.on('close', (code) => {
  console.log(`\nServer exited with code: ${code}`);
  if (!serverReady) {
    console.log('❌ Server never became ready');
  }
  if (!receivedToolsList) {
    console.log('❌ No MCP protocol responses received');
  }
});

// Wait for server to start
await setTimeout(2000);

if (!serverReady) {
  console.log('❌ Server not ready after 2 seconds');
  server.kill();
  process.exit(1);
}

console.log('Sending tools/list request...\n');

// Send tools/list request (what Zed Editor should do)
const toolsListRequest = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
}) + '\n';

server.stdin.write(toolsListRequest);

// Wait for response
await setTimeout(3000);

if (!receivedToolsList) {
  console.log('❌ No tools/list response received - MCP server not working properly');
  console.log('This explains why Zed Editor is ignoring your MCP server');
} else {
  console.log('✅ MCP server is responding to tool discovery');
}

server.kill();