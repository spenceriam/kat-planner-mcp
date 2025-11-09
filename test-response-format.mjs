#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

console.log('Testing KAT-PLANNER MCP server response format...\\n');

// Start the production server
const server = spawn('node', ['dist/server-production.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let serverReady = false;

// Monitor server output
server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('SERVER OUTPUT:', output.trim());
});

server.stderr.on('data', (data) => {
  const error = data.toString();
  console.error('ERROR:', error.trim());
});

server.on('close', (code) => {
  console.log(`\\nServer exited with code: ${code}`);
});

// Wait for server to start
await setTimeout(2000);

if (!serverReady) {
  console.log('❌ Server not ready after 2 seconds');
  server.kill();
  process.exit(1);
}

// Test just the question mode to see the response format
console.log('\\nTesting question mode response format...');

const questionRequest = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'start_interactive_spec',
    arguments: {
      userIdea: 'Linux mouse button mapping application',
      mode: 'question'
    }
  }
}) + '\\n';

server.stdin.write(questionRequest);

await setTimeout(2000);
server.kill();