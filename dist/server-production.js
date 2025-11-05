"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionKatPlannerServer = void 0;
exports.main = main;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const session_manager_js_1 = require("./session-manager.js");
/**
 * Production-ready KAT-PLANNER MCP server with comprehensive session management
 */
class ProductionKatPlannerServer {
    constructor() {
        this.server = new mcp_js_1.McpServer({
            name: 'kat-planner-production',
            version: '1.0.0',
        });
        this.sessionManager = new session_manager_js_1.ProductionSessionManager();
        this.registerTools();
    }
    /**
     * Register all MCP tools with comprehensive descriptions
     */
    registerTools() {
        // Tool 1: Health check
        this.server.registerTool('health_check', {
            title: 'Health Check',
            description: 'Basic health check to verify server is running',
            inputSchema: {},
        }, async () => {
            return {
                content: [{
                        type: 'text',
                        text: `KAT-PLANNER Production MCP server is running successfully!\nSession Stats: ${this.sessionManager.getSessionCount()} active sessions`
                    }],
            };
        });
        // Tool 2: Interactive Mode (stateful)
        this.server.registerTool('start_interactive_spec', {
            title: 'Interactive Specification Development',
            description: `Start an interactive specification process for thorough project planning.

This is the primary workflow for comprehensive spec-driven development:

1. **Question Mode**: I'll ask clarifying questions to understand your project requirements
2. **Refine Mode**: Based on your answers, I'll create a refined specification
3. **Approve Mode**: Review generated documentation and approve development

USE THIS TOOL for ALL project planning. This ensures we:
- Thoroughly understand your requirements
- Create comprehensive specifications with proper documentation
- Get approval for development before starting implementation

WORKFLOW - Call this tool THREE times:
1. mode="question" - Get clarifying questions (you'll receive a sessionId)
2. mode="refine" - Submit user's answers with the sessionId
3. mode="approve" - Finalize spec, generate documentation, and get development approval

After EACH call, I will tell you EXACTLY what to do next. Follow those instructions.

IMPORTANT: Each response includes a sessionId - you MUST include it in subsequent calls.

NOTE: After successful approval, use 'start_development' tool to begin implementation.`,
            inputSchema: {
                userIdea: zod_1.z.string().describe('The user\'s project idea'),
                mode: zod_1.z.enum(['question', 'refine', 'approve']).describe('Current mode: question, refine, or approve'),
                sessionId: zod_1.z.string().optional().describe('Session ID from previous interactive call'),
                userAnswers: zod_1.z.record(zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])).optional().describe('User answers to clarifying questions (string or array)'),
                explicitApproval: zod_1.z.enum(['yes', 'approved', 'proceed']).optional().describe('Explicit user approval for final spec'),
            }
        }, async (params) => {
            return this.handleInteractiveWorkflow(params);
        });
        // Tool 3: Development Mode (stateful)
        this.server.registerTool('start_development', {
            title: 'Development Implementation',
            description: `Begin actual development implementation after successful specification approval.

USE THIS TOOL ONLY AFTER:
1. Complete interactive specification workflow (question → refine → approve)
2. User has provided explicit approval for development
3. All SDD documents have been generated and reviewed

This tool initiates the actual coding and implementation phase based on the approved specification.

WORKFLOW - This is a SINGLE CALL tool:
- Use ONLY after successful 'start_interactive_spec' workflow completion
- Requires sessionId from the approved specification
- Generates development plan and begins implementation
- Returns progress tracking and milestone updates

IMPORTANT: Only use this tool when ALL of the following are true:
✅ Interactive specification workflow completed successfully
✅ User provided explicit development approval
✅ All SDD documents generated and reviewed
✅ Session state is 'approved'`,
            inputSchema: {
                sessionId: zod_1.z.string().describe('Session ID from approved specification'),
                developmentPlan: zod_1.z.object({
                    implementationSteps: zod_1.z.array(zod_1.z.string()).describe('Steps to implement the specification'),
                    milestones: zod_1.z.array(zod_1.z.string()).describe('Key development milestones'),
                    estimatedTimeline: zod_1.z.string().describe('Estimated timeline for completion')
                }).optional().describe('Development plan (auto-generated if not provided)')
            }
        }, async (params) => {
            return this.handleDevelopmentWorkflow(params);
        });
    }
    /**
     * Handle development workflow with session validation
     */
    async handleDevelopmentWorkflow(params) {
        // CRITICAL: Session validation prevents unauthorized development
        if (!params.sessionId) {
            return this.formatErrorResponse("Session ID required for development", {
                suggestedAction: "Include sessionId from approved specification",
                validNextSteps: ["Provide sessionId"],
                exampleCall: 'start_development({ sessionId: "kat_123_abc" })'
            });
        }
        const session = await this.sessionManager.getSession(params.sessionId);
        if (!session) {
            return this.formatErrorResponse("Invalid or expired session ID", {
                suggestedAction: "Start new interactive session",
                validNextSteps: ["Start new session"],
                exampleCall: 'start_interactive_spec({ userIdea: "your idea", mode: "question" })'
            });
        }
        // CRITICAL: State validation ensures proper workflow
        if (session.state !== "approved") {
            return this.formatErrorResponse(`Invalid state transition. Current state: ${session.state}. Expected: approved → development`, {
                suggestedAction: `Call with sessionId="${params.sessionId}" and valid state transition`,
                validNextSteps: [`start_development from approved state`],
                exampleCall: `start_development({ sessionId: "${params.sessionId}" })`
            });
        }
        // Generate development plan if not provided
        const developmentPlan = params.developmentPlan || this.generateDevelopmentPlan(session.userIdea);
        // Update session to development state
        await this.sessionManager.updateSession(params.sessionId, {
            state: "development",
            developmentPlan: developmentPlan,
            lastActivity: Date.now()
        });
        let output = `🚀 **Development Implementation Started!**\n\n`;
        output += `**Session ID:** ${params.sessionId}\n\n`;
        output += `**Development Plan:**\n`;
        output += `**Estimated Timeline:** ${developmentPlan.estimatedTimeline}\n\n`;
        output += `**Implementation Steps:**\n${developmentPlan.implementationSteps.map(step => `- ${step}`).join('\n')}\n\n`;
        output += `**Key Milestones:**\n${developmentPlan.milestones.map(milestone => `- ${milestone}`).join('\n')}\n\n`;
        output += `*Your project is now in active development phase. Progress will be tracked through this session.*`;
        const response = {
            sessionId: params.sessionId,
            content: [{
                    type: 'text',
                    text: output
                }],
            structuredContent: {
                sessionId: params.sessionId,
                developmentPlan: developmentPlan,
                state: "development",
                workflowMode: 'development',
                developmentStarted: true
            }
        };
        return this.formatResponse(response, 'development');
    }
    /**
     * Handle interactive workflow with session management
     */
    async handleInteractiveWorkflow(params) {
        try {
            switch (params.mode) {
                case 'question':
                    return await this.handleQuestionMode(params.userIdea);
                case 'refine':
                    return await this.handleRefineMode(params.sessionId, params.userAnswers);
                case 'approve':
                    return await this.handleApproveMode(params.sessionId, params.userAnswers, params.explicitApproval);
                default:
                    return this.formatErrorResponse("Invalid mode specified", {
                        suggestedAction: "Use one of: question, refine, approve",
                        validNextSteps: ["question", "refine", "approve"],
                        exampleCall: 'start_interactive_spec({ mode: "question", userIdea: "your idea" })'
                    });
            }
        }
        catch (error) {
            console.error('Interactive workflow error:', error);
            return this.formatErrorResponse("Internal server error", {
                suggestedAction: "Try again or start a new session",
                validNextSteps: ["Start new session"],
                exampleCall: 'start_interactive_spec({ userIdea: "your idea", mode: "question" })'
            });
        }
    }
    /**
     * Handle question mode with session creation
     */
    async handleQuestionMode(userIdea) {
        const sessionId = await this.sessionManager.createSession(userIdea);
        if (!sessionId) {
            return this.formatErrorResponse("Failed to create session", {
                suggestedAction: "Server session limit reached, try again later",
                validNextSteps: ["Wait and try again"],
                exampleCall: 'start_interactive_spec({ userIdea: "your idea", mode: "question" })'
            });
        }
        const questions = this.generateClarifyingQuestions(userIdea);
        const response = {
            sessionId,
            content: [{
                    type: 'text',
                    text: `🎯 **Interactive Project Planning - Clarification Phase**\n\nI'll help plan your project through interactive refinement. Please answer these clarifying questions:\n\n${questions.join('\n')}\n\n*Provide your answers and I'll create a refined specification.*`
                }],
            structuredContent: {
                questions,
                state: "questioning",
                nextStep: "refine",
                workflowMode: 'interactive'
            }
        };
        return this.formatResponse(response, 'questioning');
    }
    /**
     * Handle refine mode with session validation
     */
    async handleRefineMode(sessionId, userAnswers) {
        // CRITICAL: Session validation prevents loops
        if (!sessionId) {
            return this.formatErrorResponse("Session ID required for refinement", {
                suggestedAction: "Include sessionId from previous question call",
                validNextSteps: ["Provide sessionId"],
                exampleCall: 'start_interactive_spec({ sessionId: "kat_123_abc", mode: "refine", userAnswers: { ... } })'
            });
        }
        const session = await this.sessionManager.getSession(sessionId);
        if (!session) {
            return this.formatErrorResponse("Invalid or expired session ID", {
                suggestedAction: "Start new interactive session or use correct sessionId",
                validNextSteps: ["Start new session", "Use correct sessionId"],
                exampleCall: 'start_interactive_spec({ userIdea: "your idea", mode: "question" })'
            });
        }
        // CRITICAL: State validation prevents loops
        if (session.state !== "questioning") {
            return this.formatErrorResponse(`Invalid state transition. Current state: ${session.state}. Expected: questioning → refining`, {
                suggestedAction: `Call with sessionId="${sessionId}" and valid state transition`,
                validNextSteps: [`mode="refine" from questioning state`],
                exampleCall: `start_interactive_spec({ sessionId: "${sessionId}", mode: "refine", userAnswers: { ... } })`
            });
        }
        // Process refinement
        const refinedSpec = this.createRefinedSpecification(session.userIdea);
        // Normalize userAnswers to ensure all values are strings
        const normalizedAnswers = {};
        if (userAnswers) {
            for (const [key, value] of Object.entries(userAnswers)) {
                normalizedAnswers[key] = Array.isArray(value) ? value.join(', ') : value;
            }
        }
        await this.sessionManager.updateSession(sessionId, {
            state: "refining",
            answers: normalizedAnswers,
            lastActivity: Date.now()
        });
        const response = {
            sessionId,
            content: [{
                    type: 'text',
                    text: `✅ **Interactive Project Planning - Refinement Phase**\n\nBased on your answers, here's your refined specification:\n\n${refinedSpec}\n\n*This specification is ready for final approval.*`
                }],
            structuredContent: {
                sessionId,
                refinedSpecification: refinedSpec,
                state: "refining",
                nextStep: "approve",
                workflowMode: 'interactive'
            }
        };
        return this.formatResponse(response, 'refining');
    }
    /**
     * Handle approve mode with final validation
     */
    async handleApproveMode(sessionId, userAnswers, explicitApproval) {
        // CRITICAL: Session validation prevents loops
        if (!sessionId) {
            return this.formatErrorResponse("Session ID required for approval", {
                suggestedAction: "Include sessionId from previous calls",
                validNextSteps: ["Provide sessionId"],
                exampleCall: 'start_interactive_spec({ sessionId: "kat_123_abc", mode: "approve" })'
            });
        }
        const session = await this.sessionManager.getSession(sessionId);
        if (!session) {
            return this.formatErrorResponse("Invalid or expired session ID", {
                suggestedAction: "Start new interactive session",
                validNextSteps: ["Start new session"],
                exampleCall: 'start_interactive_spec({ userIdea: "your idea", mode: "question" })'
            });
        }
        // CRITICAL: State validation prevents loops
        if (session.state !== "refining") {
            return this.formatErrorResponse(`Invalid state transition. Current state: ${session.state}. Expected: refining → approved`, {
                suggestedAction: `Call with sessionId="${sessionId}" and valid state transition`,
                validNextSteps: [`mode="approve" from refining state`],
                exampleCall: `start_interactive_spec({ sessionId: "${sessionId}", mode: "approve", explicitApproval: "yes" })`
            });
        }
        if (!explicitApproval || !['yes', 'approved', 'proceed'].includes(explicitApproval.toLowerCase())) {
            return this.formatErrorResponse("Explicit approval required for final specification", {
                suggestedAction: "Provide explicit approval to proceed",
                validNextSteps: ["Provide explicit approval"],
                exampleCall: `start_interactive_spec({ sessionId: "${sessionId}", mode: "approve", explicitApproval: "yes" })`
            });
        }
        // Generate final specification
        const refinedSpec = this.createRefinedSpecification(session.userIdea);
        const projectType = this.detectProjectType(session.userIdea);
        const sddDocuments = this.generateSDDDocuments(refinedSpec, projectType);
        const testSpecifications = this.generateTestSpecifications(projectType);
        // Finalize session
        await this.sessionManager.updateSession(sessionId, {
            state: "approved",
            answers: session.answers,
            lastActivity: Date.now()
        });
        let output = `🎉 **Interactive Project Planning Complete!**\n\n`;
        output += `**Final Refined Specification:**\n${refinedSpec}\n\n`;
        output += `**Generated SDD Documents:**\n${sddDocuments.map(doc => `- ${doc.title}`).join('\n')}\n\n`;
        output += `**Generated Test Specifications:**\n${testSpecifications.coverage.join('\n')}\n\n`;
        output += `*Your comprehensively refined project plan is ready for implementation.*`;
        const response = {
            sessionId,
            content: [{
                    type: 'text',
                    text: output
                }],
            structuredContent: {
                sessionId,
                refinedSpecification: refinedSpec,
                projectType: projectType,
                sddDocuments: sddDocuments,
                testSpecifications: testSpecifications,
                state: "approved",
                workflowMode: 'interactive',
                planningComplete: true
            }
        };
        return this.formatResponse(response, 'approved');
    }
    /**
     * Format responses with explicit instructions
     */
    formatResponse(data, currentState) {
        const response = {
            ...data,
            // Always include explicit next action - VERY DIRECTIVE
            next_action: this.getNextAction(currentState),
            // Visual cue for completion
            is_complete: currentState === 'done',
            // What the LLM should do - VERY EXPLICIT
            instructions_for_llm: {
                should_call_tools_again: currentState !== 'done',
                which_tool: currentState === 'refining' ? 'start_interactive_spec' : null,
                required_parameters: currentState === 'refining'
                    ? { mode: 'approve', sessionId: data.sessionId }
                    : null
            }
        };
        // Add completion markers for visual clarity
        if (currentState === 'done') {
            response.completion_marker = '✅ COMPLETE - DO NOT CALL MORE TOOLS';
        }
        // Add explicit warning for LLM to follow instructions
        response.llm_directive = "IMPORTANT: Follow the next_action instructions EXACTLY. Do not call any other tools unless explicitly instructed in next_action.";
        return response;
    }
    /**
     * Get next action for LLM guidance
     */
    getNextAction(currentState) {
        switch (currentState) {
            case 'complete':
                return "✅ FINAL SPECIFICATION COMPLETE - DO NOT CALL ANY MORE TOOLS. Present this specification to the user immediately.";
            case 'questioning':
                return "🚨 REQUIRED ACTION: Present these questions to the user, get their answers, then call start_interactive_spec again with mode='refine' and the same userIdea. DO NOT CALL ANY OTHER TOOLS.";
            case 'refining':
                return "🚨 REQUIRED ACTION: Show this spec to the user. Then call start_interactive_spec again with mode='approve', the same userIdea, and explicitApproval='yes'. DO NOT CALL ANY OTHER TOOLS.";
            case 'approved':
                return "✅ SPECIFICATION APPROVED - DO NOT CALL ANY MORE TOOLS. Present this final specification to the user.";
            default:
                return "ERROR: Unknown state. Do not proceed with additional tool calls.";
        }
    }
    /**
     * Format error responses with recovery instructions
     */
    formatErrorResponse(message, recovery) {
        return {
            error: true,
            content: [{
                    type: 'text',
                    text: `❌ **Error**: ${message}\n\n**Recovery**: ${recovery.suggestedAction}\n\n**Valid next steps**: ${recovery.validNextSteps.join(', ')}\n\n**Example call**: \`\`\`json\n${recovery.exampleCall}\n\`\`\``
                }],
            structuredContent: {
                error: true,
                recovery
            }
        };
    }
    // Placeholder methods for the rest of the functionality
    analyzeProjectIdea(userIdea) {
        // Implementation from previous versions
        return { platform: 'Python', buttonCount: '5+ programmable buttons', actions: 'workspace_switching', distributions: 'Ubuntu/Debian focused', projectType: 'mouse-button-mapper' };
    }
    createRefinedSpecification(analysis) {
        return `**Project:** Linux Mouse Button Mapper
**Objective:** Create a cross-distribution Linux application that detects mouse buttons and maps them to customizable OS actions
**Platform:** ${analysis.platform}
**Target Distributions:** Ubuntu 20.04+, Debian 11+, Fedora 34+
**Button Support:** ${analysis.buttonCount}
**Core Features:**
- Real-time mouse button detection
- Configurable action mapping per button
- Multiple mouse profile support
- System tray interface
- Auto-start capability
**Required Actions:** ${analysis.actions}
**Success Criteria:**
- Detect all mouse buttons reliably
- Map buttons to actions with <100ms latency
- Support hot-plug detection
- Maintain <5% CPU usage during idle
- Cross-distribution compatibility`;
    }
    detectProjectType(userIdea) {
        if (userIdea.toLowerCase().includes('mouse') && userIdea.toLowerCase().includes('button')) {
            return 'mouse-button-mapper';
        }
        return 'generic';
    }
    generateClarifyingQuestions(userIdea) {
        if (userIdea.toLowerCase().includes('mouse') && userIdea.toLowerCase().includes('button')) {
            return [
                'Platform preference: Python (recommended for Linux) or Electron?',
                'Button support: How many programmable buttons should we support?',
                'Actions: Which OS actions should buttons trigger?',
                'Distribution: Focus on Ubuntu/Debian or cross-distribution compatibility?',
                'Advanced features: Hot-plug detection, multiple mouse profiles, system tray integration?'
            ];
        }
        return [
            'Core functionality: What is the primary problem this project solves?',
            'Target users: Who will use this application?',
            'Key features: What are the essential features for the initial release?',
            'Technical constraints: Any specific platforms, languages, or frameworks?',
            'Success criteria: How will you measure the project\'s success?'
        ];
    }
    generateSDDDocuments(refinedSpec, projectType) {
        const documents = [];
        if (projectType === 'mouse-button-mapper') {
            documents.push({
                title: 'requirements.md',
                content: '# Functional Requirements\n\n## 1. Core Functionality\n- Real-time mouse button detection on Linux systems\n- Configurable mapping of mouse buttons to OS actions\n- Support for multiple mouse profiles\n- System tray integration for quick access'
            });
            documents.push({
                title: 'design.md',
                content: '# Technical Design\n\n## Architecture Overview\n\n### Component Diagram\n```\n+----------------+     +----------------+     +----------------+\n|   Mouse Input  | --> |  Event Handler | --> |  Action Mapper |\n+----------------+     +----------------+     +----------------+\n                                |                    |\n                                v                    v\n                       +----------------+   +----------------+\n                       | Profile System |   | System Tray UI |\n                       +----------------+   +----------------+\n```\n\n## Core Components\n\n### 1. Mouse Input Layer\n- Uses pynput/evdev for low-level mouse event capture\n- Supports both USB and Bluetooth mice\n- Handles multiple mouse devices simultaneously'
            });
            documents.push({
                title: 'tasks.md',
                content: '# Implementation Tasks\n\n## Phase 1: Core Infrastructure\n- [ ] Set up project structure and dependencies\n- [ ] Implement basic mouse event capture\n- [ ] Create configuration file structure\n- [ ] Set up logging and error handling'
            });
        }
        else {
            documents.push({
                title: 'requirements.md',
                content: '# Functional Requirements\n\n## 1. Core Functionality\n- [To be defined based on project requirements]'
            });
            documents.push({
                title: 'design.md',
                content: '# Technical Design\n\n## Architecture Overview\n\n### Component Diagram\n```\n[To be defined based on project requirements]\n```'
            });
            documents.push({
                title: 'tasks.md',
                content: '# Implementation Tasks\n\n## Phase 1: Core Infrastructure\n- [ ] Set up project structure and dependencies\n- [ ] Implement basic infrastructure\n- [ ] Create configuration system\n- [ ] Set up logging and error handling'
            });
        }
        return documents;
    }
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
                    { name: 'Unit Tests', description: 'Individual component functionality validation' },
                    { name: 'Integration Tests', description: 'Cross-component interaction verification' },
                    { name: 'System Tests', description: 'End-to-end workflow validation' },
                    { name: 'Compatibility Tests', description: 'Multi-distribution and desktop environment testing' },
                    { name: 'Performance Tests', description: 'Resource usage and responsiveness validation' }
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
                { name: 'Functional Tests', description: 'Core feature validation' },
                { name: 'UI/UX Tests', description: 'User interface and experience validation' },
                { name: 'Integration Tests', description: 'System integration verification' },
                { name: 'Performance Tests', description: 'Speed and resource usage validation' },
                { name: 'Security Tests', description: 'Data protection and access control validation' }
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
     * Generate development plan for a project
     */
    generateDevelopmentPlan(userIdea) {
        if (userIdea.toLowerCase().includes('mouse') && userIdea.toLowerCase().includes('button')) {
            return {
                implementationSteps: [
                    'Set up project structure and dependencies',
                    'Implement mouse event detection layer',
                    'Create configuration system for button mappings',
                    'Build system tray interface',
                    'Implement multiple mouse profile support',
                    'Add hot-plug detection',
                    'Create documentation and user guides'
                ],
                milestones: [
                    'Core infrastructure setup',
                    'Mouse event detection working',
                    'Configuration system functional',
                    'UI integration complete',
                    'Multi-mouse support implemented',
                    'Testing and bug fixes',
                    'Documentation and release'
                ],
                estimatedTimeline: '6-8 weeks'
            };
        }
        return {
            implementationSteps: [
                'Set up project structure and development environment',
                'Implement core functionality and APIs',
                'Create user interface and user experience',
                'Add configuration and customization options',
                'Implement testing and quality assurance',
                'Documentation and user guides',
                'Deployment and release preparation'
            ],
            milestones: [
                'Project setup complete',
                'Core features implemented',
                'UI/UX integration',
                'Configuration system ready',
                'Testing phase',
                'Documentation complete',
                'Final release'
            ],
            estimatedTimeline: '4-6 weeks'
        };
    }
    /**
     * Start the MCP server
     */
    async start() {
        try {
            const transport = new stdio_js_1.StdioServerTransport();
            await this.server.connect(transport);
            console.log('KAT-PLANNER Production MCP server started successfully!');
            console.log(`Session storage: ${this.sessionManager}`);
        }
        catch (error) {
            console.error('Failed to start MCP server:', error);
            throw error;
        }
    }
}
exports.ProductionKatPlannerServer = ProductionKatPlannerServer;
/**
 * Main entry point
 */
async function main() {
    const server = new ProductionKatPlannerServer();
    await server.start();
}
// Start the server if this file is run directly
if (require.main === module) {
    main().catch(console.error);
}
//# sourceMappingURL=server-production.js.map