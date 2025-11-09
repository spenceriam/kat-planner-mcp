/**
 * Production-ready KAT-PLANNER MCP server with comprehensive session management
 */
export declare class ProductionKatPlannerServer {
    private server;
    private sessionManager;
    constructor();
    /**
     * Register system prompt to guide LLM behavior from the start
     */
    private registerSystemPrompt;
    /**
     * Register all MCP tools with comprehensive descriptions
     */
    private registerTools;
    /**
     * Handle development workflow with session validation
     */
    private handleDevelopmentWorkflow;
    /**
     * Handle interactive workflow with session management
     */
    private handleInteractiveWorkflow;
    /**
     * Handle question mode with session creation
     */
    private handleQuestionMode;
    /**
     * Handle refine mode with session validation
     */
    private handleRefineMode;
    /**
     * Handle document review mode with SDD generation
     */
    private handleDocumentReviewMode;
    /**
     * Handle final approval mode
     */
    private handleFinalApprovalMode;
    /**
     * Format responses with explicit instructions
     */
    private formatResponse;
    /**
     * Get next action for LLM guidance
     */
    private getNextAction;
    /**
     * Get required tool for next action
     */
    private getRequiredTool;
    /**
     * Get required parameters for next action
     */
    private getRequiredParameters;
    /**
     * Format error responses with recovery instructions
     */
    private formatErrorResponse;
    private analyzeProjectIdea;
    private createRefinedSpecification;
    private detectProjectType;
    private generateClarifyingQuestions;
    private generateSDDDocuments;
    private generateTestSpecifications;
    /**
     * Generate development plan for a project
     */
    private generateDevelopmentPlan;
    /**
     * Start the MCP server
     */
    start(): Promise<void>;
}
/**
 * Main entry point
 */
export declare function main(): Promise<void>;
//# sourceMappingURL=server-production.d.ts.map