#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

// Test MCP server connection with proper initialization
const server = spawn('node', ['dist/server-production.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let receivedResponse = false;
let serverReady = false;

// Wait for server to be ready
server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('Server output:', output);
  if (output.includes('server is running') || output.includes('MCP server')) {
    serverReady = true;
  }
  if (output.includes('jsonrpc')) {
    receivedResponse = true;
  }
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

server.on('close', (code) => {
  console.log('Server exited with code:', code);
  if (!receivedResponse) {
    console.log('❌ No response received - server likely timed out');
  }
});

// Wait for server to be ready, then send request
async function testServer() {
  // Wait up to 3 seconds for server to be ready
  for (let i = 0; i < 30; i++) {
    if (serverReady) {
      console.log('✅ Server is ready');
      break;
    }
    await setTimeout(100);
  }

  if (!serverReady) {
    console.log('❌ Server not ready within timeout');
    server.kill();
    return;
  }

  // Send a tools/list request
  const toolsListRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  }) + '\n';

  server.stdin.write(toolsListRequest);
  console.log('Sent tools/list request');

  // Wait for response
  for (let i = 0; i < 50; i++) {
    if (receivedResponse) {
      console.log('✅ Received response from server');
      break;
    }
    await setTimeout(100);
  }

  if (!receivedResponse) {
    console.log('❌ No response received within timeout');
  }

  server.kill();
}

testServer().catch(console.error);