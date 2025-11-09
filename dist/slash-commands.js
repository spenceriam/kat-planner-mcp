"use strict";
/**
 * Slash Commands System for KAT-PLANNER MCP
 * Provides structured command-driven workflow that the LLM can follow
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.slashCommands = exports.SlashCommands = void 0;
class SlashCommands {
    constructor() {
        this.commands = new Map();
        this.initializeCommands();
    }
    initializeCommands() {
        // Project initialization commands
        this.commands.set('/plan_project', {
            command: '/plan_project',
            description: 'Start interactive project planning workflow',
            parameters: {
                userIdea: 'string - The user\'s project idea or concept',
                projectType: 'string (optional) - Type of project: new_project, existing_codebase, enhancement'
            },
            nextSteps: ['/refine_requirements', '/generate_specification', '/create_implementation_plan']
        });
        // Requirements refinement commands
        this.commands.set('/refine_requirements', {
            command: '/refine_requirements',
            description: 'Refine project requirements through interactive questioning',
            parameters: {
                currentStage: 'string - Stage: initial, clarifying, summarizing',
                answers: 'object (optional) - User answers from previous stage'
            },
            nextSteps: ['/generate_specification', '/plan_implementation']
        });
        // Specification generation commands
        this.commands.set('/generate_specification', {
            command: '/generate_specification',
            description: 'Generate comprehensive specification documents (requirements.md, design.md, tasks.md)',
            parameters: {
                refinedRequirements: 'string - Approved refined requirements',
                projectType: 'string - Project type for template selection'
            },
            nextSteps: ['/plan_implementation', '/generate_tests']
        });
        // Implementation planning commands
        this.commands.set('/plan_implementation', {
            command: '/plan_implementation',
            description: 'Create detailed implementation plan with phases and tasks',
            parameters: {
                specification: 'string - Generated specification documents',
                complexity: 'string - Project complexity level'
            },
            nextSteps: ['/generate_tests', '/create_documentation']
        });
        // Testing commands
        this.commands.set('/generate_tests', {
            command: '/generate_tests',
            description: 'Generate comprehensive test specifications and test cases',
            parameters: {
                specification: 'string - Specification documents to test against',
                testCoverage: 'string - Level of test coverage required'
            },
            nextSteps: ['/create_documentation', '/final_review']
        });
        // Documentation commands
        this.commands.set('/create_documentation', {
            command: '/create_documentation',
            description: 'Create project documentation and user guides',
            parameters: {
                implementationPlan: 'string - Implementation plan and architecture',
                targetAudience: 'string - Who will use this documentation'
            },
            nextSteps: ['/final_review']
        });
        // Review and approval commands
        this.commands.set('/final_review', {
            command: '/final_review',
            description: 'Final review and approval of all planning documents',
            parameters: {
                allDocuments: 'string - All generated documents for review',
                approvalDecision: 'string - User decision: approve, request_changes, reject'
            },
            nextSteps: ['/start_implementation']
        });
        // Implementation start command
        this.commands.set('/start_implementation', {
            command: '/start_implementation',
            description: 'Begin actual implementation after planning approval',
            parameters: {
                approvedDocuments: 'string - All approved planning documents',
                developmentEnvironment: 'string - Setup and environment details'
            },
            nextSteps: []
        });
        // Project analysis commands
        this.commands.set('/analyze_project', {
            command: '/analyze_project',
            description: 'Analyze existing project structure and codebase',
            parameters: {
                projectPath: 'string - Path to existing project',
                analysisType: 'string - Type: code_analysis, dependency_analysis, architecture_review'
            },
            nextSteps: ['/enhance_specification', '/plan_enhancement']
        });
        // Enhancement planning commands
        this.commands.set('/enhance_specification', {
            command: '/enhance_specification',
            description: 'Enhance existing project specification with new requirements',
            parameters: {
                existingSpec: 'string - Existing specification to enhance',
                newRequirements: 'string - New requirements to add'
            },
            nextSteps: ['/plan_enhancement', '/generate_enhancement_tests']
        });
        // Help and guidance commands
        this.commands.set('/help', {
            command: '/help',
            description: 'Show available slash commands and usage instructions',
            parameters: {},
            nextSteps: []
        });
        this.commands.set('/workflow_status', {
            command: '/workflow_status',
            description: 'Show current workflow state and next required actions',
            parameters: {},
            nextSteps: []
        });
    }
    /**
     * Get all available slash commands
     */
    getCommands() {
        return Array.from(this.commands.values());
    }
    /**
     * Get command by name
     */
    getCommand(commandName) {
        return this.commands.get(commandName);
    }
    /**
     * Generate help text for LLM
     */
    generateHelpText() {
        const allCommands = this.getCommands();
        // Group commands by phase
        const planningPhase = allCommands.filter(cmd => cmd.command === '/plan_project' ||
            cmd.command === '/refine_requirements' ||
            cmd.command === '/analyze_project');
        const specificationPhase = allCommands.filter(cmd => cmd.command === '/generate_specification' ||
            cmd.command === '/enhance_specification');
        const implementationPhase = allCommands.filter(cmd => cmd.command === '/plan_implementation' ||
            cmd.command === '/plan_enhancement');
        const qualityPhase = allCommands.filter(cmd => cmd.command === '/generate_tests' ||
            cmd.command === '/generate_enhancement_tests');
        const documentationPhase = allCommands.filter(cmd => cmd.command === '/create_documentation');
        const reviewPhase = allCommands.filter(cmd => cmd.command === '/final_review');
        const implementationStartPhase = allCommands.filter(cmd => cmd.command === '/start_implementation');
        const utilityPhase = allCommands.filter(cmd => cmd.command === '/help' ||
            cmd.command === '/workflow_status');
        let helpText = '# KAT-PLANNER MCP Slash Commands\n\n';
        // Add each phase section
        if (planningPhase.length > 0) {
            helpText += '## Planning Phase\n\n';
            planningPhase.forEach(command => {
                helpText += `**${command.command}**\n`;
                helpText += `${command.description}\n`;
                if (Object.keys(command.parameters || {}).length > 0) {
                    helpText += `Parameters: ${JSON.stringify(command.parameters)}\n`;
                }
                if (command.nextSteps && command.nextSteps.length > 0) {
                    helpText += `Next Steps: ${command.nextSteps.join(', ')}\n`;
                }
                helpText += '\n';
            });
        }
        if (specificationPhase.length > 0) {
            helpText += '## Specification Phase\n\n';
            specificationPhase.forEach(command => {
                helpText += `**${command.command}**\n`;
                helpText += `${command.description}\n`;
                if (Object.keys(command.parameters || {}).length > 0) {
                    helpText += `Parameters: ${JSON.stringify(command.parameters)}\n`;
                }
                if (command.nextSteps && command.nextSteps.length > 0) {
                    helpText += `Next Steps: ${command.nextSteps.join(', ')}\n`;
                }
                helpText += '\n';
            });
        }
        if (implementationPhase.length > 0) {
            helpText += '## Implementation Planning Phase\n\n';
            implementationPhase.forEach(command => {
                helpText += `**${command.command}**\n`;
                helpText += `${command.description}\n`;
                if (Object.keys(command.parameters || {}).length > 0) {
                    helpText += `Parameters: ${JSON.stringify(command.parameters)}\n`;
                }
                if (command.nextSteps && command.nextSteps.length > 0) {
                    helpText += `Next Steps: ${command.nextSteps.join(', ')}\n`;
                }
                helpText += '\n';
            });
        }
        if (qualityPhase.length > 0) {
            helpText += '## Quality Assurance Phase\n\n';
            qualityPhase.forEach(command => {
                helpText += `**${command.command}**\n`;
                helpText += `${command.description}\n`;
                if (Object.keys(command.parameters || {}).length > 0) {
                    helpText += `Parameters: ${JSON.stringify(command.parameters)}\n`;
                }
                if (command.nextSteps && command.nextSteps.length > 0) {
                    helpText += `Next Steps: ${command.nextSteps.join(', ')}\n`;
                }
                helpText += '\n';
            });
        }
        if (documentationPhase.length > 0) {
            helpText += '## Documentation Phase\n\n';
            documentationPhase.forEach(command => {
                helpText += `**${command.command}**\n`;
                helpText += `${command.description}\n`;
                if (Object.keys(command.parameters || {}).length > 0) {
                    helpText += `Parameters: ${JSON.stringify(command.parameters)}\n`;
                }
                if (command.nextSteps && command.nextSteps.length > 0) {
                    helpText += `Next Steps: ${command.nextSteps.join(', ')}\n`;
                }
                helpText += '\n';
            });
        }
        if (reviewPhase.length > 0) {
            helpText += '## Review Phase\n\n';
            reviewPhase.forEach(command => {
                helpText += `**${command.command}**\n`;
                helpText += `${command.description}\n`;
                if (Object.keys(command.parameters || {}).length > 0) {
                    helpText += `Parameters: ${JSON.stringify(command.parameters)}\n`;
                }
                if (command.nextSteps && command.nextSteps.length > 0) {
                    helpText += `Next Steps: ${command.nextSteps.join(', ')}\n`;
                }
                helpText += '\n';
            });
        }
        if (implementationStartPhase.length > 0) {
            helpText += '## Implementation Phase\n\n';
            implementationStartPhase.forEach(command => {
                helpText += `**${command.command}**\n`;
                helpText += `${command.description}\n`;
                if (Object.keys(command.parameters || {}).length > 0) {
                    helpText += `Parameters: ${JSON.stringify(command.parameters)}\n`;
                }
                if (command.nextSteps && command.nextSteps.length > 0) {
                    helpText += `Next Steps: ${command.nextSteps.join(', ')}\n`;
                }
                helpText += '\n';
            });
        }
        if (utilityPhase.length > 0) {
            helpText += '## Utilities\n\n';
            utilityPhase.forEach(command => {
                helpText += `**${command.command}**\n`;
                helpText += `${command.description}\n`;
                if (Object.keys(command.parameters || {}).length > 0) {
                    helpText += `Parameters: ${JSON.stringify(command.parameters)}\n`;
                }
                if (command.nextSteps && command.nextSteps.length > 0) {
                    helpText += `Next Steps: ${command.nextSteps.join(', ')}\n`;
                }
                helpText += '\n';
            });
        }
        return helpText;
    }
    /**
     * Validate command parameters
     */
    validateCommand(commandName, parameters) {
        const command = this.commands.get(commandName);
        if (!command) {
            return { valid: false, errors: [`Unknown command: ${commandName}`] };
        }
        const errors = [];
        const requiredParams = command.parameters || {};
        // Check required parameters
        Object.keys(requiredParams).forEach(param => {
            if (!(param in parameters)) {
                errors.push(`Missing required parameter: ${param}`);
            }
        });
        return { valid: errors.length === 0, errors };
    }
    /**
     * Get next recommended command based on current context
     */
    getNextRecommendedCommand(currentWorkflow, previousCommands) {
        // This could be enhanced with more sophisticated workflow logic
        const workflowMap = {
            'new_project': ['/plan_project', '/refine_requirements', '/generate_specification', '/plan_implementation'],
            'existing_codebase': ['/analyze_project', '/enhance_specification', '/plan_enhancement'],
            'enhancement': ['/enhance_specification', '/plan_enhancement']
        };
        const availableWorkflows = workflowMap[currentWorkflow];
        if (!availableWorkflows)
            return null;
        // Find the next command that hasn't been executed yet
        for (const cmd of availableWorkflows) {
            if (!previousCommands.includes(cmd)) {
                return cmd;
            }
        }
        return null;
    }
}
exports.SlashCommands = SlashCommands;
// Export singleton instance
exports.slashCommands = new SlashCommands();
//# sourceMappingURL=slash-commands.js.map