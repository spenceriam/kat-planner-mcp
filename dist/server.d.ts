/**
 * KAT-PLANNER MCP Server
 * Implements the core server functionality with proper tool registration
 */
export declare class KatPlannerServer {
    private server;
    private currentWorkflowStage;
    private lastRefinedSpecification;
    private userApprovalGranted;
    /**
     * Reset workflow state to initial conditions
     */
    private resetWorkflowState;
    /**
     * Validate that a tool can be called in the current workflow state
     */
    private validateToolCall;
    /**
     * Update workflow state after successful tool completion
     */
    private updateWorkflowState;
    /**
     * Register all MCP tools for KAT-PLANNER
     */
    private registerTools;
    /**
     * Handle mouse button mapping project refinement
     */
    private handleMouseButtonRefinement;
    /**
     * Handle generic project refinement for other project types
     */
    private handleGenericRefinement;
    /**
     * Generate comprehensive test specifications for a project type
     */
    private generateTestSpecifications;
    /**
     * Start the MCP server
     */
    start(): Promise<void>;
    /**
     * Extract answers from user text
     */
    private extractAnswersFromText;
    /**
     * Get missing requirements for mouse button projects
     */
    private getMissingMouseButtonRequirements;
    /**
     * Get missing requirements for generic projects
     */
    private getMissingGenericRequirements;
    /**
     * Generate mouse button project summary
     */
    private generateMouseButtonSummary;
    /**
     * Generate generic project summary
     */
    private generateGenericSummary;
    /**
     * Create final mouse button refined specification
     */
    private createMouseButtonRefinedSpecification;
    /**
     * Generate SDD documents based on project type
     */
    private generateSDDDocuments;
    /**
     * Create final generic refined specification
     */
    private createGenericRefinedSpecification;
}
/**
 * Main entry point
 */
export declare function main(): Promise<void>;
//# sourceMappingURL=server.d.ts.map