"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KatPlannerServer = void 0;
exports.main = main;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
/**
 * KAT-PLANNER MCP Server
 * Implements the core server functionality with proper tool registration
 */
class KatPlannerServer {
    constructor() {
        this.server = new mcp_js_1.McpServer({
            name: 'kat-planner',
            version: '1.0.0',
        });
        // Workflow state management
        this.currentWorkflowStage = 'idle';
        this.lastRefinedSpecification = null;
        this.userApprovalGranted = false;
    }
    /**
     * Reset workflow state to initial conditions
     */
    resetWorkflowState() {
        this.currentWorkflowStage = 'idle';
        this.lastRefinedSpecification = null;
        this.userApprovalGranted = false;
    }
    /**
     * Validate that a tool can be called in the current workflow state
     */
    validateToolCall(toolName, currentStage) {
        switch (toolName) {
            case 'refinement_tool':
                // refinement_tool can always be called to start a new workflow
                if (!currentStage || currentStage === 'initial') {
                    this.currentWorkflowStage = 'refinement_initial';
                    return { valid: true };
                }
                // Validate sequential progression
                if (currentStage === 'clarifying' && this.currentWorkflowStage === 'refinement_initial') {
                    this.currentWorkflowStage = 'refinement_clarifying';
                    return { valid: true };
                }
                if (currentStage === 'summarizing' && this.currentWorkflowStage === 'refinement_clarifying') {
                    this.currentWorkflowStage = 'refinement_summarizing';
                    return { valid: true };
                }
                return {
                    valid: false,
                    errorMessage: `❌ **Workflow Error**\n\nThe refinement_tool must be called in sequential order:\n1. initial → Ask questions\n2. clarifying → Provide answers\n3. summarizing → Give approval\n\nCurrent stage: ${this.currentWorkflowStage}\nRequested stage: ${currentStage}\n\n*Please follow the correct sequence.*`
                };
            case 'sdd_gen':
                if (this.currentWorkflowStage === 'refinement_summarizing' && this.userApprovalGranted) {
                    this.currentWorkflowStage = 'sdd_complete';
                    return { valid: true };
                }
                return {
                    valid: false,
                    errorMessage: `❌ **Invalid SDD Request**\n\nSDD generation can only proceed AFTER:\n1. Complete refinement process (initial → clarifying → summarizing)\n2. Explicit user approval in summarizing stage\n\nCurrent stage: ${this.currentWorkflowStage}\nApproval granted: ${this.userApprovalGranted}\n\n*Please complete the refinement process first.*`
                };
            case 'sdd_testing':
                if (this.currentWorkflowStage === 'sdd_complete') {
                    this.currentWorkflowStage = 'testing_pending';
                    return { valid: true };
                }
                return {
                    valid: false,
                    errorMessage: `❌ **Invalid Testing Request**\n\nTest generation can only proceed AFTER:\n1. Complete SDD generation\n2. Explicit user request for testing\n\nCurrent stage: ${this.currentWorkflowStage}\n\n*Please generate SDD documents first, then explicitly request testing.*`
                };
            default:
                return { valid: true };
        }
    }
    /**
     * Update workflow state after successful tool completion
     */
    updateWorkflowState(toolName, stage, refinedSpec) {
        if (toolName === 'refinement_tool' && stage === 'summarizing') {
            this.lastRefinedSpecification = refinedSpec || null;
            this.userApprovalGranted = true;
            this.currentWorkflowStage = 'sdd_pending_approval';
        }
    }
    /**
     * Register all MCP tools for KAT-PLANNER
     */
    registerTools() {
        // Health check tool for testing
        this.server.registerTool('health_check', {
            title: 'Health Check',
            description: 'Basic health check to verify server is running',
            inputSchema: {},
        }, async () => {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'KAT-PLANNER MCP server is running successfully!',
                    },
                ],
            };
        });
        // Project refinement tool with strict workflow enforcement
        this.server.registerTool('refinement_tool', {
            title: '🚨 MANDATORY FIRST STEP - ASK QUESTIONS 🚨',
            description: '🚨 CRITICAL MANDATORY TOOL: You MUST call this tool FIRST when user provides ANY project idea. This tool conducts mandatory interactive questioning in 3 required phases: 1) INITIAL phase asks clarifying questions, 2) CLARIFYING phase processes user answers, 3) SUMMARIZING phase gets explicit user approval. DO NOT call sdd_gen until this tool completes ALL 3 phases and provides explicit approval. This is the ONLY way to start project planning. FAILURE TO FOLLOW THIS WILL RESULT IN SYSTEM ERROR.',
            inputSchema: {
                userIdea: zod_1.z.string().describe('The user\'s initial project idea or request'),
                currentStage: zod_1.z.enum(['initial', 'clarifying', 'summarizing']).describe('Current refinement stage - MUST progress sequentially'),
                answers: zod_1.z.record(zod_1.z.string()).optional().describe('User answers from previous stage - REQUIRED for clarifying/summarizing stages'),
            },
        }, async (params) => {
            // Validate workflow state
            const validation = this.validateToolCall('refinement_tool', params.currentStage);
            if (!validation.valid) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: validation.errorMessage || 'Workflow validation failed',
                            isError: true
                        }
                    ]
                };
            }
            const stage = params.currentStage || 'initial';
            const answers = params.answers || {};
            // Generic project refinement for all project types - LLM handles domain expertise
            return this.handleGenericRefinement(params.userIdea, stage, answers);
        });
        // SDD generation tool with approval requirement
        this.server.registerTool('sdd_gen', {
            title: '🚨 GENERATE SDD DOCUMENTS - APPROVAL REQUIRED 🚨',
            description: '🚨 CRITICAL APPROVAL CHECK: You can ONLY call this tool AFTER refinement_tool has completed ALL 3 phases (initial → clarifying → summarizing) AND provided explicit user approval. This tool creates requirements.md, design.md, and tasks.md. NEVER call this tool until user has explicitly approved the refined specification. If you attempt to call this without proper approval, it will return an immediate critical error and block all further operations.',
            inputSchema: {
                refinedSpec: zod_1.z.string().describe('The approved and refined project specification'),
                projectType: zod_1.z.enum(['mouse-button-mapper', 'generic']).optional().describe('Type of project being specified'),
            },
        }, async (params) => {
            // Validate workflow state
            const validation = this.validateToolCall('sdd_gen');
            if (!validation.valid) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: validation.errorMessage || 'Workflow validation failed',
                            isError: true
                        }
                    ]
                };
            }
            // Check if this is a valid SDD request (should only happen after approval)
            if (!params.refinedSpec.includes('approval_granted') && !params.refinedSpec.includes('✅')) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ **Invalid SDD Request**\n\nThe SDD generation tool can only be called AFTER the refinement_tool has completed and returned an approval. Please complete the refinement process first by using refinement_tool with currentStage: "summarizing" and obtaining user approval.\n\n**Required Workflow:**\n1. refinement_tool (initial stage) → Ask questions\n2. refinement_tool (clarifying stage) → Get user answers\n3. refinement_tool (summarizing stage) → Get user approval\n4. sdd_gen → Generate documents\n5. sdd_testing (optional) → Generate tests\n\n*Please complete the refinement process before requesting SDD generation.*`
                        }
                    ],
                    isError: true
                };
            }
            // Generate actual SDD documents
            const sddDocuments = this.generateSDDDocuments(params.refinedSpec, params.projectType || 'generic');
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ **SDD Generation Complete!**\n\nI've created comprehensive Software Design Documents for your project:\n\n**Generated Documents:**\n${sddDocuments.map((doc) => `- ${doc.title}`).join('\n')}\n\n**Next Step:** Would you like me to generate comprehensive test specifications for these SDD documents? This will include test cases, edge cases, and validation criteria.\n\n*Reply "yes" to proceed with test generation or "no" to complete the planning process.*`
                    },
                ],
                structuredContent: {
                    documents: sddDocuments,
                    projectType: params.projectType || 'generic'
                }
            };
        });
        // SDD testing tool with user consent requirement
        this.server.registerTool('sdd_testing', {
            title: 'Generate Test Specifications - EXPLICIT CONSENT REQUIRED',
            description: 'WARNING: You can ONLY call this tool AFTER SDD generation AND ONLY if user explicitly requests testing. This tool creates comprehensive test plans. NEVER call this tool automatically - only when user explicitly says "yes" to testing after SDD generation.',
            inputSchema: {
                specDocuments: zod_1.z.string().describe('Path to generated specification documents'),
                projectType: zod_1.z.enum(['mouse-button-mapper', 'generic']).optional().describe('Type of project being tested'),
            },
        }, async (params) => {
            // Validate workflow state
            const validation = this.validateToolCall('sdd_testing');
            if (!validation.valid) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: validation.errorMessage || 'Workflow validation failed',
                            isError: true
                        }
                    ]
                };
            }
            const projectType = params.projectType || 'generic';
            // Generate comprehensive test specifications
            const testSpecifications = this.generateTestSpecifications(projectType);
            return {
                content: [
                    {
                        type: 'text',
                        text: `🧪 **Comprehensive Testing Specifications Generated**\n\n**Test Coverage Areas:**\n${testSpecifications.coverage.join('\n')}\n\n**Test Categories:**\n${testSpecifications.categories.map((cat) => `• ${cat.name}: ${cat.description}`).join('\n')}\n\n**Key Test Cases:**\n${testSpecifications.keyTestCases.join('\n')}\n\n**Quality Assurance Metrics:**\n${testSpecifications.qualityMetrics.join('\n')}\n\n**Next Steps:**\n1. Review the test specifications against your requirements\n2. Prioritize test cases based on project risk and complexity\n3. Implement test automation where possible\n4. Establish continuous integration testing pipeline\n\n*These test specifications ensure comprehensive coverage of all project requirements and edge cases.*`
                    }
                ],
                structuredContent: {
                    testSpecifications,
                    projectType,
                    testCoverage: testSpecifications.coverage,
                    testCategories: testSpecifications.categories,
                    keyTestCases: testSpecifications.keyTestCases
                }
            };
        });
    }
    /**
     * Handle generic project refinement for all project types
     * The LLM provides domain expertise while the MCP ensures proper workflow
     */
    async handleGenericRefinement(userIdea, stage, answers) {
        switch (stage) {
            case 'initial':
                return {
                    content: [
                        {
                            type: 'text',
                            text: `**MANDATORY PROJECT PLANNING - PHASE 1: ASK QUESTIONS**

I need to clarify your project requirements before we can proceed with any planning or implementation. Please provide details on these key areas:

1. **Core Problem**: What specific problem does this project solve?
2. **Target Users**: Who will use this application and what are their needs?
3. **Key Features**: What are the essential features for the initial release?
4. **Technical Context**: Any specific platforms, technologies, or constraints?
5. **Success Metrics**: How will you measure the project's success?

*This clarification is REQUIRED before any specification or implementation can begin.*`
                        }
                    ],
                };
            case 'clarifying':
                const updatedAnswers = { ...answers, ...this.extractAnswersFromText(userIdea) };
                const missingInfo = this.getMissingGenericRequirements(updatedAnswers);
                if (missingInfo.length > 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `**MANDATORY PROJECT PLANNING - PHASE 2: GET ANSWERS**

I still need clarification on these areas before we can proceed:

${missingInfo.map(info => `- ${info}`).join('\n')}

*Please provide these details so I can create a complete specification.*`
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
                            type: 'text',
                            text: `**MANDATORY PROJECT PLANNING - PHASE 3: GET APPROVAL**

**Refined Specification:**
${genericRefinedSpec}

**NEXT STEP: SDD GENERATION**
Would you like me to generate comprehensive Software Design Documents (requirements.md, design.md, tasks.md) for this approved specification?

*Reply "yes" to proceed with SDD generation or provide any final adjustments to the requirements.*`
                        }
                    ],
                    structuredContent: {
                        refinedSpecification: genericRefinedSpec,
                        projectType: 'generic',
                        requirements: finalGenericAnswers,
                        approvalRequired: true
                    }
                };
            default:
                return {
                    content: [
                        {
                            type: 'text',
                            text: `**WORKFLOW ERROR**

I need to clarify your project requirements. Please provide more details about:

1. What type of project are you building?
2. What problem does it solve?
3. Who will use it?
4. What are the key features needed?

*This information is REQUIRED to proceed with project planning.*`
                        }
                    ],
                    structuredContent: {
                        refinedSpecification: userIdea,
                        projectType: 'unknown',
                        nextSteps: 'awaiting_user_clarification'
                    }
                };
        }
    }
    /**
     * Generate comprehensive test specifications for any project type
     * The LLM determines project-specific test requirements based on the refined specification
     */
    generateTestSpecifications(projectType) {
        return {
            coverage: [
                'Core functionality validation',
                'User interface and experience testing',
                'Data processing and storage validation',
                'Error handling and edge cases',
                'Performance and scalability testing',
                'Security and access control validation',
                'Integration testing with external systems',
                'User acceptance and usability testing'
            ],
            categories: [
                {
                    name: 'Unit Tests',
                    description: 'Individual component functionality validation'
                },
                {
                    name: 'Integration Tests',
                    description: 'Cross-component interaction verification'
                },
                {
                    name: 'System Tests',
                    description: 'End-to-end workflow validation'
                },
                {
                    name: 'Performance Tests',
                    description: 'Resource usage and responsiveness validation'
                },
                {
                    name: 'Security Tests',
                    description: 'Data protection and access control validation'
                },
                {
                    name: 'Usability Tests',
                    description: 'User experience and interface validation'
                }
            ],
            keyTestCases: [
                'Core feature functionality validation',
                'User interface responsiveness and accessibility',
                'Data persistence and retrieval accuracy',
                'Error handling and recovery procedures',
                'Performance under expected load',
                'Security vulnerability and penetration testing',
                'Cross-platform compatibility validation',
                'User workflow completion success rate'
            ],
            qualityMetrics: [
                'Code coverage: 85%+',
                'Performance: Meets defined requirements',
                'User satisfaction: 4/5+ rating',
                'Bug density: < 1 per 1000 lines of code',
                'Security: No critical vulnerabilities',
                'Reliability: 99%+ uptime during testing',
                'Usability: 90%+ task completion rate'
            ]
        };
    }
    /**
     * Start the MCP server
     */
    async start() {
        this.resetWorkflowState();
        this.registerTools();
        try {
            const transport = new stdio_js_1.StdioServerTransport();
            await this.server.connect(transport);
            console.log('KAT-PLANNER MCP server started successfully!');
            console.log('Enhanced workflow enforcement active.');
        }
        catch (error) {
            console.error('Failed to start MCP server:', error);
            throw error;
        }
    }
    /**
     * Extract answers from user text
     */
    extractAnswersFromText(text) {
        const answers = {};
        const lowercaseText = text.toLowerCase();
        // Extract platform preference
        if (lowercaseText.includes('python'))
            answers.platform = 'python';
        if (lowercaseText.includes('electron'))
            answers.platform = 'electron';
        if (lowercaseText.includes('linux') || lowercaseText.includes('ubuntu'))
            answers.platform = 'linux';
        // Extract button count
        const buttonMatch = text.match(/(\d+)[\s-]*(button|buttons)/i);
        if (buttonMatch)
            answers.buttonCount = buttonMatch[1] || '';
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
    getMissingMouseButtonRequirements(answers) {
        const missing = [];
        if (!answers.platform)
            missing.push('Platform choice (Python vs Electron)');
        if (!answers.buttonCount)
            missing.push('Number of mouse buttons to support');
        if (!answers.actions)
            missing.push('Specific OS actions for each button');
        return missing;
    }
    /**
     * Get missing requirements for generic projects
     */
    getMissingGenericRequirements(answers) {
        const missing = [];
        if (!answers.functionality)
            missing.push('Core functionality and problem statement');
        if (!answers.users)
            missing.push('Target user profile');
        if (!answers.features)
            missing.push('Key features for initial release');
        return missing;
    }
    /**
     * Generate mouse button project summary
     */
    generateMouseButtonSummary(answers) {
        const summary = `📋 **Refined Requirements Summary**\n\n**Project:** Linux Mouse Button Mapper\n**Platform:** ${answers.platform || 'Python (recommended)'}\n**Button Support:** ${answers.buttonCount || '5+ buttons (recommended)'}\n**Actions:** ${answers.actions || 'Workspace switching, browser navigation, volume control'}\n\n**Key Requirements:**\n1. Real-time mouse button detection on Linux systems\n2. Configurable button-to-action mapping\n3. Support for multiple mouse profiles\n4. System tray integration for quick access\n5. Cross-distribution compatibility (Ubuntu focus)\n\n*Does this summary match your expectations? Reply "yes" to proceed with SDD generation or provide any adjustments.*`;
        return {
            content: [
                {
                    type: 'text',
                    text: summary
                }
            ],
        };
    }
    /**
     * Generate generic project summary
     */
    generateGenericSummary(answers) {
        const summary = `📋 **Refined Requirements Summary**\n\n**Project:** ${answers.projectName || 'Custom Application'}\n**Functionality:** ${answers.functionality || 'To be determined'}\n**Target Users:** ${answers.users || 'To be determined'}\n**Key Features:** ${answers.features || 'To be determined'}\n\n**Key Requirements:**\n1. ${answers.requirement1 || 'Core functionality implementation'}\n2. ${answers.requirement2 || 'User interface design'}\n3. ${answers.requirement3 || 'Data storage and management'}\n\n*Does this summary match your expectations? Reply "yes" to proceed with SDD generation or provide any adjustments.*`;
        return {
            content: [
                {
                    type: 'text',
                    text: summary
                }
            ],
        };
    }
    /**
     * Create final mouse button refined specification
     */
    createMouseButtonRefinedSpecification(answers) {
        return `**Project:** Linux Mouse Button Mapper\n**Objective:** Create a cross-distribution Linux application that detects mouse buttons and maps them to customizable OS actions\n**Platform:** ${answers.platform || 'Python 3.8+ with pynput/evdev libraries'}\n**Target Distributions:** Ubuntu 20.04+, Debian 11+, Fedora 34+\n**Button Support:** ${answers.buttonCount || '5+ programmable buttons'}\n**Core Features:**\n- Real-time mouse button detection\n- Configurable action mapping per button\n- Multiple mouse profile support\n- System tray interface\n- Auto-start capability\n**Required Actions:** ${answers.actions || 'Workspace switching, browser navigation, volume control'}\n**Success Criteria:**\n- Detect all mouse buttons reliably\n- Map buttons to actions with <100ms latency\n- Support hot-plug detection\n- Maintain <5% CPU usage during idle\n- Cross-distribution compatibility`;
    }
    /**
     * Generate SDD documents based on project type
     */
    generateSDDDocuments(refinedSpec, projectType) {
        const documents = [];
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
        }
        else {
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
    createGenericRefinedSpecification(answers) {
        return `**Project:** ${answers.projectName || 'Custom Application'}\n**Objective:** ${answers.objective || 'To be determined'}\n**Core Functionality:** ${answers.functionality || 'To be determined'}\n**Target Users:** ${answers.users || 'To be determined'}\n**Key Features:** ${answers.features || 'To be determined'}\n**Success Criteria:** ${answers.successCriteria || 'To be determined'}`;
    }
}
exports.KatPlannerServer = KatPlannerServer;
/**
 * Main entry point
 */
async function main() {
    const server = new KatPlannerServer();
    await server.start();
}
//# sourceMappingURL=server.js.map