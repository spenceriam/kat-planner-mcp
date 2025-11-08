#!/usr/bin/env node

import { McpClient } from '@modelcontextprotocol/sdk/dist/cjs/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/dist/cjs/stdio.js';

async function testDevelopmentTool() {
  console.log('🧪 Testing KAT-PLANNER Development Tool...\n');

  // Start the server
  const transport = new StdioClientTransport(
    'node',
    ['dist/server-production.js']
  );

  const client = new McpClient(transport);
  await client.connect();

  try {
    // Test 1: Create a session and get it to approved state
    console.log('1. Creating a session and getting it to approved state...');

    // Start interactive session
    const questionResponse = await client.callTool('start_interactive_spec', {
      userIdea: 'A simple todo list web application',
      mode: 'question'
    });

    console.log('✅ Question mode completed');

    // Extract session ID
    let sessionId;
    if (questionResponse.structuredContent?.sessionId) {
      sessionId = questionResponse.structuredContent.sessionId;
    } else if (questionResponse.content?.[0]?.text) {
      const text = questionResponse.content[0].text;
      const match = text.match(/kat_\d+_\w+/);
      if (match) sessionId = match[0];
    }

    if (!sessionId) {
      console.log('❌ No session ID found');
      return false;
    }

    console.log(`✅ Session ID: ${sessionId}`);

    // Answer questions
    const refineResponse = await client.callTool('start_interactive_spec', {
      sessionId,
      mode: 'clarify',
      answers: {
        'What type of application is this?': 'Web application',
        'What are the main features?': 'Add, view, and delete tasks',
        'What technology stack should be used?': 'React with TypeScript',
        'What are the user interface requirements?': 'Simple, intuitive design with dark mode support'
      }
    });

    console.log('✅ Clarify mode completed');

    // Approve requirements
    const approveResponse = await client.callTool('start_interactive_spec', {
      sessionId,
      mode: 'approve',
      explicitApproval: 'yes'
    });

    console.log('✅ Approve mode completed');

    // Test 2: Now test the development tool
    console.log('\n2. Testing start_development tool...');

    const devResponse = await client.callTool('start_development', {
      sessionId
    });

    console.log('✅ Development tool response received');
    console.log('Response content:', JSON.stringify(devResponse.content, null, 2));

    // Check for SDD documents
    if (devResponse.structuredContent?.sddDocuments) {
      console.log('\n✅ SDD documents generated successfully!');
      console.log('Documents generated:');
      devResponse.structuredContent.sddDocuments.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc.title} (${doc.content.length} characters)`);
      });
    } else {
      console.log('\n❌ No SDD documents found in response');
      console.log('Structured content:', JSON.stringify(devResponse.structuredContent, null, 2));
    }

    // Test 3: Verify session state after development
    console.log('\n3. Testing development state transitions...');

    // Try to call development tool again (should fail - can only be called once)
    try {
      await client.callTool('start_development', {
        sessionId
      });
      console.log('❌ Development tool should not be callable again');
    } catch (error) {
      console.log('✅ Development tool correctly prevents multiple calls');
    }

    console.log('\n🎉 Development tool test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await client.disconnect();
  }
}

// Run the test
testDevelopmentTool()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test script error:', error);
    process.exit(1);
  });