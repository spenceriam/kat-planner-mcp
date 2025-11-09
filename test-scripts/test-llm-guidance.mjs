#!/usr/bin/env node

import { ProductionKatPlannerServer } from './dist/server-production.js';
import { ProductionSessionManager } from './dist/session-manager.js';

/**
 * Test to verify the LLM guidance fix works correctly
 */
async function testLLMGuidanceFix() {
  console.log('🧪 Testing LLM Guidance Fix...\n');

  // Test the response formatting with more directive instructions
  const server = new ProductionKatPlannerServer();
  await server.start();

  // Test question mode response
  console.log('1. Testing question mode response formatting...');
  const questionResponse = await server['handleInteractiveWorkflow']({
    userIdea: 'Test project',
    mode: 'question'
  });

  console.log('Response content:');
  console.log(JSON.stringify(questionResponse, null, 2));

  // Verify the response includes directive instructions
  if (questionResponse.next_action && questionResponse.llm_directive) {
    console.log('✅ Directive instructions are present');
    console.log('Next action:', questionResponse.next_action);
    console.log('LLM directive:', questionResponse.llm_directive);
  } else {
    console.log('❌ Directive instructions are missing');
  }

  // Test refine mode response
  console.log('\n2. Testing refine mode response formatting...');
  const refineResponse = await server['handleInteractiveWorkflow']({
    userIdea: 'Test project',
    mode: 'refine',
    sessionId: questionResponse.sessionId,
    userAnswers: {
      'Question 1': 'Answer 1',
      'Question 2': 'Answer 2'
    }
  });

  console.log('Response content:');
  console.log(JSON.stringify(refineResponse, null, 2));

  // Verify the response includes directive instructions
  if (refineResponse.next_action && refineResponse.llm_directive) {
    console.log('✅ Directive instructions are present');
    console.log('Next action:', refineResponse.next_action);
    console.log('LLM directive:', refineResponse.llm_directive);
  } else {
    console.log('❌ Directive instructions are missing');
  }

  console.log('\n🎉 LLM Guidance Fix Test completed!');
  console.log('\nKey improvements:');
  console.log('1. More forceful next_action messages with🚨 and ✅ emojis');
  console.log('2. Explicit "DO NOT CALL ANY OTHER TOOLS" instructions');
  console.log('3. Added llm_directive field with clear warning');
  console.log('4. Enhanced visual cues for completion states');
}

// Run the test
testLLMGuidanceFix().catch(console.error);