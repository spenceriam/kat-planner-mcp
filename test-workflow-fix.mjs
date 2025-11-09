#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

console.log('Testing KAT-PLANNER MCP server workflow...\\n');

// Start the production server
const server = spawn('node', ['dist/server-production.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let serverReady = false;
let sessionId = null;

// Monitor server output
server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('SERVER:', output.trim());

  // Check if server started successfully
  if (output.includes('KAT-PLANNER Production MCP server started successfully')) {
    serverReady = true;
    console.log('✅ Server is ready for MCP requests\\n');
  }

  // Look for session ID in responses
  if (output.includes('sessionId')) {
    const match = output.match(/"sessionId":"([^"]+)"/);
    if (match) {
      sessionId = match[1];
      console.log(`✅ Extracted session ID: ${sessionId}\\n`);
    }
  }
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

// Test the complete workflow
console.log('Testing complete interactive workflow...\\n');

// Step 1: Start interactive session (question mode)
console.log('1. Starting interactive session (question mode)...');
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

await setTimeout(1000);

// Step 2: Refine with answers (refine mode)
if (sessionId) {
  console.log('2. Refining with user answers (refine mode)...');
  const refineRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'start_interactive_spec',
      arguments: {
        sessionId: sessionId,
        mode: 'refine',
        userAnswers: {
          platform: 'Python',
          buttonCount: '6-8 programmable buttons',
          actions: 'workspace_left, workspace_right, volume_up, volume_down',
          distribution: 'Ubuntu/Debian',
          advancedFeatures: 'hot-plug detection, multiple profiles, system tray'
        }
      }
    }
  }) + '\\n';

  server.stdin.write(refineRequest);

  await setTimeout(1000);

  // Step 3: Approve the specification (approve mode)
  console.log('3. Approving the specification (approve mode)...');
  const approveRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'start_interactive_spec',
      arguments: {
        sessionId: sessionId,
        mode: 'approve',
        explicitApproval: 'yes'
      }
    }
  }) + '\\n';

  server.stdin.write(approveRequest);

  await setTimeout(1000);

  // Step 4: Start development
  console.log('4. Starting development (development mode)...');
  const developmentRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'start_development',
      arguments: {
        sessionId: sessionId
      }
    }
  }) + '\\n';

  server.stdin.write(developmentRequest);

} else {
  console.log('❌ No session ID extracted from question response');
}

await setTimeout(3000);
server.kill();