#!/usr/bin/env node

import { spawn } from 'child_process';

// Test the MCP server by sending a simple health check
const server = spawn('node', ['dist/server-production.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Send a health check request (MCP protocol format)
const healthCheckRequest = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
}) + '\n';

server.stdout.on('data', (data) => {
  console.log('Server response:', data.toString());
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

server.on('close', (code) => {
  console.log('Server exited with code:', code);
});

// Send the request after a short delay
setTimeout(() => {
  server.stdin.write(healthCheckRequest);
  console.log('Sent health check request');
}, 100);

// Keep the test running for a bit
setTimeout(() => {
  server.kill();
}, 2000);