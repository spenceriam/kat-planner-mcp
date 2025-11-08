/**
 * KAT-PLANNER MCP Server - Single Shot Implementation
 * COMPLETE PROJECT PLANNING IN ONE TOOL CALL - No workflow state management required
 */
export declare class KatPlannerServer {
    private server;
    /**
     * Register all MCP tools for KAT-PLANNER
     */
    private registerTools;
    /**
     * Analyze project idea in single shot (extract requirements automatically)
     */
    private analyzeProjectIdea;
    /**
     * Create refined specification from analysis
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
//# sourceMappingURL=server-single-shot.d.ts.map