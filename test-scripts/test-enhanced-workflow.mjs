#!/usr/bin/env node

import { McpClient } from '@modelcontextprotocol/sdk/dist/cjs/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/dist/cjs/stdio.js';
import { z } from 'zod';

async function testEnhancedWorkflow() {
  console.log('🧪 Testing Enhanced KAT-PLANNER Workflow...\n');

  // Start the server
  const transport = new StdioClientTransport(
    'node',
    ['dist/server-production.js']
  );

  const client = new McpClient(transport);
  await client.connect();

  try {
    // Test 1: Start interactive session (question mode)
    console.log('1. Starting interactive session (question mode)...');
    const questionResponse = await client.callTool('start_interactive_spec', {
      userIdea: 'A mouse button mapper that remaps mouse buttons to keyboard shortcuts',
      mode: 'question'
    });

    console.log('✅ Question response received');
    console.log('Response content:', JSON.stringify(questionResponse.content, null, 2));

    // Extract session ID from structured content
    let sessionId;
    if (questionResponse.structuredContent?.sessionId) {
      sessionId = questionResponse.structuredContent.sessionId;
    } else if (questionResponse.content?.[0]?.text) {
      const text = questionResponse.content[0].text;
      const match = text.match(/kat_\d+_\w+/);
      if (match) sessionId = match[0];
    }

    if (!sessionId) {
      console.log('❌ No session ID found in response');
      console.log('Response:', JSON.stringify(questionResponse, null, 2));
      return false;
    }

    console.log(`✅ Session ID extracted: ${sessionId}\n`);

    // Test 2: Refine requirements (clarify mode)
    console.log('2. Refining requirements (clarify mode)...');
    const refineResponse = await client.callTool('start_interactive_spec', {
      sessionId,
      mode: 'clarify',
      answers: {
        'Which mouse buttons will be remapped?': 'Buttons 4 and 5 (side buttons)',
        'Which keyboard shortcuts should they trigger?': 'Button 4 = Ctrl+C, Button 5 = Ctrl+V',
        'Should users be able to customize the mappings?': 'Yes, provide a configuration interface'
      }
    });

    console.log('✅ Refine response received');
    console.log('Response content:', JSON.stringify(refineResponse.content, null, 2));

    // Test 3: Approve requirements (approve mode)
    console.log('\n3. Approving requirements (approve mode)...');
    const approveResponse = await client.callTool('start_interactive_spec', {
      sessionId,
      mode: 'approve',
      explicitApproval: 'yes'
    });

    console.log('✅ Approve response received');
    console.log('Response content:', JSON.stringify(approveResponse.content, null, 2));

    // Test 4: Start development (development mode)
    console.log('\n4. Starting development...');
    const devResponse = await client.callTool('start_development', {
      sessionId
    });

    console.log('✅ Development response received');
    console.log('Response content:', JSON.stringify(devResponse.content, null, 2));

    // Check if SDD documents were generated
    if (devResponse.structuredContent?.sddDocuments) {
      console.log('\n✅ SDD documents generated successfully!');
      console.log('Documents:', devResponse.structuredContent.sddDocuments.map(doc => ({
        title: doc.title,
        contentLength: doc.content.length
      })));
    } else {
      console.log('\n❌ No SDD documents found in response');
    }

    console.log('\n🎉 Enhanced workflow test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await client.disconnect();
  }
}

// Run the test
testEnhancedWorkflow()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test script error:', error);
    process.exit(1);
  });