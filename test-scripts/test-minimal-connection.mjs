#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

// Test minimal MCP server
const server = spawn('node', ['test-minimal-server.mjs'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let receivedResponse = false;

// Send a tools/list request
const toolsListRequest = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
}) + '\n';

server.stdout.on('data', (data) => {
  console.log('Server response:', data.toString());
  receivedResponse = true;
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

// Send the request after a short delay
setTimeout(100).then(() => {
  server.stdin.write(toolsListRequest);
  console.log('Sent tools/list request');
});

// Keep the test running for a bit
setTimeout(2000).then(() => {
  server.kill();
});