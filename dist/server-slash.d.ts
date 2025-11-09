/**
 * KAT-PLANNER MCP Server with Slash Commands
 * Implements project planning through structured slash commands
 */
export declare class KatPlannerSlashServer {
    private server;
    constructor();
    /**
     * Register MCP resources including slash commands
     */
    private registerResources;
    /**
     * Register basic health check tool
     */
    private registerTools;
    /**
     * Start the MCP server
     */
    start(): Promise<void>;
}
/**
 * Main entry point
 */
export declare function main(): Promise<void>;
//# sourceMappingURL=server-slash.d.ts.map