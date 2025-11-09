"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KatPlannerSlashServer = void 0;
exports.main = main;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const slash_commands_resource_js_1 = require("./slash-commands-resource.js");
/**
 * KAT-PLANNER MCP Server with Slash Commands
 * Implements project planning through structured slash commands
 */
class KatPlannerSlashServer {
    constructor() {
        this.server = new mcp_js_1.McpServer({
            name: 'kat-planner-slash',
            version: '1.0.0',
        });
    }
    /**
     * Register MCP resources including slash commands
     */
    registerResources() {
        // Register slash commands as resources
        const resources = slash_commands_resource_js_1.slashCommandsResource.getCommandsAsResources();
        resources.forEach(resource => {
            this.server.registerResource(resource.name, {
                description: resource.description,
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
        this.server.registerResource('workflow_guidance', {
            description: 'Complete workflow guidance and instructions for LLM',
        }, async () => {
            return {
                contents: [{
                        uri: 'mcp://workflow_guidance',
                        mimeType: 'text/markdown',
                        content: slash_commands_resource_js_1.slashCommandsResource.getWorkflowGuidance(),
                    }],
            };
        });
    }
    /**
     * Register basic health check tool
     */
    registerTools() {
        this.server.registerTool('health_check', {
            title: 'Health Check',
            description: 'Basic health check to verify server is running',
            inputSchema: {},
        }, async () => {
            return {
                content: [{
                        type: 'text',
                        text: 'KAT-PLANNER Slash Commands MCP server is running successfully!',
                    }],
            };
        });
        // Register a tool to validate command sequences
        this.server.registerTool('validate_workflow', {
            title: 'Validate Workflow Progress',
            description: 'Validate that workflow commands are being called in correct sequence',
            inputSchema: {
                executedCommands: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of commands that have been executed so far'
                }
            },
        }, async (params) => {
            const validation = slash_commands_resource_js_1.slashCommandsResource.validateCommandSequence(params.executedCommands);
            const errorMessage = validation.errors.length > 0
                ? `\n\n**Errors:**\n${validation.errors.map(error => `- ${error}`).join('\n')}`
                : '';
            return {
                content: [{
                        type: 'text',
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
    async start() {
        this.registerResources();
        this.registerTools();
        try {
            const transport = new stdio_js_1.StdioServerTransport();
            await this.server.connect(transport);
            console.log('KAT-PLANNER Slash Commands MCP server started successfully!');
            console.log('Available resources: slash_commands_help, workflow_guidance');
            console.log('Available tools: health_check, validate_workflow');
        }
        catch (error) {
            console.error('Failed to start MCP server:', error);
            throw error;
        }
    }
}
exports.KatPlannerSlashServer = KatPlannerSlashServer;
/**
 * Main entry point
 */
async function main() {
    const server = new KatPlannerSlashServer();
    await server.start();
}
//# sourceMappingURL=server-slash.js.map