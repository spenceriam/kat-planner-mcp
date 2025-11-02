/**
 * Placeholder file for SDD generator tool implementation
 * This will contain the logic for generating specification documents
 */
export interface DocumentGenerationResult {
    agentsPath: string;
    requirementsPath: string;
    designPath: string;
    tasksPath: string;
    testingPath?: string;
}
export interface GenerationContext {
    refinedSpecification: string;
    projectType: 'new_project' | 'enhancement' | 'bug_fix';
    existingCodebase?: boolean;
}
/**
 * Placeholder SDD generation function
 * TODO: Implement actual document generation logic
 */
export declare function generateSDD(context: GenerationContext): Promise<DocumentGenerationResult>;
//# sourceMappingURL=sdd-generator.d.ts.map