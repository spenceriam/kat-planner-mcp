"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KatPlannerServer = void 0;
exports.main = main;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
/**
 * KAT-PLANNER MCP Server - Simplified Implementation
 * Based on proven LLM behavior patterns and tool calling best practices
 */
class KatPlannerServer {
    constructor() {
        this.server = new mcp_js_1.McpServer({
            name: 'kat-planner',
            version: '1.0.0',
        });
    }
    /***
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
        // Project planning tool - SINGLE COMPOSITE TOOL
        this.server.registerTool('plan_project', {
            title: 'Project Planning Tool',
            description: 'COMPREHENSIVE PROJECT PLANNING: Use this tool ONCE when user provides a project idea. This single tool handles the entire planning workflow: 1) Ask clarifying questions, 2) Collect user answers, 3) Generate refined specification, 4) Create SDD documents, 5) Generate test specifications. Returns complete planning output in one call.',
            inputSchema: {
                userIdea: zod_1.z.string().describe('The user\'s project idea'),
                userAnswers: zod_1.z.record(zod_1.z.string()).optional().describe('User answers to clarifying questions'),
                generateSDD: zod_1.z.boolean().optional().describe('Generate SDD documents if true'),
                generateTests: zod_1.z.boolean().optional().describe('Generate test specifications if true'),
            },
        }, async (params) => {
            const userIdea = params.userIdea;
            const userAnswers = params.userAnswers || {};
            const generateSDD = params.generateSDD || false;
            const generateTests = params.generateTests || false;
            // Step 1: If no answers provided, ask clarifying questions
            if (Object.keys(userAnswers).length === 0) {
                const questions = this.generateClarifyingQuestions(userIdea);
                return {
                    content: [
                        {
                            type: 'text',
                            text: ` **Project Planning Initiated**\n\nI'll help plan your project. Please answer these clarifying questions:\n\n${questions}\n\n*Provide your answers and I'll create a complete project plan including specifications, design documents, and test plans.*`
                        }
                    ],
                    structuredContent: {
                        nextStep: 'awaiting_user_answers',
                        clarifyingQuestions: questions
                    }
                };
            }
            // Step 2: Generate refined specification
            const refinedSpec = this.createRefinedSpecification(userIdea, userAnswers);
            const projectType = this.detectProjectType(userIdea);
            // Step 3: Generate SDD documents if requested
            let sddDocuments = [];
            if (generateSDD) {
                sddDocuments = this.generateSDDDocuments(refinedSpec, projectType);
            }
            // Step 4: Generate test specifications if requested
            let testSpecifications = null;
            if (generateTests) {
                testSpecifications = this.generateTestSpecifications(projectType);
            }
            // Step 5: Return comprehensive planning output
            let output = ` **Project Planning Complete!**\n\n**Refined Specification:**\n${refinedSpec}\n\n`;
            if (generateSDD && sddDocuments.length > 0) {
                output += `**Generated SDD Documents:**\n${sddDocuments.map((doc) => `- ${doc.title}`).join('\n')}\n\n`;
            }
            if (generateTests && testSpecifications) {
                output += `**Generated Test Specifications:**\n${testSpecifications.coverage.join('\n')}\n\n`;
            }
            output += `*Your comprehensive project plan is ready for implementation.*`;
            return {
                content: [
                    {
                        type: 'text',
                        text: output
                    }
                ],
                structuredContent: {
                    refinedSpecification: refinedSpec,
                    projectType: projectType,
                    sddDocuments: generateSDD ? sddDocuments : undefined,
                    testSpecifications: generateTests ? testSpecifications : undefined,
                    planningComplete: true
                }
            };
        });
    }
    /**
     * Generate clarifying questions for project idea
     */
    generateClarifyingQuestions(userIdea) {
        if (userIdea.toLowerCase().includes('mouse') && userIdea.toLowerCase().includes('button')) {
            return `📋 **Mouse Button Mapping Clarification**\n\n1. Platform preference: Python (recommended for Linux) or Electron?\n2. Button support: How many programmable buttons should we support?\n3. Actions: Which OS actions should buttons trigger? (workspace switching, browser navigation, volume control, etc.)\n4. Distribution: Focus on Ubuntu/Debian or cross-distribution compatibility?\n5. Advanced features: Hot-plug detection, multiple mouse profiles, system tray integration?`;
        }
        return `📋 **Project Clarification**\n\n1. Core functionality: What is the primary problem this project solves?\n2. Target users: Who will use this application?\n3. Key features: What are the essential features for the initial release?\n4. Technical constraints: Any specific platforms, languages, or frameworks?\n5. Success criteria: How will you measure the project's success?`;
    }
    /**
     * Create refined specification from user answers
     */
    createRefinedSpecification(userIdea, answers) {
        if (userIdea.toLowerCase().includes('mouse') && userIdea.toLowerCase().includes('button')) {
            return `**Project:** Linux Mouse Button Mapper\n**Objective:** Create a cross-distribution Linux application that detects mouse buttons and maps them to customizable OS actions\n**Platform:** ${answers.platform || 'Python 3.8+ (recommended)'}\n**Target Distributions:** Ubuntu 20.04+, Debian 11+, Fedora 34+\n**Button Support:** ${answers.buttonCount || '5+ programmable buttons'}\n**Core Features:**\n- Real-time mouse button detection\n- Configurable action mapping per button\n- Multiple mouse profile support\n- System tray interface\n- Auto-start capability\n**Required Actions:** ${answers.actions || 'Workspace switching, browser navigation, volume control'}\n**Success Criteria:**\n- Detect all mouse buttons reliably\n- Map buttons to actions with <100ms latency\n- Support hot-plug detection\n- Maintain <5% CPU usage during idle\n- Cross-distribution compatibility`;
        }
        return `**Project:** ${answers.projectName || 'Custom Application'}\n**Objective:** ${answers.objective || 'To be determined'}\n**Core Functionality:** ${answers.functionality || 'To be determined'}\n**Target Users:** ${answers.users || 'To be determined'}\n**Key Features:** ${answers.features || 'To be determined'}\n**Success Criteria:** ${answers.successCriteria || 'To be determined'}`;
    }
    /**
     * Detect project type from idea
     */
    detectProjectType(userIdea) {
        if (userIdea.toLowerCase().includes('mouse') && userIdea.toLowerCase().includes('button')) {
            return 'mouse-button-mapper';
        }
        return 'generic';
    }
    /**
     * Generate SDD documents based on project type
     */
    generateSDDDocuments(refinedSpec, projectType) {
        const documents = [];
        if (projectType === 'mouse-button-mapper') {
            documents.push({
                title: 'requirements.md',
                content: `# Functional Requirements\n\n## 1. Core Functionality\n- Real-time mouse button detection on Linux systems\n- Configurable mapping of mouse buttons to OS actions\n- Support for multiple mouse profiles\n- System tray integration for quick access\n\n## 2. User Interface\n- System tray icon with context menu\n- Configuration window for button mapping\n- Profile management interface\n- Hotkey configuration\n\n## 3. Technical Requirements\n- Cross-distribution compatibility (Ubuntu, Debian, Fedora)\n- Low resource usage (<5% CPU during idle)\n- Fast response time (<100ms latency)\n- Hot-plug detection for mice\n\n## 4. Non-Functional Requirements\n- Reliability: 99.9% uptime during active sessions\n- Performance: Handle up to 1000 button presses per minute\n- Security: No elevated privileges required\n- Compatibility: Support for standard USB and Bluetooth mice`
            });
            documents.push({
                title: 'design.md',
                content: `# Technical Design\n\n## Architecture Overview\n\n### Component Diagram\n\`\`\`\n+----------------+     +----------------+     +----------------+\n|   Mouse Input  | --> |  Event Handler | --> |  Action Mapper |\n+----------------+     +----------------+     +----------------+\n                                |                    |\n                                v                    v\n                       +----------------+   +----------------+\n                       | Profile System |   | System Tray UI |\n                       +----------------+   +----------------+\n\`\`\`\n\n## Core Components\n\n### 1. Mouse Input Layer\n- Uses pynput/evdev for low-level mouse event capture\n- Supports both USB and Bluetooth mice\n- Handles multiple mouse devices simultaneously\n\n### 2. Event Processing\n- Real-time event filtering and debouncing\n- Configurable sensitivity settings\n- Hot-plug detection and device management\n\n### 3. Action Mapping Engine\n- Configurable button-to-action mappings\n- Support for complex key combinations\n- Profile-based configuration storage\n\n### 4. User Interface\n- System tray integration using pystray\n- GTK-based configuration dialog\n- Real-time status display\n\n## Data Flow\n1. Mouse events captured at kernel level\n2. Events processed and filtered\n3. Button presses mapped to actions\n4. Actions executed through system APIs\n5. User interface updated in real-time\n\n## Technology Stack\n- **Language:** Python 3.8+\n- **GUI:** GTK 3, pystray\n- **Input:** pynput, evdev\n- **Configuration:** JSON files, SQLite\n- **Packaging:** PyInstaller, AppImage`
            });
            documents.push({
                title: 'tasks.md',
                content: `# Implementation Tasks\n\n## Phase 1: Core Infrastructure\n- [ ] Set up project structure and dependencies\n- [ ] Implement basic mouse event capture\n- [ ] Create configuration file structure\n- [ ] Set up logging and error handling\n\n## Phase 2: Core Functionality\n- [ ] Implement button detection and filtering\n- [ ] Create action mapping system\n- [ ] Add profile management\n- [ ] Implement system tray integration\n\n## Phase 3: User Interface\n- [ ] Create configuration dialog\n- [ ] Add profile management UI\n- [ ] Implement hotkey configuration\n- [ ] Add status indicators\n\n## Phase 4: Advanced Features\n- [ ] Hot-plug detection for mice\n- [ ] Advanced gesture support\n- [ ] Command-line interface\n- [ ] Auto-start configuration\n\n## Phase 5: Testing and Deployment\n- [ ] Unit tests for core components\n- [ ] Integration tests for mouse events\n- [ ] User acceptance testing\n- [ ] Package for distribution\n\n## Dependencies\n- Python 3.8+\n- pynput library\n- evdev library (Linux)\n- pystray for system tray\n- GTK 3 for UI components\n- pytest for testing`
            });
        }
        else {
            documents.push({
                title: 'requirements.md',
                content: `# Functional Requirements\n\n## 1. Core Functionality\n- [To be defined based on project requirements]\n\n## 2. User Interface\n- [To be defined based on project requirements]\n\n## 3. Technical Requirements\n- [To be defined based on project requirements]\n\n## 4. Non-Functional Requirements\n- Performance: [Define performance criteria]\n- Security: [Define security requirements]\n- Compatibility: [Define compatibility requirements]`
            });
            documents.push({
                title: 'design.md',
                content: `# Technical Design\n\n## Architecture Overview\n\n### Component Diagram\n\`\`\`\n[To be defined based on project requirements]\n\`\`\`\n\n## Core Components\n\n### 1. [Component 1]\n- [Description of component 1]\n\n### 2. [Component 2]\n- [Description of component 2]\n\n## Technology Stack\n- **Language:** [To be defined]\n- **Framework:** [To be defined]\n- **Database:** [To be defined]\n- **UI Framework:** [To be defined]`
            });
            documents.push({
                title: 'tasks.md',
                content: `# Implementation Tasks\n\n## Phase 1: Core Infrastructure\n- [ ] Set up project structure and dependencies\n- [ ] Implement basic infrastructure\n- [ ] Create configuration system\n- [ ] Set up logging and error handling\n\n## Phase 2: Core Functionality\n- [ ] Implement core features\n- [ ] Create data models\n- [ ] Add user management\n- [ ] Implement API endpoints\n\n## Phase 3: User Interface\n- [ ] Create user interface\n- [ ] Add data visualization\n- [ ] Implement user workflows\n- [ ] Add configuration options\n\n## Phase 4: Advanced Features\n- [ ] Advanced feature 1\n- [ ] Advanced feature 2\n- [ ] Performance optimization\n- [ ] Security enhancements\n\n## Phase 5: Testing and Deployment\n- [ ] Unit tests\n- [ ] Integration tests\n- [ ] User acceptance testing\n- [ ] Package for deployment`
            });
        }
        return documents;
    }
    /**
     * Generate test specifications for a project type
     */
    generateTestSpecifications(projectType) {
        if (projectType === 'mouse-button-mapper') {
            return {
                coverage: [
                    'Mouse button detection and event handling',
                    'Button mapping configuration and persistence',
                    'System integration (X11/Wayland)',
                    'User interface and system tray functionality',
                    'Cross-distribution compatibility',
                    'Performance and resource usage',
                    'Error handling and recovery'
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
                        name: 'Compatibility Tests',
                        description: 'Multi-distribution and desktop environment testing'
                    },
                    {
                        name: 'Performance Tests',
                        description: 'Resource usage and responsiveness validation'
                    }
                ],
                keyTestCases: [
                    'Mouse button press detection accuracy (99.9%+)',
                    'Button mapping configuration save/load',
                    'System tray icon display and interaction',
                    'Multiple mouse support',
                    'Hotkey conflict resolution',
                    'Configuration persistence across reboots'
                ],
                qualityMetrics: [
                    'Code coverage: 90%+',
                    'Performance: < 50ms response time',
                    'Memory usage: < 50MB RAM',
                    'Error rate: < 0.1%',
                    'User satisfaction: 4.5/5+'
                ]
            };
        }
        return {
            coverage: [
                'Core functionality validation',
                'User interface and experience',
                'Data processing and storage',
                'Error handling and edge cases',
                'Performance and scalability',
                'Security and access control'
            ],
            categories: [
                {
                    name: 'Functional Tests',
                    description: 'Core feature validation'
                },
                {
                    name: 'UI/UX Tests',
                    description: 'User interface and experience validation'
                },
                {
                    name: 'Integration Tests',
                    description: 'System integration verification'
                },
                {
                    name: 'Performance Tests',
                    description: 'Speed and resource usage validation'
                },
                {
                    name: 'Security Tests',
                    description: 'Data protection and access control validation'
                }
            ],
            keyTestCases: [
                'Core feature functionality validation',
                'User interface responsiveness',
                'Data persistence and retrieval',
                'Error handling and recovery',
                'Performance under load',
                'Security vulnerability assessment'
            ],
            qualityMetrics: [
                'Code coverage: 85%+',
                'Performance: Meets requirements',
                'User satisfaction: 4/5+',
                'Bug density: < 1 per 1000 lines',
                'Security: No critical vulnerabilities'
            ]
        };
    }
    /**
     * Start the MCP server
     */
    async start() {
        this.registerTools();
        try {
            const transport = new stdio_js_1.StdioServerTransport();
            await this.server.connect(transport);
            console.log('KAT-PLANNER MCP server started successfully!');
        }
        catch (error) {
            console.error('Failed to start MCP server:', error);
            throw error;
        }
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
//# sourceMappingURL=server-simple.js.map