#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

// Test the fixed production server
const server = spawn('node', ['dist/server-production.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let receivedResponse = false;

// Send a health_check request
const healthCheckRequest = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'health_check',
  params: {}
}) + '\n';

server.stdout.on('data', (data) => {
  console.log('Server response:', data.toString());
  if (data.toString().includes('jsonrpc')) {
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
  server.stdin.write(healthCheckRequest);
  console.log('Sent health_check request');
});

// Keep running for 3 seconds to see response
setTimeout(3000).then(() => {
  server.kill();
});