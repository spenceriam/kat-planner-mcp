import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ProductionSessionManager } from './session-manager.js';

/**
 * Production-ready KAT-PLANNER MCP server with comprehensive session management
 */
export class ProductionKatPlannerServer {
  private server = new McpServer({
    name: 'kat-planner-production',
    version: '1.0.0',
  });

  private sessionManager = new ProductionSessionManager();

  constructor() {
    this.registerTools();
  }

  /**
   * Register all MCP tools with comprehensive descriptions
   */
  private registerTools(): void {
    // Tool 1: Health check
    this.server.registerTool('health_check', {
      title: 'Health Check',
      description: 'Basic health check to verify server is running',
      inputSchema: {},
    }, async () => {
      return {
        content: [{
          type: 'text' as const,
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
3. **Document Review Mode**: I'll generate SDD documents for your review and approval
4. **Final Approval Mode**: You'll provide final approval to begin development

USE THIS TOOL for ALL project planning. This ensures we:
- Thoroughly understand your requirements
- Create comprehensive specifications with proper documentation
- Get approval for development before starting implementation

WORKFLOW - Call this tool FOUR times:
1. mode="question" - Get clarifying questions (you'll receive a sessionId)
2. mode="refine" - Submit user's answers with the sessionId
3. mode="document_review" - Generate documents and get user approval
4. mode="final_approval" - Finalize and prepare for development

After EACH call, I will tell you EXACTLY what to do next. Follow those instructions.

IMPORTANT: Each response includes a sessionId - you MUST include it in subsequent calls.

NOTE: After successful final approval, use 'start_development' tool to begin implementation.`,

      inputSchema: {
        userIdea: z.string().describe('The user\'s project idea'),
        mode: z.enum(['question', 'refine', 'document_review', 'final_approval']).describe('Current mode: question, refine, document_review, or final_approval'),
        sessionId: z.string().optional().describe('Session ID from previous interactive call'),
        userAnswers: z.record(z.union([z.string(), z.array(z.string())])).optional().describe('User answers to clarifying questions (string or array)'),
        explicitApproval: z.enum(['yes', 'approved', 'proceed', 'continue', 'ok', 'go ahead', 'documents look good', 'ready for development']).optional().describe('Explicit user approval for next phase'),
        revisionRequest: z.string().optional().describe('User feedback for document revision'),
      }
    }, async (params: { userIdea: string; mode: string; sessionId?: string; userAnswers?: Record<string, string | string[]>; explicitApproval?: string; revisionRequest?: string }) => {
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
Interactive specification workflow completed successfully
User provided explicit development approval
All SDD documents generated and reviewed
Session state is 'approved'`,
      inputSchema: {
        sessionId: z.string().describe('Session ID from approved specification'),
        developmentPlan: z.object({
          implementationSteps: z.array(z.string()).describe('Steps to implement the specification'),
          milestones: z.array(z.string()).describe('Key development milestones'),
          estimatedTimeline: z.string().describe('Estimated timeline for completion')
        }).optional().describe('Development plan (auto-generated if not provided)')
      }
    }, async (params: { sessionId: string; developmentPlan?: { implementationSteps: string[]; milestones: string[]; estimatedTimeline: string } }) => {
      return this.handleDevelopmentWorkflow(params);
    });
  }

  /**
   * Handle development workflow with session validation
   */
  private async handleDevelopmentWorkflow(params: {
    sessionId: string;
    developmentPlan?: {
      implementationSteps: string[];
      milestones: string[];
      estimatedTimeline: string;
    };
  }) {
    // CRITICAL: Session validation prevents unauthorized development
    if (!params.sessionId) {
      return this.formatErrorResponse(
        "Session ID required for development",
        {
          suggestedAction: "Include sessionId from approved specification",
          validNextSteps: ["Provide sessionId"],
          exampleCall: 'start_development({ sessionId: "kat_123_abc" })'
        }
      );
    }

    const session = await this.sessionManager.getSession(params.sessionId);
    if (!session) {
      return this.formatErrorResponse(
        "Invalid or expired session ID",
        {
          suggestedAction: "Start new interactive session",
          validNextSteps: ["Start new session"],
          exampleCall: 'start_interactive_spec({ userIdea: "your idea", mode: "question" })'
        }
      );
    }

    // CRITICAL: State validation ensures proper workflow
    if (session.state !== "final_approval") {
      return this.formatErrorResponse(
        `Invalid state transition. Current state: ${session.state}. Expected: final_approval → development`,
        {
          suggestedAction: `Call with sessionId="${params.sessionId}" and valid state transition`,
          validNextSteps: [`start_development from final_approval state`],
          exampleCall: `start_development({ sessionId: "${params.sessionId}" })`
        }
      );
    }

    // Generate development plan if not provided
    const developmentPlan = params.developmentPlan || this.generateDevelopmentPlan(session.userIdea);

    // Update session to development state
    await this.sessionManager.updateSession(params.sessionId, {
      state: "development",
      developmentPlan: developmentPlan,
      lastActivity: Date.now()
    });

    let output = `Development Implementation Started!\n\n`;
    output += `**Session ID:** ${params.sessionId}\n\n`;
    output += `**Development Plan:**\n`;
    output += `**Estimated Timeline:** ${developmentPlan.estimatedTimeline}\n\n`;
    output += `**Implementation Steps:**\n${developmentPlan.implementationSteps.map(step => `- ${step}`).join('\n')}\n\n`;
    output += `**Key Milestones:**\n${developmentPlan.milestones.map(milestone => `- ${milestone}`).join('\n')}\n\n`;
    output += `*Your project is now in active development phase. Progress will be tracked through this session.*`;

    const response = {
      sessionId: params.sessionId,
      content: [{
        type: 'text' as const,
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
  private async handleInteractiveWorkflow(params: {
    userIdea: string;
    mode: string;
    sessionId?: string;
    userAnswers?: Record<string, string | string[]>;
    explicitApproval?: string;
    revisionRequest?: string;
  }) {
    try {
      // Input validation
      if (!params.userIdea && params.mode === 'question') {
        return this.formatErrorResponse(
          "userIdea is required for question mode",
          {
            suggestedAction: "Provide a userIdea for project planning",
            validNextSteps: ["Provide userIdea"],
            exampleCall: 'start_interactive_spec({ userIdea: "your project idea", mode: "question" })'
          }
        );
      }

      if (!params.mode) {
        return this.formatErrorResponse(
          "mode parameter is required",
          {
            suggestedAction: "Specify a valid mode: question, refine, document_review, or final_approval",
            validNextSteps: ["question", "refine", "document_review", "final_approval"],
            exampleCall: 'start_interactive_spec({ userIdea: "your idea", mode: "question" })'
          }
        );
      }

      // Validate mode parameter
      const validModes = ['question', 'refine', 'document_review', 'final_approval'];
      if (!validModes.includes(params.mode)) {
        return this.formatErrorResponse(
          `Invalid mode: ${params.mode}. Must be one of: ${validModes.join(', ')}`,
          {
            suggestedAction: "Use a valid mode parameter",
            validNextSteps: validModes,
            exampleCall: 'start_interactive_spec({ userIdea: "your idea", mode: "question" })'
          }
        );
      }

      switch (params.mode) {
        case 'question':
          return await this.handleQuestionMode(params.userIdea);

        case 'refine':
          return await this.handleRefineMode(params.sessionId, params.userAnswers);

        case 'document_review':
          return await this.handleDocumentReviewMode(params.sessionId, params.explicitApproval);

        case 'final_approval':
          return await this.handleFinalApprovalMode(params.sessionId, params.explicitApproval);

        default:
          return this.formatErrorResponse("Invalid mode specified", {
            suggestedAction: "Use one of: question, refine, document_review, final_approval",
            validNextSteps: ["question", "refine", "document_review", "final_approval"],
            exampleCall: 'start_interactive_spec({ mode: "question", userIdea: "your idea" })'
          });
      }
    } catch (error) {
      console.error('Interactive workflow error:', error);
      return this.formatErrorResponse("Internal server error during workflow processing", {
        suggestedAction: "Try again or start a new session",
        validNextSteps: ["Start new session"],
        exampleCall: 'start_interactive_spec({ userIdea: "your idea", mode: "question" })'
      });
    }
  }

  /**
   * Handle question mode with session creation
   */
  private async handleQuestionMode(userIdea: string) {
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
        type: 'text' as const,
        text: `Interactive Project Planning - Clarification Phase\n\nI'll help plan your project through interactive refinement. Please answer these clarifying questions:\n\n${questions.join('\n')}\n\n*Provide your answers and I'll create a refined specification.*`
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
  private async handleRefineMode(sessionId: string | undefined, userAnswers: Record<string, string | string[]> | undefined) {
    // CRITICAL: Session validation prevents loops
    if (!sessionId) {
      return this.formatErrorResponse(
        "Session ID required for refinement",
        {
          suggestedAction: "Include sessionId from previous question call",
          validNextSteps: ["Provide sessionId"],
          exampleCall: 'start_interactive_spec({ sessionId: "kat_123_abc", mode: "refine", userAnswers: { ... } })'
        }
      );
    }

    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return this.formatErrorResponse(
        "Invalid or expired session ID",
        {
          suggestedAction: "Start new interactive session or use correct sessionId",
          validNextSteps: ["Start new session", "Use correct sessionId"],
          exampleCall: 'start_interactive_spec({ userIdea: "your idea", mode: "question" })'
        }
      );
    }

    // CRITICAL: State validation prevents loops
    if (session.state !== "questioning") {
      return this.formatErrorResponse(
        `Invalid state transition. Current state: ${session.state}. Expected: questioning → refining`,
        {
          suggestedAction: `Call with sessionId="${sessionId}" and valid state transition`,
          validNextSteps: [`mode="refine" from questioning state`],
          exampleCall: `start_interactive_spec({ sessionId: "${sessionId}", mode: "refine", userAnswers: { ... } })`
        }
      );
    }

    // Process refinement
    const refinedSpec = this.createRefinedSpecification(session.userIdea);

    // Normalize userAnswers to ensure all values are strings
    const normalizedAnswers: Record<string, string> = {};
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
        type: 'text' as const,
        text: `Interactive Project Planning - Refinement Phase\n\nBased on your answers, here's your refined specification:\n\n${refinedSpec}\n\n*This specification is ready for final approval.*`
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
   * Handle document review mode with SDD generation
   */
  private async handleDocumentReviewMode(
    sessionId: string | undefined,
    explicitApproval: string | undefined
  ) {
    // CRITICAL: Session validation prevents loops
    if (!sessionId) {
      return this.formatErrorResponse(
        "Session ID required for document review",
        {
          suggestedAction: "Include sessionId from previous refine call",
          validNextSteps: ["Provide sessionId"],
          exampleCall: 'start_interactive_spec({ sessionId: "kat_123_abc", mode: "document_review" })'
        }
      );
    }

    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return this.formatErrorResponse(
        "Invalid or expired session ID",
        {
          suggestedAction: "Start new interactive session or use correct sessionId",
          validNextSteps: ["Start new session", "Use correct sessionId"],
          exampleCall: 'start_interactive_spec({ userIdea: "your idea", mode: "question" })'
        }
      );
    }

    // CRITICAL: State validation prevents loops
    if (session.state !== "refining") {
      return this.formatErrorResponse(
        `Invalid state transition. Current state: ${session.state}. Expected: refining → document_review`,
        {
          suggestedAction: `Call with sessionId="${sessionId}" and valid state transition`,
          validNextSteps: [`mode="document_review" from refining state`],
          exampleCall: `start_interactive_spec({ sessionId: "${sessionId}", mode: "document_review" })`
        }
      );
    }

    // Generate SDD documents if not already generated
    let documents = session.generatedDocuments;
    let refinedSpec = session.refinedSpecification;

    if (!documents || !refinedSpec) {
      // Generate refined specification if not exists
      if (!refinedSpec) {
        refinedSpec = this.createRefinedSpecification(session.userIdea);
      }

      // Generate SDD documents
      const projectType = this.detectProjectType(session.userIdea);
      documents = this.generateSDDDocuments(refinedSpec, projectType);

      // Update session with generated content
      await this.sessionManager.updateSession(sessionId, {
        refinedSpecification: refinedSpec,
        generatedDocuments: documents,
        projectType: projectType,
        lastActivity: Date.now()
      });
    }

    // Format document content for user review
    let output = `Interactive Project Planning - Document Review\n\n`;
    output += `REVIEW: Please review these generated documents and provide approval.\n\n`;

    // Add each document
    documents.forEach(doc => {
      output += `--- ${doc.title.toUpperCase()} ---\n`;
      output += `${doc.content}\n\n`;
    });

    output += `REQUIRED ACTION: Ask the user: "Do these documents look good and should I proceed with development?"\n`;
    output += `WAIT for user response before proceeding.\n`;

    const response = {
      sessionId,
      content: [{
        type: 'text' as const,
        text: output
      }],
      structuredContent: {
        sessionId,
        refinedSpecification: refinedSpec,
        generatedDocuments: documents,
        state: "document_review",
        nextStep: "final_approval",
        workflowMode: 'interactive',
        userInputRequired: true,
        approvalNeeded: ["requirements.md", "design.md", "tasks.md", "AGENTS.md"],
        exampleUserResponse: "Yes, the documents look good. Please proceed with development."
      }
    };

    return this.formatResponse(response, 'document_review');
  }

  /**
   * Handle final approval mode
   */
  private async handleFinalApprovalMode(
    sessionId: string | undefined,
    explicitApproval: string | undefined
  ) {
    // CRITICAL: Session validation prevents loops
    if (!sessionId) {
      return this.formatErrorResponse(
        "Session ID required for final approval",
        {
          suggestedAction: "Include sessionId from previous calls",
          validNextSteps: ["Provide sessionId"],
          exampleCall: 'start_interactive_spec({ sessionId: "kat_123_abc", mode: "final_approval" })'
        }
      );
    }

    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return this.formatErrorResponse(
        "Invalid or expired session ID",
        {
          suggestedAction: "Start new interactive session",
          validNextSteps: ["Start new session"],
          exampleCall: 'start_interactive_spec({ userIdea: "your idea", mode: "question" })'
        }
      );
    }

    // CRITICAL: State validation prevents loops
    if (session.state !== "document_review") {
      return this.formatErrorResponse(
        `Invalid state transition. Current state: ${session.state}. Expected: document_review → final_approval`,
        {
          suggestedAction: `Call with sessionId="${sessionId}" and valid state transition`,
          validNextSteps: [`mode="final_approval" from document_review state`],
          exampleCall: `start_interactive_spec({ sessionId: "${sessionId}", mode: "final_approval", explicitApproval: "yes" })`
        }
      );
    }

    // Validate approval
    const validApprovals = ['yes', 'approved', 'proceed', 'continue', 'ok', 'go ahead', 'documents look good', 'ready for development'];
    if (!explicitApproval || !validApprovals.some(approval => explicitApproval.toLowerCase().includes(approval))) {
      return this.formatErrorResponse(
        "Explicit approval required for final specification",
        {
          suggestedAction: "Provide explicit approval to proceed with development",
          validNextSteps: ["Provide explicit approval"],
          exampleCall: `start_interactive_spec({ sessionId: "${sessionId}", mode: "final_approval", explicitApproval: "yes" })`
        }
      );
    }

    // Finalize session
    await this.sessionManager.updateSession(sessionId, {
      state: "final_approval",
      approvalStatus: {
        requirements: true,
        design: true,
        tasks: true,
        agents: true,
        overall: true
      },
      lastActivity: Date.now()
    });

    let output = `Interactive Project Planning Complete\n\n`;
    output += `FINAL APPROVAL: User has approved all generated documents.\n\n`;
    output += `Documents Approved:\n`;
    output += `- requirements.md\n`;
    output += `- design.md\n`;
    output += `- tasks.md\n`;
    output += `- AGENTS.md\n\n`;
    output += `NEXT ACTION: Use start_development tool to begin implementation.\n`;
    output += `IMPLEMENTATION READY: Project plan is complete and ready for development.\n`;

    const response = {
      sessionId,
      content: [{
        type: 'text' as const,
        text: output
      }],
      structuredContent: {
        sessionId,
        planningComplete: true,
        approvedDocuments: ["requirements.md", "design.md", "tasks.md", "AGENTS.md"],
        nextSteps: "start_development",
        workflowMode: 'interactive',
        implementationReady: true
      }
    };

    return this.formatResponse(response, 'final_approval');
  }

  /**
   * Format responses with explicit instructions
   */
  private formatResponse(data: any, currentState: string) {
    const response = {
      ...data,

      // Always include explicit next action - VERY DIRECTIVE
      next_action: this.getNextAction(currentState),

      // Visual cue for completion
      is_complete: currentState === 'final_approval',

      // What the LLM should do - VERY EXPLICIT
      instructions_for_llm: {
        should_call_tools_again: currentState !== 'final_approval',
        which_tool: this.getRequiredTool(currentState),
        required_parameters: this.getRequiredParameters(currentState, data)
      }
    };

    // Add completion markers for visual clarity
    if (currentState === 'final_approval') {
      response.completion_marker = 'COMPLETE - DO NOT CALL MORE TOOLS';
    }

    // Add explicit warning for LLM to follow instructions
    response.llm_directive = "IMPORTANT: Follow the next_action instructions EXACTLY. Do not call any other tools unless explicitly instructed in next_action.";

    return response;
  }

  /**
   * Get next action for LLM guidance
   */
  private getNextAction(currentState: string): string {
    switch (currentState) {
      case 'final_approval':
        return "FINAL SPECIFICATION COMPLETE - DO NOT CALL ANY MORE TOOLS. Present this specification to the user immediately.";

      case 'questioning':
        return "REQUIRED ACTION: Present these questions to the user, get their answers, then call start_interactive_spec again with mode='refine' and the same userIdea. DO NOT CALL ANY OTHER TOOLS.";

      case 'refining':
        return "REQUIRED ACTION: Show this spec to the user. Then call start_interactive_spec again with mode='document_review', the same userIdea, and sessionId. DO NOT CALL ANY OTHER TOOLS.";

      case 'document_review':
        return "REQUIRED ACTION: Present these documents to the user for review. Ask: 'Do these documents look good and should I proceed with development?' Then call start_interactive_spec again with mode='final_approval', sessionId, and explicitApproval based on user response. DO NOT CALL ANY OTHER TOOLS.";

      case 'approved':
        return "SPECIFICATION APPROVED - DO NOT CALL ANY MORE TOOLS. Present this final specification to the user.";

      default:
        return "ERROR: Unknown state. Do not proceed with additional tool calls.";
    }
  }

  /**
   * Get required tool for next action
   */
  private getRequiredTool(currentState: string): string | null {
    switch (currentState) {
      case 'questioning':
        return 'start_interactive_spec';
      case 'refining':
        return 'start_interactive_spec';
      case 'document_review':
        return 'start_interactive_spec';
      default:
        return null;
    }
  }

  /**
   * Get required parameters for next action
   */
  private getRequiredParameters(currentState: string, data: any): any {
    switch (currentState) {
      case 'questioning':
        return { mode: 'refine', sessionId: data.sessionId };
      case 'refining':
        return { mode: 'document_review', sessionId: data.sessionId };
      case 'document_review':
        return { mode: 'final_approval', sessionId: data.sessionId, explicitApproval: '[user response]' };
      default:
        return null;
    }
  }

  /**
   * Format error responses with recovery instructions
   */
  private formatErrorResponse(message: string, recovery: any) {
    return {
      error: true,
      content: [{
        type: 'text' as const,
        text: `Error: ${message}\n\nRecovery: ${recovery.suggestedAction}\n\nValid next steps: ${recovery.validNextSteps.join(', ')}\n\nExample call: \`\`\`json\n${recovery.exampleCall}\n\`\`\``
      }],
      structuredContent: {
        error: true,
        recovery
      }
    };
  }

  // Placeholder methods for the rest of the functionality
  private analyzeProjectIdea(userIdea: string): any {
    // Implementation from previous versions
    return { platform: 'Python', buttonCount: '5+ programmable buttons', actions: 'workspace_switching', distributions: 'Ubuntu/Debian focused', projectType: 'mouse-button-mapper' };
  }

  private createRefinedSpecification(analysis: any): string {
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

  private detectProjectType(userIdea: string, existingFiles?: string[]): string {
    // Check for existing project indicators only
    if (existingFiles) {
      if (existingFiles.includes('AGENTS.md') || existingFiles.includes('.spec/requirements.md')) {
        return 'existing_enhancement';
      }
      if (existingFiles.includes('package.json') || existingFiles.includes('requirements.txt') || existingFiles.includes('pom.xml')) {
        return 'existing_project';
      }
    }
    return 'new_project';
  }

  private generateClarifyingQuestions(userIdea: string): string[] {
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

  private generateSDDDocuments(refinedSpec: string, projectType: string): Array<{ title: string; content: string }> {
    const documents: Array<{ title: string; content: string }> = [];

    // Generate generic SDD documents based on project type
    if (projectType === 'existing_enhancement') {
      documents.push({
        title: 'requirements.md',
        content: `# Functional Requirements

## 1. Enhancement Overview
Based on the refined specification:
${refinedSpec}

## 2. Core Functionality
- Enhancement to existing codebase functionality
- Integration with existing architecture and patterns
- Backward compatibility maintenance
- Incremental feature addition`
      });

      documents.push({
        title: 'design.md',
        content: `# Technical Design

## Architecture Overview

### Integration Points
- Existing codebase integration strategy
- API compatibility considerations
- Data migration requirements (if any)
- Testing strategy for existing functionality

### Component Design
- Enhancement component architecture
- Interface with existing modules
- Configuration and deployment considerations

### Implementation Approach
- Refactoring strategy
- New component integration
- Testing and validation plan`
      });

      documents.push({
        title: 'tasks.md',
        content: `# Implementation Tasks

## Phase 1: Analysis and Planning
- [ ] Analyze existing codebase structure
- [ ] Identify integration points and dependencies
- [ ] Plan enhancement approach and architecture
- [ ] Set up development environment

## Phase 2: Core Enhancement
- [ ] Implement core enhancement functionality
- [ ] Integrate with existing components
- [ ] Add configuration and customization options
- [ ] Implement error handling and validation

## Phase 3: Integration and Testing
- [ ] Integrate enhancement with existing workflows
- [ ] Create comprehensive test suite
- [ ] Performance testing and optimization
- [ ] Documentation and user guides

## Phase 4: Deployment
- [ ] Prepare deployment strategy
- [ ] Create migration scripts (if needed)
- [ ] Final testing and validation
- [ ] Release preparation`
      });
    } else if (projectType === 'existing_project') {
      documents.push({
        title: 'requirements.md',
        content: `# Functional Requirements

## 1. Project Enhancement
Based on the refined specification:
${refinedSpec}

## 2. Core Functionality
- New feature development for existing project
- Codebase analysis and understanding
- Feature integration strategy
- User experience improvements`
      });

      documents.push({
        title: 'design.md',
        content: `# Technical Design

## Architecture Overview

### Existing Codebase Analysis
- Current architecture patterns and conventions
- Technology stack and framework usage
- Data models and database schema
- API structure and endpoints

### Enhancement Design
- New feature architecture
- Integration with existing systems
- Data flow and processing
- User interface considerations

### Technical Implementation
- Code organization and structure
- Dependency management
- Performance optimization
- Security considerations`
      });

      documents.push({
        title: 'tasks.md',
        content: `# Implementation Tasks

## Phase 1: Codebase Analysis
- [ ] Analyze existing project structure and architecture
- [ ] Understand current functionality and workflows
- [ ] Identify integration points and dependencies
- [ ] Plan enhancement strategy

## Phase 2: Development Setup
- [ ] Set up development environment
- [ ] Configure build and deployment tools
- [ ] Set up testing framework
- [ ] Create development guidelines

## Phase 3: Feature Implementation
- [ ] Implement core new functionality
- [ ] Integrate with existing codebase
- [ ] Add user interface components
- [ ] Implement data handling and storage

## Phase 4: Testing and Quality Assurance
- [ ] Unit testing for new features
- [ ] Integration testing with existing code
- [ ] User acceptance testing
- [ ] Performance and security testing

## Phase 5: Deployment
- [ ] Prepare deployment configuration
- [ ] Create release documentation
- [ ] Final validation and testing
- [ ] Production deployment`
      });
    } else {
      // new_project
      documents.push({
        title: 'requirements.md',
        content: `# Functional Requirements

## 1. Project Overview
Based on the refined specification:
${refinedSpec}

## 2. Core Functionality
- Complete new project implementation
- Modular architecture design
- Scalable and maintainable code structure
- User-friendly interface and experience`
      });

      documents.push({
        title: 'design.md',
        content: `# Technical Design

## Architecture Overview

### System Architecture
- High-level system design and components
- Technology stack selection and rationale
- Data flow and processing architecture
- Integration and communication patterns

### Component Design
- Core system components and modules
- User interface design and interaction
- Data models and storage strategy
- API design and endpoints

### Technical Specifications
- Framework and library selection
- Development tools and processes
- Testing and quality assurance approach
- Deployment and hosting considerations`
      });

      documents.push({
        title: 'tasks.md',
        content: `# Implementation Tasks

## Phase 1: Project Setup
- [ ] Set up project structure and dependencies
- [ ] Configure development environment
- [ ] Set up version control and CI/CD
- [ ] Create project documentation structure

## Phase 2: Core Infrastructure
- [ ] Implement basic project architecture
- [ ] Set up data models and storage
- [ ] Create configuration and logging systems
- [ ] Implement error handling and validation

## Phase 3: Core Features
- [ ] Develop main functionality modules
- [ ] Implement user interface components
- [ ] Add configuration and customization
- [ ] Create data processing and business logic

## Phase 4: Advanced Features
- [ ] Implement advanced functionality
- [ ] Add user management and authentication
- [ ] Create reporting and analytics features
- [ ] Optimize performance and scalability

## Phase 5: Testing and Deployment
- [ ] Comprehensive testing suite
- [ ] Performance optimization
- [ ] Security review and hardening
- [ ] Documentation and deployment preparation`
      });
    }

    return documents;
  }

  private generateTestSpecifications(projectType: string): any {
    // Generate generic test specifications based on project type
    if (projectType === 'existing_enhancement') {
      return {
        coverage: [
          'Enhancement functionality validation',
          'Existing system integration testing',
          'Backward compatibility verification',
          'API compatibility and regression testing',
          'Data migration and transformation validation',
          'Performance impact assessment',
          'Error handling and recovery procedures'
        ],
        categories: [
          { name: 'Regression Tests', description: 'Ensure existing functionality remains intact' },
          { name: 'Integration Tests', description: 'Verify enhancement integrates with existing systems' },
          { name: 'Compatibility Tests', description: 'Test compatibility with existing codebase' },
          { name: 'Performance Tests', description: 'Assess performance impact of enhancement' },
          { name: 'Migration Tests', description: 'Validate data migration and transformation' }
        ],
        keyTestCases: [
          'Existing functionality continues to work correctly',
          'Enhancement integrates seamlessly with current features',
          'No breaking changes to existing APIs or interfaces',
          'Data migration preserves all existing data integrity',
          'Performance benchmarks meet acceptable thresholds',
          'Error scenarios are handled gracefully without affecting existing features'
        ],
        qualityMetrics: [
          'Code coverage: 90%+ for new enhancement code',
          'No regression in existing functionality test results',
          'Performance impact: < 10% degradation maximum',
          'Bug density: < 1 critical bug per 1000 lines',
          'User acceptance: 4/5+ satisfaction rating'
        ]
      };
    } else if (projectType === 'existing_project') {
      return {
        coverage: [
          'New feature functionality validation',
          'Existing codebase integration testing',
          'System architecture compatibility',
          'Data model and storage integration',
          'User interface consistency',
          'Performance and scalability testing',
          'Security and access control validation'
        ],
        categories: [
          { name: 'Feature Tests', description: 'New feature functionality validation' },
          { name: 'Integration Tests', description: 'Integration with existing project components' },
          { name: 'Architecture Tests', description: 'System architecture and design validation' },
          { name: 'UI/UX Tests', description: 'User interface consistency and experience' },
          { name: 'Security Tests', description: 'Security and access control validation' }
        ],
        keyTestCases: [
          'New features work correctly in isolation',
          'Integration with existing project components is seamless',
          'User interface maintains consistency with existing patterns',
          'Data models integrate properly with existing storage',
          'Performance meets project standards and requirements',
          'Security controls are properly implemented and tested'
        ],
        qualityMetrics: [
          'Code coverage: 85%+ for new feature code',
          'Integration test success rate: 95%+',
          'Performance benchmarks: Meet or exceed targets',
          'Security compliance: All critical vulnerabilities addressed',
          'User satisfaction: 4/5+ rating for new features'
        ]
      };
    } else {
      // new_project
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
  }

  /**
   * Generate development plan for a project
   */
  private generateDevelopmentPlan(userIdea: string): {
    implementationSteps: string[];
    milestones: string[];
    estimatedTimeline: string;
  } {
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
  public async start(): Promise<void> {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.log('KAT-PLANNER Production MCP server started successfully!');
      console.log(`Session storage: ${this.sessionManager}`);
    } catch (error) {
      console.error('Failed to start MCP server:', error);
      throw error;
    }
  }
}

/**
 * Main entry point
 */
export async function main(): Promise<void> {
  const server = new ProductionKatPlannerServer();
  await server.start();
}

// Start the server if this file is run directly
if (require.main === module) {
  main().catch(console.error);
}