/**
 * Demonstration of proper KAT-PLANNER MCP workflow
 * Shows how the tools should be used in sequence with user interaction
 */
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class WorkflowDemo {
  constructor() {
    this.serverProcess = null;
    this.conversationState = {
      currentStage: 'initial',
      answers: {},
      refinedSpec: null,
      projectType: 'mouse-button-mapper'
    };
  }

  async startServer() {
    console.log('🚀 Starting KAT-PLANNER MCP Server...\n');

    // Start the MCP server
    this.serverProcess = spawn('node', ['src/server.js'], {
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

  async demonstrateProperWorkflow() {
    console.log('🎯 Demonstrating Proper MCP Workflow\n');
    console.log('This shows how the tools should be used in sequence:\n');

    // Step 1: Initial refinement - asking questions
    console.log('Step 1: Initial Refinement (currentStage: "initial")');
    console.log('LLM should ask user questions about their project requirements...\n');

    // Simulate user providing initial idea
    const initialIdea = {
      userIdea: 'Build a Linux mouse button mapper that detects mouse buttons and maps them to OS actions like workspace switching',
      currentStage: 'initial'
    };

    console.log('User provides initial idea:', initialIdea.userIdea);
    console.log('LLM calls refinement_tool with currentStage: "initial"\n');

    // Step 2: User answers questions
    console.log('Step 2: User Answers Questions');
    console.log('User responds with their preferences:\n');
    console.log('- Platform: Python (for better Linux integration)');
    console.log('- Button Support: 5+ buttons (for gaming mice)');
    console.log('- Actions: Workspace switching, browser navigation, volume control');
    console.log('- Distribution: Ubuntu focus with cross-distribution compatibility\n');

    const userAnswers = {
      userIdea: 'Platform: Python, Button Support: 5+ buttons, Actions: workspace switching, browser navigation, volume control, Distribution: Ubuntu focus',
      currentStage: 'clarifying',
      answers: {
        platform: 'python',
        buttonCount: '5+',
        actions: 'workspace_switching, browser_navigation, volume_control'
      }
    };

    console.log('LLM calls refinement_tool with currentStage: "clarifying" and user answers\n');

    // Step 3: Summary and approval
    console.log('Step 3: Summary and User Approval');
    console.log('LLM presents refined specification summary and asks for approval...\n');

    const approvalResponse = {
      userIdea: 'yes',
      currentStage: 'summarizing',
      answers: userAnswers.answers
    };

    console.log('User approves the summary: "yes"');
    console.log('LLM calls refinement_tool with currentStage: "summarizing"\n');

    // Step 4: SDD Generation
    console.log('Step 4: SDD Generation');
    console.log('Now that requirements are refined and approved, generate SDD...\n');

    const sddRequest = {
      refinedSpec: 'Linux Mouse Button Mapper - Python application with real-time mouse detection, configurable button mapping, system tray interface, supporting 5+ buttons with actions like workspace switching, browser navigation, volume control',
      projectType: 'mouse-button-mapper'
    };

    console.log('LLM calls sdd_gen with refined specification');
    console.log('Server generates actual documents: requirements.md, design.md, tasks.md\n');

    // Step 5: Testing Specifications (optional)
    console.log('Step 5: Testing Specifications (Optional)');
    console.log('LLM asks if user wants comprehensive test specifications...\n');

    const testingRequest = {
      specDocuments: 'requirements.md, design.md, tasks.md'
    };

    console.log('User responds: "yes"');
    console.log('LLM calls sdd_testing to generate test cases and validation criteria\n');

    console.log('✅ Workflow Complete!');
    console.log('\nKey Points:');
    console.log('1. Tools must be called in proper sequence');
    console.log('2. User interaction is required between stages');
    console.log('3. currentStage parameter guides the conversation flow');
    console.log('4. SDD generation only happens after refinement is complete');
    console.log('5. Testing is optional and user-initiated');
  }

  async demonstrateCommonMistakes() {
    console.log('\n❌ Common Mistakes to Avoid\n');

    console.log('Mistake 1: Skipping refinement stage');
    console.log('❌ LLM immediately calls sdd_gen with raw user input');
    console.log('❌ No questions asked, no user answers collected');
    console.log('❌ Results in generic, low-quality specifications\n');

    console.log('Mistake 2: Wrong currentStage parameter');
    console.log('❌ Using default "initial" for all calls');
    console.log('❌ Not updating state based on user responses');
    console.log('❌ Breaks the conversational flow\n');

    console.log('Mistake 3: No approval stage');
    console.log('❌ LLM assumes user approval without confirmation');
    console.log('❌ Proceeds to SDD generation without validated requirements');
    console.log('❌ Can lead to misaligned project specifications\n');

    console.log('Mistake 4: Missing user interaction');
    console.log('❌ LLM calls all tools in rapid succession');
    console.log('❌ No waiting for user responses between stages');
    console.log('❌ Results in poor user experience and inaccurate requirements\n');
  }

  async runDemo() {
    const serverStarted = await this.startServer();

    if (serverStarted) {
      await this.demonstrateProperWorkflow();
      await this.demonstrateCommonMistakes();
    } else {
      console.log('Cannot run demo - server failed to start');
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

// Run the demo
const demo = new WorkflowDemo();
demo.runDemo().catch(console.error);