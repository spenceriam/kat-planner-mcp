/**
 * Slash Commands Resource for MCP
 * Provides the LLM with structured commands to drive the workflow
 */
export declare class SlashCommandsResource {
    private commands;
    constructor();
    /**
     * Get all slash commands as MCP resources
     */
    getCommandsAsResources(): {
        name: string;
        description: string;
        content: any;
    }[];
    /**
     * Generate phase-specific help text
     */
    private generatePhaseHelp;
    /**
     * Get workflow guidance for the LLM
     */
    getWorkflowGuidance(): string;
    /**
     * Validate that a command sequence is valid
     */
    validateCommandSequence(commands: string[]): {
        valid: boolean;
        nextValidCommands: string[];
        errors: string[];
    };
}
export declare const slashCommandsResource: SlashCommandsResource;
//# sourceMappingURL=slash-commands-resource.d.ts.map