#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

// Test the fixed production server with tools discovery
const server = spawn('node', ['dist/server-production.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let receivedResponse = false;

// Send a tools/list request (what Zed Editor actually uses)
const toolsListRequest = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
}) + '\n';

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('Server output:', output);
  if (output.includes('jsonrpc') && output.includes('result')) {
    receivedResponse = true;
  }
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

server.on('close', (code) => {
  console.log('Server exited with code:', code);
  if (!receivedResponse) {
    console.log('❌ No response received');
  }
});

// Wait for server to start, then send request
setTimeout(1000).then(() => {
  server.stdin.write(toolsListRequest);
  console.log('Sent tools/list request');
});

// Keep running for 3 seconds to see response
setTimeout(3000).then(() => {
  server.kill();
});