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
            uri: `mcp://${resource.name}`,
            mimeType: 'text/markdown',
            content: resource.content,
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
          uri: 'mcp://workflow_guidance',
          mimeType: 'text/markdown',
          content: slashCommandsResource.getWorkflowGuidance(),
        }],
      };
    });
  }

  /**
   * Register basic health check tool
   */
  private registerTools(): void {
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
          text: `Workflow Validation Results:

**Valid:** ${validation.valid ? '✅ YES' : '❌ NO'}

**Next Valid Commands:**
${validation.nextValidCommands.map(cmd => `- ${cmd}`).join('\n')}${errorMessage}`,
          isError: !validation.valid
        }],
      };
    });
  }

  /**
   * Start the MCP server
   */
  public async start(): Promise<void> {
    this.registerResources();
    this.registerTools();

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