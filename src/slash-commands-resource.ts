import { slashCommands } from './slash-commands.js';

/**
 * Slash Commands Resource for MCP
 * Provides the LLM with structured commands to drive the workflow
 */

export class SlashCommandsResource {
  private commands: any;

  constructor() {
    this.commands = slashCommands;
  }

  /**
   * Get all slash commands as MCP resources
   */
  public getCommandsAsResources() {
    const commands = this.commands.getCommands();
    const resources = [];

    // Main commands resource
    resources.push({
      name: 'slash_commands_help',
      description: 'Complete list of available slash commands for KAT-PLANNER workflow',
      content: this.commands.generateHelpText()
    });

    // Grouped commands by phase
    const phases = this.commands.getCommandsByPhase();
    Object.entries(phases).forEach(([phase, phaseCommands]) => {
      if (Array.isArray(phaseCommands) && phaseCommands.length > 0) {
        resources.push({
          name: `slash_commands_${phase.toLowerCase()}`,
          description: `${phase} phase commands`,
          content: this.generatePhaseHelp(phase, phaseCommands)
        });
      }
    });

    return resources;
  }

  /**
   * Generate phase-specific help text
   */
  private generatePhaseHelp(phaseName: string, commands: any[]): string {
    let helpText = `# ${phaseName.replace('_', ' ')} Commands\n\n`;

    commands.forEach(command => {
      helpText += `## ${command.command}\n`;
      helpText += `${command.description}\n\n`;
      if (Object.keys(command.parameters || {}).length > 0) {
        helpText += `**Parameters:**\n`;
        Object.entries(command.parameters).forEach(([param, description]) => {
          helpText += `- **${param}:** ${description}\n`;
        });
        helpText += '\n';
      }
      if (command.nextSteps && command.nextSteps.length > 0) {
        helpText += `**Next Steps:** ${command.nextSteps.join(', ')}\n\n`;
      }
    });

    return helpText;
  }

  /**
   * Get workflow guidance for the LLM
   */
  public getWorkflowGuidance(): string {
    return `# KAT-PLANNER Workflow Guidance

## How to Use This MCP Server

This MCP server provides structured project planning through slash commands. **You MUST follow these commands in order** to ensure proper interactive planning.

### Required Workflow Sequence

1. **Start with /plan_project** - Begin project planning with your idea
2. **Use /refine_requirements** - Go through interactive requirement refinement
3. **Call /generate_specification** - Create comprehensive specification documents
4. **Execute /plan_implementation** - Generate detailed implementation plan
5. **Run /generate_tests** - Create test specifications
6. **Complete /final_review** - Get approval before implementation
7. **Only then use /start_implementation** - Begin actual coding

### Critical Rules for LLM

🚨 **MANDATORY**: You MUST use slash commands in the exact order above
🚨 **MANDATORY**: You MUST get user approval at each stage before proceeding
🚨 **MANDATORY**: You MUST NOT start implementation until /final_review is completed
🚨 **MANDATORY**: You MUST NOT create files or code until /start_implementation is called

### Available Commands

${this.commands.generateHelpText()}

### User Approval Required

At each stage, you must:
1. Present your work to the user
2. Ask for explicit approval to proceed
3. Wait for user confirmation before calling the next command
4. If user requests changes, address them before proceeding

### Consequences of Non-Compliance

If you violate these rules:
- The MCP will return error responses
- Workflow will be blocked until proper sequence is followed
- User will need to restart the planning process

**Remember: You are the PROJECT PLANNER, not the DEVELOPER. Your job is to plan, not to build.**
`;
  }

  /**
   * Validate that a command sequence is valid
   */
  public validateCommandSequence(commands: string[]): {
    valid: boolean;
    nextValidCommands: string[];
    errors: string[];
  } {
    const errors: string[] = [];
    const nextValidCommands: string[] = [];

    // Basic validation - check for implementation before planning
    const implementationIndex = commands.indexOf('/start_implementation');
    const planningCommands = ['/plan_project', '/refine_requirements', '/generate_specification'];

    if (implementationIndex !== -1) {
      for (const planningCmd of planningCommands) {
        if (commands.indexOf(planningCmd) === -1 || commands.indexOf(planningCmd) > implementationIndex) {
          errors.push(`Implementation started before completing ${planningCmd}`);
        }
      }
    }

    // Suggest next valid commands based on current progress
    if (!commands.includes('/plan_project')) {
      nextValidCommands.push('/plan_project');
    } else if (!commands.includes('/refine_requirements')) {
      nextValidCommands.push('/refine_requirements');
    } else if (!commands.includes('/generate_specification')) {
      nextValidCommands.push('/generate_specification');
    } else if (!commands.includes('/plan_implementation')) {
      nextValidCommands.push('/plan_implementation');
    } else if (!commands.includes('/generate_tests')) {
      nextValidCommands.push('/generate_tests');
    } else if (!commands.includes('/final_review')) {
      nextValidCommands.push('/final_review');
    } else if (!commands.includes('/start_implementation')) {
      nextValidCommands.push('/start_implementation');
    }

    return {
      valid: errors.length === 0,
      nextValidCommands,
      errors
    };
  }
}

// Export singleton instance
export const slashCommandsResource = new SlashCommandsResource();