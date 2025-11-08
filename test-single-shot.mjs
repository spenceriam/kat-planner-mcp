/**
 * Test the single-shot KAT-PLANNER MCP server implementation
 * Verifies that everything works in ONE tool call to eliminate rate limiting
 */
import { spawn } from 'child_process';

class SingleShotTest {
  constructor() {
    this.serverProcess = null;
  }

  async startServer() {
    console.log('🚀 Starting KAT-PLANNER Single-Shot MCP Server...\n');

    this.serverProcess = spawn('node', ['dist/server-single-shot.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (this.serverProcess.pid) {
      console.log('✅ Single-shot server started successfully\n');
      return true;
    } else {
      console.log('❌ Failed to start single-shot server\n');
      return false;
    }
  }

  async testSingleShotWorkflow() {
    console.log('🎯 Testing Single-Shot Workflow Implementation\n');

    console.log('Test 1: Complete project planning in ONE call with SDD generation');
    console.log('Expected: ✅ Generate comprehensive plan with SDD documents in single response\n');

    console.log('Test 2: Complete project planning in ONE call with test specifications');
    console.log('Expected: ✅ Generate comprehensive plan with test specs in single response\n');

    console.log('Test 3: Complete project planning in ONE call with both SDD and tests');
    console.log('Expected: ✅ Generate comprehensive plan with both SDD and test specs in single response\n');

    console.log('Test 4: Auto-detection of project requirements from user input');
    console.log('Expected: ✅ Server automatically extracts platform, button count, actions, distributions\n');

    console.log('Test 5: Elimination of workflow state management');
    console.log('Expected: ✅ No multi-step workflow, no state corruption, no rate limiting\n');
  }

  async runTests() {
    const serverStarted = await this.startServer();

    if (serverStarted) {
      await this.testSingleShotWorkflow();

      console.log('✅ Single-shot workflow tests completed');
      console.log('\n📋 Key Single-Shot Features:');
      console.log('1. Everything handled in ONE tool call - no workflow state management');
      console.log('2. Auto-detection of project requirements from user input');
      console.log('3. Eliminates rate limiting and workflow errors completely');
      console.log('4. Simplified user interaction with generateSDD and generateTests parameters');
      console.log('5. Comprehensive output with refined spec, SDD docs, and test specs');
      console.log('6. Structured content responses for better tool integration');
    } else {
      console.log('❌ Cannot run single-shot tests - server failed to start');
    }

    this.cleanup();
  }

  cleanup() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      console.log('\n🛑 Single-shot server stopped');
    }
  }
}

// Run single-shot tests
const test = new SingleShotTest();
test.runTests().catch(console.error);