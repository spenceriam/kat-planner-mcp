/**
 * KAT-PLANNER MCP Server - Simplified Implementation
 * Based on proven LLM behavior patterns and tool calling best practices
 */
export declare class KatPlannerServer {
    private server;
    /***
     * Register all MCP tools for KAT-PLANNER
     */
    private registerTools;
    /**
     * Generate clarifying questions for project idea
     */
    private generateClarifyingQuestions;
    /**
     * Create refined specification from user answers
     */
    private createRefinedSpecification;
    /**
     * Detect project type from idea
     */
    private detectProjectType;
    /**
     * Generate SDD documents based on project type
     */
    private generateSDDDocuments;
    /**
     * Generate test specifications for a project type
     */
    private generateTestSpecifications;
    /**
     * Start the MCP server
     */
    start(): Promise<void>;
}
/**
 * Main entry point
 */
export declare function main(): Promise<void>;
//# sourceMappingURL=server-simple.d.ts.map