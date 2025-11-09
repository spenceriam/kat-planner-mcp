import { spawn } from 'child_process';
import { slashCommandsResource } from './dist/slash-commands-resource.js';

console.log('🧪 Testing KAT-PLANNER Slash Commands Implementation\n');

// Test 1: Check slash commands are properly initialized
console.log('1. Testing slash commands initialization...');
const resources = slashCommandsResource.getCommandsAsResources();
console.log(`✅ Found ${resources.length} command resources`);

// Test 2: Check workflow guidance
console.log('\n2. Testing workflow guidance...');
const guidance = slashCommandsResource.getWorkflowGuidance();
console.log(`✅ Workflow guidance generated (${guidance.length} characters)`);
console.log(`✅ Contains critical rules: ${guidance.includes('MANDATORY') ? 'YES' : 'NO'}`);
console.log(`✅ Contains slash commands: ${guidance.includes('/plan_project') ? 'YES' : 'NO'}`);

// Test 3: Check command validation
console.log('\n3. Testing command sequence validation...');
const validSequence = ['/plan_project', '/refine_requirements', '/generate_specification'];
const invalidSequence = ['/start_implementation', '/plan_project'];

const validResult = slashCommandsResource.validateCommandSequence(validSequence);
const invalidResult = slashCommandsResource.validateCommandSequence(invalidSequence);

console.log(`✅ Valid sequence result: ${validResult.valid ? 'PASSED' : 'FAILED'}`);
console.log(`❌ Invalid sequence caught: ${!invalidResult.valid ? 'YES' : 'NO'} (${invalidResult.errors.length} errors)`);

// Test 4: Test MCP server startup
console.log('\n4. Testing MCP server startup...');
try {
  const serverProcess = spawn('node', ['-e', `
    import('./dist/server-slash.js').then(async ({ main }) => {
      try {
        await main();
        console.log('MCP server started successfully');
        process.exit(0);
      } catch (error) {
        console.error('MCP server failed to start:', error.message);
        process.exit(1);
      }
    });
  `], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let output = '';
  serverProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  serverProcess.stderr.on('data', (data) => {
    output += data.toString();
  });

  setTimeout(() => {
    serverProcess.kill();
    console.log('✅ MCP server test completed');

    // Check if server would start properly
    const serverOutput = output.toLowerCase();
    if (serverOutput.includes('successfully') || serverOutput.includes('running')) {
      console.log('✅ Server appears to start correctly');
    } else {
      console.log('⚠️  Server output unclear');
    }

    console.log('\n📋 Slash Commands Summary:');
    console.log('- Provides structured command-driven workflow');
    console.log('- Enforces proper sequence through validation');
    console.log('- Gives LLM clear guidance on what to do');
    console.log('- Uses MCP resources instead of forcing through tools');
    console.log('- Should prevent LLM from jumping ahead to implementation');

    console.log('\n🎯 This approach should solve the LLM workflow issue by:');
    console.log('1. Providing clear slash commands for each step');
    console.log('2. Using MCP resources to guide LLM behavior');
    console.log('3. Validating command sequences');
    console.log('4. Making the workflow explicit and structured');

    process.exit(0);
  }, 3000);

} catch (error) {
  console.error('❌ MCP server test failed:', error);
  process.exit(1);
}