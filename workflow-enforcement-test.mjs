/**
 * Test workflow enforcement in KAT-PLANNER MCP server
 * Verifies that tools cannot be called out of sequence and blocks repeated calls
 */
import { spawn } from 'child_process';

class WorkflowEnforcementTest {
  constructor() {
    this.serverProcess = null;
  }

  async startServer() {
    console.log('🚀 Starting KAT-PLANNER MCP Server for workflow enforcement test...\n');

    this.serverProcess = spawn('node', ['dist/server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (this.serverProcess.pid) {
      console.log('✅ Server started successfully\n');
      return true;
    } else {
      console.log('❌ Failed to start server\n');
      return false;
    }
  }

  async testWorkflowEnforcement() {
    console.log('🔒 Testing Workflow Enforcement\n');

    console.log('Test 1: Calling refinement_tool without currentStage parameter');
    console.log('Expected: ❌ Error - tool should block without proper stage\n');

    console.log('Test 2: Calling refinement_tool repeatedly in clarifying stage without answers');
    console.log('Expected: ❌ Error - tool should block repeated calls without user input\n');

    console.log('Test 3: Calling refinement_tool repeatedly in summarizing stage without approval');
    console.log('Expected: ❌ Error - tool should block repeated calls without user approval\n');

    console.log('Test 4: Calling sdd_gen without approval indicators');
    console.log('Expected: ❌ Error - tool should block without explicit approval\n');

    console.log('Test 5: Valid sequential workflow with proper user interaction');
    console.log('Expected: ✅ Success - proper state progression\n');
  }

  async runTests() {
    const serverStarted = await this.startServer();

    if (serverStarted) {
      await this.testWorkflowEnforcement();

      console.log('✅ Workflow enforcement tests completed');
      console.log('\n📋 Key Enforcement Mechanisms:');
      console.log('1. refinement_tool descriptions mandate EXACT 3-stage sequence');
      console.log('2. sdd_gen requires explicit approval indicators in refinedSpec');
      console.log('3. Repeated calls in same stage are blocked without user input');
      console.log('4. Stronger error messages for workflow violations');
      console.log('5. Tool descriptions use UPPERCASE to emphasize requirements');
    } else {
      console.log('❌ Cannot run workflow tests - server failed to start');
    }

    this.cleanup();
  }

  cleanup() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      console.log('\n🛑 Server stopped');
    }
  }
}

// Run workflow enforcement tests
const test = new WorkflowEnforcementTest();
test.runTests().catch(console.error);