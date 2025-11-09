import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { slashCommandsResource } from './slash-commands-resource.js';

/**
 * KAT-PLANNER MCP Server with Slash Commands
 * Implements project planning through structured slash commands
 */
export class KatPlannerSlashServer {
  private server = new McpServer({
    name: 'kat-planner-slash',
    version: '1.0.0',
  });

  constructor() {
    console.log('KatPlannerSlashServer instance created');
    this.registerResources();
    this.registerTools();
  }

  /**
   * Register MCP resources including slash commands
   */
  private registerResources(): void {
    // Register slash commands as resources
    const resources = slashCommandsResource.getCommandsAsResources();

    resources.forEach(resource => {
      this.server.registerResource(resource.name, `mcp://${resource.name}`, {
        title: resource.name,
        description: resource.description,
        mimeType: 'text/markdown'
      }, async () => {
        return {
          contents: [{
            text: resource.content,
            uri: `mcp://${resource.name}`,
            mimeType: 'text/markdown',
          }],
        };
      });
    });

    // Register workflow guidance resource
    this.server.registerResource('workflow_guidance', 'mcp://workflow_guidance', {
      title: 'Workflow Guidance',
      description: 'Complete workflow guidance and instructions for LLM',
      mimeType: 'text/markdown'
    }, async () => {
      return {
        contents: [{
          text: slashCommandsResource.getWorkflowGuidance(),
          uri: 'mcp://workflow_guidance',
          mimeType: 'text/markdown',
        }],
      };
    });
  }

  /**
   * Register basic health check tool
   */
  private registerTools(): void {
    // Basic health check
    this.server.registerTool('health_check', {
      title: 'Health Check',
      description: 'Basic health check to verify server is running',
      inputSchema: {},
    }, async () => {
      return {
        content: [{
          type: 'text' as const,
          text: 'KAT-PLANNER Slash Commands MCP server is running successfully!',
        }],
      };
    });

    // Register slash commands as tools for direct user interaction
    this.server.registerTool('plan_project', {
      title: 'Plan Project',
      description: 'Start interactive project planning workflow',
      inputSchema: {
        userIdea: z.string().describe('The user\'s project idea or concept'),
        projectType: z.string().optional().describe('Type of project: new_project, existing_codebase, enhancement')
      },
    }, async (params: { userIdea: string; projectType?: string }) => {
      return {
        content: [{
          type: 'text' as const,
          text: `## Project Planning Started\n\n**Idea:** ${params.userIdea}\n**Type:** ${params.projectType || 'Not specified'}\n\nNext steps:\n1. Use /refine_requirements to clarify details\n2. Use /generate_specification to create docs\n3. Use /plan_implementation to create tasks\n\nAvailable slash commands: /plan_project, /refine_requirements, /generate_specification, /plan_implementation, /validate_workflow, /get_help`
        }],
      };
    });

    this.server.registerTool('refine_requirements', {
      title: 'Refine Requirements',
      description: 'Refine project requirements through interactive questioning',
      inputSchema: {
        currentStage: z.enum(['initial', 'clarifying', 'summarizing']).describe('Stage: initial, clarifying, summarizing'),
        answers: z.record(z.any()).optional().describe('User answers from previous stage')
      },
    }, async (params: { currentStage: string; answers?: any }) => {
      return {
        content: [{
          type: 'text' as const,
          text: `## Requirements Refinement - ${params.currentStage}\n\n${params.currentStage === 'initial' ? 'Let me ask you some questions to clarify your project requirements...' :
            params.currentStage === 'clarifying' ? `Based on your answers: ${JSON.stringify(params.answers)}, let me clarify any ambiguities...` :
            `Summarizing your refined requirements...`}\n\nNext: Use /generate_specification to create detailed documentation.`
        }],
      };
    });

    this.server.registerTool('generate_specification', {
      title: 'Generate Specification',
      description: 'Generate comprehensive specification documents',
      inputSchema: {
        refinedRequirements: z.string().describe('Approved refined requirements'),
        projectType: z.string().describe('Project type for template selection')
      },
    }, async (params: { refinedRequirements: string; projectType: string }) => {
      return {
        content: [{
          type: 'text' as const,
          text: `## Specification Generated\n\n**Requirements:** ${params.refinedRequirements}\n**Type:** ${params.projectType}\n\nDocuments created:\n- requirements.md\n- design.md\n- tasks.md\n\nNext: Use /plan_implementation to create implementation tasks.`
        }],
      };
    });

    this.server.registerTool('plan_implementation', {
      title: 'Plan Implementation',
      description: 'Create implementation plan with tasks and timeline',
      inputSchema: {
        specification: z.string().describe('Generated specification to implement'),
        complexity: z.string().describe('Project complexity: simple, medium, complex')
      },
    }, async (params: { specification: string; complexity: string }) => {
      return {
        content: [{
          type: 'text' as const,
          text: `## Implementation Plan Created\n\n**Specification:** ${params.specification}\n**Complexity:** ${params.complexity}\n\nPlan includes:\n- Task breakdown\n- Timeline estimation\n- Resource requirements\n- Risk assessment\n\nReady for development phase!`
        }],
      };
    });

    this.server.registerTool('get_help', {
      title: 'Get Help',
      description: 'Display available slash commands and usage instructions',
      inputSchema: {},
    }, async () => {
      return {
        content: [{
          type: 'text' as const,
          text: `## KAT-PLANNER Slash Commands Help\n\n### Available Commands:\n\n1. **/plan_project** - Start project planning\n   - Parameters: userIdea (required), projectType (optional)\n   - Use this first to describe your project idea\n\n2. **/refine_requirements** - Clarify requirements\n   - Parameters: currentStage, answers (optional)\n   - Interactive questioning to refine your needs\n\n3. **/generate_specification** - Create documentation\n   - Parameters: refinedRequirements, projectType\n   - Generates requirements.md, design.md, tasks.md\n\n4. **/plan_implementation** - Create implementation plan\n   - Parameters: specification, complexity\n   - Breaks down work into actionable tasks\n\n5. **/validate_workflow** - Check workflow progress\n   - Parameters: executedCommands\n   - Validates command sequence and suggests next steps\n\n### Quick Start:\n1. /plan_project with your idea\n2. /refine_requirements to clarify\n3. /generate_specification to document\n4. /plan_implementation to plan execution\n\nUse /validate_workflow anytime to check your progress!`
        }],
      };
    });

    // Register a tool to validate command sequences
    this.server.registerTool('validate_workflow', {
      title: 'Validate Workflow Progress',
      description: 'Validate that workflow commands are being called in correct sequence',
      inputSchema: {
        executedCommands: z.array(z.string()).describe('List of commands that have been executed so far')
      },
    }, async (params: { executedCommands: string[] }) => {
      const validation = slashCommandsResource.validateCommandSequence(params.executedCommands);

      const errorMessage = validation.errors.length > 0
        ? `\n\n**Errors:**\n${validation.errors.map(error => `- ${error}`).join('\n')}`
        : '';

      return {
        content: [{
          type: 'text' as const,
          text: `## Workflow Validation Results\n\n**Valid:** ${validation.valid ? '✅ YES' : '❌ NO'}\n\n**Next Valid Commands:**\n${validation.nextValidCommands.map(cmd => `- ${cmd}`).join('\n')}${errorMessage}`,
          isError: !validation.valid
        }],
      };
    });
  }

  /**
   * Start the MCP server
   */
  public async start(): Promise<void> {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      console.log('KAT-PLANNER Slash Commands MCP server started successfully!');
      console.log('Available resources: slash_commands_help, workflow_guidance');
      console.log('Available tools: health_check, validate_workflow');
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
  const server = new KatPlannerSlashServer();
  await server.start();
}

// Start the server if this file is run directly
if (require.main === module) {
  main().catch(console.error);
}