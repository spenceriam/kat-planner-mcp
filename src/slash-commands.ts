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

export class SlashCommands {
  private commands: Map<string, SlashCommand> = new Map();

  constructor() {
    this.initializeCommands();
  }

  private initializeCommands() {
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
  public getCommands(): SlashCommand[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get command by name
   */
  public getCommand(commandName: string): SlashCommand | undefined {
    return this.commands.get(commandName);
  }

  /**
   * Get commands grouped by workflow phase
   */
  public getCommandsByPhase(): Record<string, SlashCommand[]> {
    const phases: Record<string, SlashCommand[]> = {
      'Planning': [],
      'Specification': [],
      'Planning_Phase2': [],
      'Quality_Assurance': [],
      'Documentation': [],
      'Review': [],
      'Implementation': [],
      'Utilities': []
    };

    // Populate phases safely
    const planProject = this.commands.get('/plan_project');
    if (planProject) phases['Planning'].push(planProject);

    const refineRequirements = this.commands.get('/refine_requirements');
    if (refineRequirements) phases['Planning'].push(refineRequirements);

    const analyzeProject = this.commands.get('/analyze_project');
    if (analyzeProject) phases['Planning'].push(analyzeProject);

    const generateSpecification = this.commands.get('/generate_specification');
    if (generateSpecification) phases['Specification'].push(generateSpecification);

    const enhanceSpecification = this.commands.get('/enhance_specification');
    if (enhanceSpecification) phases['Specification'].push(enhanceSpecification);

    const planImplementation = this.commands.get('/plan_implementation');
    if (planImplementation) phases['Planning_Phase2'].push(planImplementation);

    const planEnhancement = this.commands.get('/plan_enhancement');
    if (planEnhancement) phases['Planning_Phase2'].push(planEnhancement);

    const generateTests = this.commands.get('/generate_tests');
    if (generateTests) phases['Quality_Assurance'].push(generateTests);

    const generateEnhancementTests = this.commands.get('/generate_enhancement_tests');
    if (generateEnhancementTests) phases['Quality_Assurance'].push(generateEnhancementTests);

    const createDocumentation = this.commands.get('/create_documentation');
    if (createDocumentation) phases['Documentation'].push(createDocumentation);

    const finalReview = this.commands.get('/final_review');
    if (finalReview) phases['Review'].push(finalReview);

    const startImplementation = this.commands.get('/start_implementation');
    if (startImplementation) phases['Implementation'].push(startImplementation);

    const help = this.commands.get('/help');
    if (help) phases['Utilities'].push(help);

    const workflowStatus = this.commands.get('/workflow_status');
    if (workflowStatus) phases['Utilities'].push(workflowStatus);

    return phases;
  }

  /**
   * Generate help text for LLM
   */
  public generateHelpText(): string {
    const phases = this.getCommandsByPhase();
    let helpText = '# KAT-PLANNER MCP Slash Commands\n\n';

    Object.entries(phases).forEach(([phase, commands]) => {
      if (commands.length > 0) {
        helpText += `## ${phase.replace('_', ' ')}\n\n`;
        commands.forEach(command => {
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
    });

    return helpText;
  }

  /**
   * Validate command parameters
   */
  public validateCommand(commandName: string, parameters: Record<string, any>): {
    valid: boolean;
    errors: string[];
  } {
    const command = this.commands.get(commandName);
    if (!command) {
      return { valid: false, errors: [`Unknown command: ${commandName}`] };
    }

    const errors: string[] = [];
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
  public getNextRecommendedCommand(currentWorkflow: string, previousCommands: string[]): string | null {
    // This could be enhanced with more sophisticated workflow logic
    const workflowMap: Record<string, string[]> = {
      'new_project': ['/plan_project', '/refine_requirements', '/generate_specification', '/plan_implementation'],
      'existing_codebase': ['/analyze_project', '/enhance_specification', '/plan_enhancement'],
      'enhancement': ['/enhance_specification', '/plan_enhancement']
    };

    const availableWorkflows = workflowMap[currentWorkflow];
    if (!availableWorkflows) return null;

    // Find the next command that hasn't been executed yet
    for (const cmd of availableWorkflows) {
      if (!previousCommands.includes(cmd)) {
        return cmd;
      }
    }

    return null;
  }
}

// Export singleton instance
export const slashCommands = new SlashCommands();