import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

/**
 * KAT-PLANNER MCP Server
 * Implements the core server functionality with proper tool registration
 */
export class KatPlannerServer {
  private server = new McpServer({
    name: 'kat-planner',
    version: '1.0.0',
  });

  /**
   * Register all MCP tools for KAT-PLANNER
   */
  private registerTools(): void {
    // Health check tool for testing
    this.server.registerTool('health_check', {
      title: 'Health Check',
      description: 'Basic health check to verify server is running',
      inputSchema: {},
    }, async () => {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'KAT-PLANNER MCP server is running successfully!',
          },
        ],
      };
    });

    // Placeholder for refinement tool
    this.server.registerTool('refinement_tool', {
      title: 'Project Refinement Tool',
      description: 'Refines vague project ideas into clear, actionable requirements through targeted questioning. Use this tool FIRST when user provides a high-level project idea to clarify scope, features, and technical requirements.',
      inputSchema: {
        userIdea: z.string().describe('The user\'s initial project idea or request'),
        currentStage: z.enum(['initial', 'clarifying', 'summarizing']).optional().describe('Current refinement stage'),
        answers: z.record(z.string()).optional().describe('Previous answers from user'),
      },
    }, async (params: { userIdea: string; currentStage?: string; answers?: Record<string, string> }) => {
      const stage = params.currentStage || 'initial';
      const answers = params.answers || {};

      // Mouse button mapping specific refinement logic
      if (params.userIdea.toLowerCase().includes('mouse') && params.userIdea.toLowerCase().includes('button')) {
        return this.handleMouseButtonRefinement(params.userIdea, stage, answers);
      }

      // Generic project refinement for other types of projects
      return this.handleGenericRefinement(params.userIdea, stage, answers);
    });

    // Placeholder for SDD generator tool
    this.server.registerTool('sdd_gen', {
      title: 'Specification Document Generator',
      description: 'Generates comprehensive Software Design Documents (SDD) including requirements, architecture, and task breakdown. Use this tool SECOND after refinement to create detailed project specifications based on clarified requirements.',
      inputSchema: {
        refinedSpec: z.string().describe('The refined project specification from refinement tool'),
        projectType: z.string().optional().describe('Type of project (mouse-button-mapper, generic)'),
      },
    }, async (params: { refinedSpec: string; projectType?: string }) => {
      // Generate actual SDD documents
      const sddDocuments = this.generateSDDDocuments(params.refinedSpec, params.projectType || 'generic');

      return {
        content: [
          {
            type: 'text' as const,
            text: `✅ **SDD Generation Complete!**\n\nI've created comprehensive Software Design Documents for your project:\n\n**Generated Documents:**\n${sddDocuments.map((doc: { title: string }) => `- ${doc.title}`).join('\n')}\n\n**Next Step:** Would you like me to generate comprehensive test specifications for these SDD documents? This will include test cases, edge cases, and validation criteria.\n\n*Reply "yes" to proceed with test generation or "no" to complete the planning process.*`
          },
        ],
        structuredContent: {
          documents: sddDocuments,
          projectType: params.projectType || 'generic'
        }
      };
    });

    // Placeholder for optional testing tool
    this.server.registerTool('sdd_testing', {
      title: 'Test Specification Generator',
      description: 'Generates comprehensive test plans and specifications based on SDD documents. Use this tool THIRD (optional) after SDD generation to create test cases, edge cases, and validation criteria.',
      inputSchema: {
        specDocuments: z.string().describe('Path to generated specification documents'),
      },
    }, async (params: { specDocuments: string }) => {
      // TODO: Implement actual testing specifications generation
      return {
        content: [
          {
            type: 'text' as const,
            text: `Generating test specifications for documents: "${params.specDocuments}". This is a placeholder response for the testing tool.`,
          },
        ],
      };
    });
  }

  /**
   * Handle mouse button mapping project refinement
   */
  private async handleMouseButtonRefinement(
    userIdea: string,
    stage: string,
    answers: Record<string, string>
  ) {
    switch (stage) {
      case 'initial':
        return {
          content: [
            {
              type: 'text' as const,
              text: `🎯 **Mouse Button Mapping Project Refinement**\n\nI'll help refine your mouse button mapping application. Let's clarify the key requirements:\n\n**Platform Choice:** You mentioned both Electron and Python. For Linux mouse detection, Python with libraries like pynput/evdev is more straightforward than Electron. Which approach do you prefer?\n\n**Button Support:** How many mouse buttons should we detect? Standard mice have 3 buttons, but gaming mice can have 5-8 additional buttons.\n\n**OS Actions:** You mentioned workspace switching. Should we also support:\n- Browser navigation (forward/back)\n- Volume control\n- Screenshot capture\n- Custom user-defined actions?\n\n**Distribution Support:** Should the app work across all Linux distributions or focus on Ubuntu/Debian specifically?\n\n*Please provide your preferences for these questions, and I'll create a refined specification.*`
            }
          ],
        };

      case 'clarifying':
        // Store the user's answers and ask follow-up questions
        const updatedAnswers = { ...answers, ...this.extractAnswersFromText(userIdea) };

        const missingInfo = this.getMissingMouseButtonRequirements(updatedAnswers);
        if (missingInfo.length > 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `📋 **Additional Clarifications Needed**\n\nBased on your input, I still need clarification on:\n\n${missingInfo.map(info => `- ${info}`).join('\n')}\n\n*Please provide these details so I can create a complete specification.*`
              }
            ],
          };
        }

        return this.generateMouseButtonSummary(updatedAnswers);

      case 'summarizing':
        // User has approved the summary, generate final refined spec
        const finalAnswers = { ...answers, ...this.extractAnswersFromText(userIdea) };
        const refinedSpec = this.createMouseButtonRefinedSpecification(finalAnswers);

        return {
          content: [
            {
              type: 'text' as const,
              text: `✅ **Refinement Complete!**\n\n**Refined Specification:**\n${refinedSpec}\n\n**Next Step:** Would you like me to generate comprehensive Software Design Documents (SDD) for this refined specification? This will include detailed requirements, architecture design, and implementation roadmap.\n\n*Reply "yes" to proceed with SDD generation or provide any final adjustments to the requirements.*`
            }
          ],
          structuredContent: {
            refinedSpecification: refinedSpec,
            projectType: 'mouse-button-mapper',
            requirements: finalAnswers
          }
        };

      default:
        return {
          content: [
            {
              type: 'text' as const,
              text: `Received idea: "${userIdea}". This is a placeholder response for the refinement tool.`
            }
          ],
        };
    }
  }

  /**
   * Handle generic project refinement for other project types
   */
  private async handleGenericRefinement(
    userIdea: string,
    stage: string,
    answers: Record<string, string>
  ) {
    switch (stage) {
      case 'initial':
        return {
          content: [
            {
              type: 'text' as const,
              text: `🎯 **Project Refinement Started**\n\nI'll help refine your project idea through targeted questioning. Let's clarify:\n\n1. **Core Functionality:** What is the primary problem this project solves?\n2. **Target Users:** Who will use this application?\n3. **Key Features:** What are the essential features for the initial release?\n4. **Technical Constraints:** Any specific platforms, languages, or frameworks to use?\n5. **Success Criteria:** How will you measure the project's success?\n\n*Please provide details on these areas so I can create a clear, actionable specification.*`
            }
          ],
        };

      case 'clarifying':
        const updatedAnswers = { ...answers, ...this.extractAnswersFromText(userIdea) };
        const missingGenericInfo = this.getMissingGenericRequirements(updatedAnswers);

        if (missingGenericInfo.length > 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `📋 **Additional Information Needed**\n\nI still need clarification on:\n\n${missingGenericInfo.map(info => `- ${info}`).join('\n')}\n\n*Please provide these details for a complete specification.*`
              }
            ],
          };
        }

        return this.generateGenericSummary(updatedAnswers);

      case 'summarizing':
        const finalGenericAnswers = { ...answers, ...this.extractAnswersFromText(userIdea) };
        const genericRefinedSpec = this.createGenericRefinedSpecification(finalGenericAnswers);

        return {
          content: [
            {
              type: 'text' as const,
              text: `✅ **Refinement Complete!**\n\n**Refined Specification:**\n${genericRefinedSpec}\n\n**Next Step:** Would you like me to generate comprehensive Software Design Documents (SDD) for this refined specification? This will include detailed requirements, architecture design, and implementation roadmap.\n\n*Reply "yes" to proceed with SDD generation or provide any final adjustments to the requirements.*`
            }
          ],
          structuredContent: {
            refinedSpecification: genericRefinedSpec,
            projectType: 'generic',
            requirements: finalGenericAnswers
          }
        };

      default:
        return {
          content: [
            {
              type: 'text' as const,
              text: `Received idea: "${userIdea}". This is a placeholder response for the refinement tool.`
            }
          ],
        };
    }
  }

  /**
   * Start the MCP server
   */
  public async start(): Promise<void> {
    this.registerTools();

    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.log('KAT-PLANNER MCP server started successfully!');
    } catch (error) {
      console.error('Failed to start MCP server:', error);
      throw error;
    }
  }

  /**
   * Extract answers from user text
   */
  private extractAnswersFromText(text: string): Record<string, string> {
    const answers: Record<string, string> = {};
    const lowercaseText = text.toLowerCase();

    // Extract platform preference
    if (lowercaseText.includes('python')) answers.platform = 'python';
    if (lowercaseText.includes('electron')) answers.platform = 'electron';
    if (lowercaseText.includes('linux') || lowercaseText.includes('ubuntu')) answers.platform = 'linux';

    // Extract button count
    const buttonMatch = text.match(/(\d+)[\s-]*(button|buttons)/i);
    if (buttonMatch) answers.buttonCount = buttonMatch[1] || '';

    // Extract action preferences
    if (lowercaseText.includes('workspace') || lowercaseText.includes('desktop')) {
      answers.actions = (answers.actions || '') + ' workspace_switching,';
    }
    if (lowercaseText.includes('browser') || lowercaseText.includes('navigation')) {
      answers.actions = (answers.actions || '') + ' browser_navigation,';
    }
    if (lowercaseText.includes('volume')) {
      answers.actions = (answers.actions || '') + ' volume_control,';
    }

    return answers;
  }

  /**
   * Get missing requirements for mouse button projects
   */
  private getMissingMouseButtonRequirements(answers: Record<string, string>): string[] {
    const missing: string[] = [];

    if (!answers.platform) missing.push('Platform choice (Python vs Electron)');
    if (!answers.buttonCount) missing.push('Number of mouse buttons to support');
    if (!answers.actions) missing.push('Specific OS actions for each button');

    return missing;
  }

  /**
   * Get missing requirements for generic projects
   */
  private getMissingGenericRequirements(answers: Record<string, string>): string[] {
    const missing: string[] = [];

    if (!answers.functionality) missing.push('Core functionality and problem statement');
    if (!answers.users) missing.push('Target user profile');
    if (!answers.features) missing.push('Key features for initial release');

    return missing;
  }

  /**
   * Generate mouse button project summary
   */
  private generateMouseButtonSummary(answers: Record<string, string>) {
    const summary = `📋 **Refined Requirements Summary**\n\n**Project:** Linux Mouse Button Mapper\n**Platform:** ${answers.platform || 'Python (recommended)'}\n**Button Support:** ${answers.buttonCount || '5+ buttons (recommended)'}\n**Actions:** ${answers.actions || 'Workspace switching, browser navigation, volume control'}\n\n**Key Requirements:**\n1. Real-time mouse button detection on Linux systems\n2. Configurable button-to-action mapping\n3. Support for multiple mouse profiles\n4. System tray integration for quick access\n5. Cross-distribution compatibility (Ubuntu focus)\n\n*Does this summary match your expectations? Reply "yes" to proceed with SDD generation or provide any adjustments.*`;

    return {
      content: [
        {
          type: 'text' as const,
          text: summary
        }
      ],
    };
  }

  /**
   * Generate generic project summary
   */
  private generateGenericSummary(answers: Record<string, string>) {
    const summary = `📋 **Refined Requirements Summary**\n\n**Project:** ${answers.projectName || 'Custom Application'}\n**Functionality:** ${answers.functionality || 'To be determined'}\n**Target Users:** ${answers.users || 'To be determined'}\n**Key Features:** ${answers.features || 'To be determined'}\n\n**Key Requirements:**\n1. ${answers.requirement1 || 'Core functionality implementation'}\n2. ${answers.requirement2 || 'User interface design'}\n3. ${answers.requirement3 || 'Data storage and management'}\n\n*Does this summary match your expectations? Reply "yes" to proceed with SDD generation or provide any adjustments.*`;

    return {
      content: [
        {
          type: 'text' as const,
          text: summary
        }
      ],
    };
  }

  /**
   * Create final mouse button refined specification
   */
  private createMouseButtonRefinedSpecification(answers: Record<string, string>): string {
    return `**Project:** Linux Mouse Button Mapper\n**Objective:** Create a cross-distribution Linux application that detects mouse buttons and maps them to customizable OS actions\n**Platform:** ${answers.platform || 'Python 3.8+ with pynput/evdev libraries'}\n**Target Distributions:** Ubuntu 20.04+, Debian 11+, Fedora 34+\n**Button Support:** ${answers.buttonCount || '5+ programmable buttons'}\n**Core Features:**\n- Real-time mouse button detection\n- Configurable action mapping per button\n- Multiple mouse profile support\n- System tray interface\n- Auto-start capability\n**Required Actions:** ${answers.actions || 'Workspace switching, browser navigation, volume control'}\n**Success Criteria:**\n- Detect all mouse buttons reliably\n- Map buttons to actions with <100ms latency\n- Support hot-plug detection\n- Maintain <5% CPU usage during idle\n- Cross-distribution compatibility`;
  }

  /**
   * Generate SDD documents based on project type
   */
  private generateSDDDocuments(refinedSpec: string, projectType: string): Array<{ title: string; content: string }> {
    const documents: Array<{ title: string; content: string }> = [];

    if (projectType === 'mouse-button-mapper') {
      // Requirements Document
      documents.push({
        title: 'requirements.md',
        content: `# Functional Requirements\n\n## 1. Core Functionality\n- Real-time mouse button detection on Linux systems\n- Configurable mapping of mouse buttons to OS actions\n- Support for multiple mouse profiles\n- System tray integration for quick access\n\n## 2. User Interface\n- System tray icon with context menu\n- Configuration window for button mapping\n- Profile management interface\n- Hotkey configuration\n\n## 3. Technical Requirements\n- Cross-distribution compatibility (Ubuntu, Debian, Fedora)\n- Low resource usage (<5% CPU during idle)\n- Fast response time (<100ms latency)\n- Hot-plug detection for mice\n\n## 4. Non-Functional Requirements\n- Reliability: 99.9% uptime during active sessions\n- Performance: Handle up to 1000 button presses per minute\n- Security: No elevated privileges required\n- Compatibility: Support for standard USB and Bluetooth mice`
      });

      // Design Document
      documents.push({
        title: 'design.md',
        content: `# Technical Design\n\n## Architecture Overview\n\n### Component Diagram\n\`\`\`\n+----------------+     +----------------+     +----------------+\n|   Mouse Input  | --> |  Event Handler | --> |  Action Mapper |\n+----------------+     +----------------+     +----------------+\n                                |                    |\n                                v                    v\n                       +----------------+   +----------------+\n                       | Profile System |   | System Tray UI |\n                       +----------------+   +----------------+\n\`\`\`\n\n## Core Components\n\n### 1. Mouse Input Layer\n- Uses pynput/evdev for low-level mouse event capture\n- Supports both USB and Bluetooth mice\n- Handles multiple mouse devices simultaneously\n\n### 2. Event Processing\n- Real-time event filtering and debouncing\n- Configurable sensitivity settings\n- Hot-plug detection and device management\n\n### 3. Action Mapping Engine\n- Configurable button-to-action mappings\n- Support for complex key combinations\n- Profile-based configuration storage\n\n### 4. User Interface\n- System tray integration using pystray\n- GTK-based configuration dialog\n- Real-time status display\n\n## Data Flow\n1. Mouse events captured at kernel level\n2. Events processed and filtered\n3. Button presses mapped to actions\n4. Actions executed through system APIs\n5. User interface updated in real-time\n\n## Technology Stack\n- **Language:** Python 3.8+\n- **GUI:** GTK 3, pystray\n- **Input:** pynput, evdev\n- **Configuration:** JSON files, SQLite\n- **Packaging:** PyInstaller, AppImage`
      });

      // Tasks Document
      documents.push({
        title: 'tasks.md',
        content: `# Implementation Tasks\n\n## Phase 1: Core Infrastructure\n- [ ] Set up project structure and dependencies\n- [ ] Implement basic mouse event capture\n- [ ] Create configuration file structure\n- [ ] Set up logging and error handling\n\n## Phase 2: Core Functionality\n- [ ] Implement button detection and filtering\n- [ ] Create action mapping system\n- [ ] Add profile management\n- [ ] Implement system tray integration\n\n## Phase 3: User Interface\n- [ ] Create configuration dialog\n- [ ] Add profile management UI\n- [ ] Implement hotkey configuration\n- [ ] Add status indicators\n\n## Phase 4: Advanced Features\n- [ ] Hot-plug detection for mice\n- [ ] Advanced gesture support\n- [ ] Command-line interface\n- [ ] Auto-start configuration\n\n## Phase 5: Testing and Deployment\n- [ ] Unit tests for core components\n- [ ] Integration tests for mouse events\n- [ ] User acceptance testing\n- [ ] Package for distribution\n\n## Dependencies\n- Python 3.8+\n- pynput library\n- evdev library (Linux)\n- pystray for system tray\n- GTK 3 for UI components\n- pytest for testing`
      });
    } else {
      // Generic SDD template
      documents.push({
        title: 'requirements.md',
        content: `# Functional Requirements\n\n## 1. Core Functionality\n- [To be defined based on project requirements]\n\n## 2. User Interface\n- [To be defined based on project requirements]\n\n## 3. Technical Requirements\n- [To be defined based on project requirements]\n\n## 4. Non-Functional Requirements\n- Performance: [Define performance criteria]\n- Security: [Define security requirements]\n- Compatibility: [Define compatibility requirements]`
      });

      documents.push({
        title: 'design.md',
        content: `# Technical Design\n\n## Architecture Overview\n\n### Component Diagram\n\`\`\n[To be defined based on project requirements]\n\`\`\n\n## Core Components\n\n### 1. [Component 1]\n- [Description of component 1]\n\n### 2. [Component 2]\n- [Description of component 2]\n\n## Technology Stack\n- **Language:** [To be defined]\n- **Framework:** [To be defined]\n- **Database:** [To be defined]\n- **UI Framework:** [To be defined]`
      });

      documents.push({
        title: 'tasks.md',
        content: `# Implementation Tasks\n\n## Phase 1: Core Infrastructure\n- [ ] Set up project structure and dependencies\n- [ ] Implement basic infrastructure\n- [ ] Create configuration system\n- [ ] Set up logging and error handling\n\n## Phase 2: Core Functionality\n- [ ] Implement core features\n- [ ] Create data models\n- [ ] Add user management\n- [ ] Implement API endpoints\n\n## Phase 3: User Interface\n- [ ] Create user interface\n- [ ] Add data visualization\n- [ ] Implement user workflows\n- [ ] Add configuration options\n\n## Phase 4: Advanced Features\n- [ ] Advanced feature 1\n- [ ] Advanced feature 2\n- [ ] Performance optimization\n- [ ] Security enhancements\n\n## Phase 5: Testing and Deployment\n- [ ] Unit tests\n- [ ] Integration tests\n- [ ] User acceptance testing\n- [ ] Package for deployment`
      });
    }

    return documents;
  }

  /**
   * Create final generic refined specification
   */
  private createGenericRefinedSpecification(answers: Record<string, string>): string {
    return `**Project:** ${answers.projectName || 'Custom Application'}\n**Objective:** ${answers.objective || 'To be determined'}\n**Core Functionality:** ${answers.functionality || 'To be determined'}\n**Target Users:** ${answers.users || 'To be determined'}\n**Key Features:** ${answers.features || 'To be determined'}\n**Success Criteria:** ${answers.successCriteria || 'To be determined'}`;
  }
}

/**
 * Main entry point
 */
export async function main(): Promise<void> {
  const server = new KatPlannerServer();
  await server.start();
}