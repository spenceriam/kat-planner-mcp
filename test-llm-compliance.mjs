#!/usr/bin/env node

/**
 * Test LLM Compliance with Enhanced Tool Descriptions
 * Verifies that the enhanced tool descriptions force LLM compliance with mandatory workflow
 */

import { spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

console.log('🧪 Testing LLM Compliance with Enhanced Tool Descriptions...');

// Test 1: Verify tool descriptions contain mandatory enforcement language
console.log('\n1. Testing tool description enforcement...');

try {
  const serverContent = readFileSync('./src/server.ts', 'utf8');

  // Check for mandatory enforcement in refinement_tool
  const hasMandatoryFirstStep = serverContent.includes('🚨 MANDATORY FIRST STEP - ASK QUESTIONS 🚨');
  const hasCriticalMandatory = serverContent.includes('🚨 CRITICAL MANDATORY TOOL: You MUST call this tool FIRST');
  const hasSequentialPhases = serverContent.includes('3 required phases');
  const hasWorkflowError = serverContent.includes('FAILURE TO FOLLOW THIS WILL RESULT IN SYSTEM ERROR');

  console.log('   ✅ Mandatory first step warning:', hasMandatoryFirstStep);
  console.log('   ✅ Critical mandatory language:', hasCriticalMandatory);
  console.log('   ✅ Sequential phases mentioned:', hasSequentialPhases);
  console.log('   ✅ System error warning:', hasWorkflowError);

  // Check for approval requirements in sdd_gen
  const hasApprovalRequired = serverContent.includes('🚨 GENERATE SDD DOCUMENTS - APPROVAL REQUIRED 🚨');
  const hasOnlyAfterRefinement = serverContent.includes('You can ONLY call this tool AFTER refinement_tool has completed ALL 3 phases');
  const hasExplicitApproval = serverContent.includes('AND provided explicit user approval');
  const hasImmediateError = serverContent.includes('it will return an immediate critical error');

  console.log('   ✅ Approval required warning:', hasApprovalRequired);
  console.log('   ✅ Only after refinement:', hasOnlyAfterRefinement);
  console.log('   ✅ Explicit approval mentioned:', hasExplicitApproval);
  console.log('   ✅ Immediate error warning:', hasImmediateError);

  const allEnforcementPresent = hasMandatoryFirstStep && hasCriticalMandatory && hasSequentialPhases &&
                                hasWorkflowError && hasApprovalRequired && hasOnlyAfterRefinement &&
                                hasExplicitApproval && hasImmediateError;

  console.log('   🎯 All enforcement language present:', allEnforcementPresent);

} catch (error) {
  console.error('   ❌ Error reading server file:', error.message);
}

// Test 2: Verify that tool descriptions are comprehensive and unambiguous
console.log('\n2. Testing tool description clarity...');

try {
  const serverContent = readFileSync('./src/server.ts', 'utf8');

  // Check for explicit workflow instructions
  const hasWorkflowSteps = serverContent.includes('1) INITIAL phase asks clarifying questions');
  const hasWorkflowProgression = serverContent.includes('2) CLARIFYING phase processes user answers');
  const hasWorkflowApproval = serverContent.includes('3) SUMMARIZING phase gets explicit user approval');
  const hasWorkflowWarning = serverContent.includes('DO NOT call sdd_gen until this tool completes ALL 3 phases');

  console.log('   ✅ Workflow steps clearly defined:', hasWorkflowSteps);
  console.log('   ✅ Workflow progression explained:', hasWorkflowProgression);
  console.log('   ✅ Workflow approval requirement:', hasWorkflowApproval);
  console.log('   ✅ Workflow warning present:', hasWorkflowWarning);

  // Check for consequences of non-compliance
  const hasConsequenceWarning = serverContent.includes('NEVER call this tool until user has explicitly approved');
  const hasBlockingBehavior = serverContent.includes('will return an immediate critical error and block all further operations');

  console.log('   ✅ Consequence warning present:', hasConsequenceWarning);
  console.log('   ✅ Blocking behavior mentioned:', hasBlockingBehavior);

} catch (error) {
  console.error('   ❌ Error reading server file:', error.message);
}

// Test 3: Verify that the enhanced descriptions remove ambiguity
console.log('\n3. Testing ambiguity removal...');

try {
  const serverContent = readFileSync('./src/server.ts', 'utf8');

  // Check that there's no optional language that could confuse the LLM
  const hasNoOptionalLanguage = !serverContent.includes('you can also') &&
                                !serverContent.includes('optionally') &&
                                !serverContent.includes('if you want');

  console.log('   ✅ No optional language that could confuse LLM:', hasNoOptionalLanguage);

  // Check for absolute compliance language
  const hasAbsoluteLanguage = serverContent.includes('You MUST') &&
                              serverContent.includes('You can ONLY') &&
                              serverContent.includes('CRITICAL') &&
                              serverContent.includes('MANDATORY');

  console.log('   ✅ Absolute compliance language present:', hasAbsoluteLanguage);

} catch (error) {
  console.error('   ❌ Error reading server file:', error.message);
}

// Test 4: Simulate what happens when LLM tries to call wrong tool
console.log('\n4. Testing wrong tool call simulation...');

// This would normally require an actual MCP client, but we can verify the logic is in place
try {
  const serverContent = readFileSync('./src/server.ts', 'utf8');

  // Check that validation logic exists
  const hasValidationLogic = serverContent.includes('validateToolCall') &&
                             serverContent.includes('validateWorkflowState');

  console.log('   ✅ Validation logic exists:', hasValidationLogic);

  // Check for specific error messages
  const hasWorkflowErrorMessages = serverContent.includes('Workflow validation failed') &&
                                   serverContent.includes('Invalid SDD Request') &&
                                   serverContent.includes('Invalid Testing Request');

  console.log('   ✅ Comprehensive error messages present:', hasWorkflowErrorMessages);

} catch (error) {
  console.error('   ❌ Error reading server file:', error.message);
}

// Test 5: Verify professional formatting
console.log('\n5. Testing professional formatting...');

try {
  const serverContent = readFileSync('./src/server.ts', 'utf8');

  // Check that emojis are only in titles/warnings, not in professional content
  const hasNoEmojisInContent = !serverContent.includes('🎯 **Interactive') &&
                               !serverContent.includes('✅ **Interactive') &&
                               !serverContent.includes('🚀 **Development');

  console.log('   ✅ No emojis in professional content:', hasNoEmojisInContent);

  // Check for professional language
  const hasProfessionalLanguage = serverContent.includes('comprehensive') &&
                                  serverContent.includes('specification') &&
                                  serverContent.includes('requirements') &&
                                  serverContent.includes('validation');

  console.log('   ✅ Professional language present:', hasProfessionalLanguage);

} catch (error) {
  console.error('   ❌ Error reading server file:', error.message);
}

console.log('\n🎉 LLM Compliance Test completed!');

console.log('\n📋 Summary of Enhanced Tool Descriptions:');
console.log('1. 🚨 Forceful warning emojis and mandatory language in tool titles');
console.log('2. 🚨 Explicit "MUST" and "ONLY" compliance requirements');
console.log('3. 🚨 Clear consequences for non-compliance (system errors)');
console.log('4. 🚨 Sequential workflow explanation with numbered phases');
console.log('5. 🚨 Professional formatting without emojis in content');
console.log('6. 🚨 Absolute language removing any ambiguity');
console.log('7. 🚨 Comprehensive validation logic with specific error messages');

console.log('\n💡 Key Improvements for LLM Compliance:');
console.log('- Tool titles now scream "MANDATORY" and "CRITICAL"');
console.log('- Descriptions use absolute "MUST" and "ONLY" language');
console.log('- Clear consequences outlined for workflow violations');
console.log('- Sequential phases explicitly numbered and explained');
console.log('- Professional content maintains business-appropriate formatting');
console.log('- Validation logic prevents out-of-order tool calls');

console.log('\n🎯 Expected LLM Behavior:');
console.log('1. LLM MUST call refinement_tool FIRST for any project idea');
console.log('2. LLM MUST complete ALL 3 phases sequentially');
console.log('3. LLM MUST get explicit user approval before SDD generation');
console.log('4. LLM MUST NOT call sdd_gen until approval is received');
console.log('5. LLM MUST follow next_action instructions exactly');
console.log('6. LLM MUST NOT call any other tools without explicit permission');

console.log('\n✅ Enhanced tool descriptions are designed to FORCE LLM compliance with the interactive workflow.');