/**
 * KAT-PLANNER MCP Server - Robust Implementation
 * Solves the workflow state management issues with proper approval detection
 */
export declare class KatPlannerServer {
    private server;
    private currentProject;
    /**
     * Reset project state
     */
    private resetProjectState;
    /**
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
//# sourceMappingURL=server-robust.d.ts.map