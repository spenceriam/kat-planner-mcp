/**
 * Slash Commands System for KAT-PLANNER MCP
 * Provides structured command-driven workflow that the LLM can follow
 */
export interface SlashCommand {
    command: string;
    description: string;
    parameters?: Record<string, string>;
    nextSteps?: string[];
}
export declare class SlashCommands {
    private commands;
    constructor();
    private initializeCommands;
    /**
     * Get all available slash commands
     */
    getCommands(): SlashCommand[];
    /**
     * Get command by name
     */
    getCommand(commandName: string): SlashCommand | undefined;
    /**
     * Generate help text for LLM
     */
    generateHelpText(): string;
    /**
     * Validate command parameters
     */
    validateCommand(commandName: string, parameters: Record<string, any>): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Get next recommended command based on current context
     */
    getNextRecommendedCommand(currentWorkflow: string, previousCommands: string[]): string | null;
}
export declare const slashCommands: SlashCommands;
//# sourceMappingURL=slash-commands.d.ts.map