# Hybrid KAT-PLANNER MCP Server Implementation

## 🎯 Response to Claude Sonnet 4.5 Analysis

Thank you for the excellent analysis! You've identified a crucial insight about the potential pivot from our original interactive workflow goal. Let's create a hybrid approach that gives us the best of both worlds.

## 🚀 Hybrid Architecture Solution

### **Core Strategy**: Two complementary tools that let the LLM choose the appropriate workflow based on project complexity and user clarity.

## 📋 Implementation Plan

### **Tool 1: Quick Generation (Single-Shot)**
```typescript
{
  name: "generate_complete_spec",
  description: "Auto-detect requirements and generate complete project spec in one shot. Use when requirements are clear and specific.",
  parameters: {
    userIdea: string,
    generateSDD: boolean,
    generateTests: boolean
  }
}
```

**When to Use**:
- "Build a todo app with React"
- "Create a Python mouse button mapper"
- Specific technology stacks mentioned
- Clear, well-defined requirements

### **Tool 2: Interactive Mode (Original Vision)**
```typescript
{
  name: "start_interactive_spec",
  description: "Begin interactive spec development with questions and refinement. Use when requirements need clarification.",
  parameters: {
    userIdea: string,
    mode: "question" | "refine" | "approve",
    userAnswers?: Record<string, string>,
    explicitApproval?: "yes" | "approved" | "proceed"
  }
}
```

**When to Use**:
- Vague requirements like "build something useful"
- Complex domains like video processing
- User explicitly requests discussion
- Ambiguous or incomplete project ideas

## 🧠 Smart Workflow Selection

### **Auto-Detection Algorithm for Workflow Selection**
```typescript
private assessWorkflow(userIdea: string): "quick" | "interactive" {
  const lowercaseIdea = userIdea.toLowerCase();

  // Quick mode triggers - specific and clear requirements
  const quickTriggers = [
    /react|vue|angular/i,           // Specific frontend frameworks
    /python|node|java/i,           // Specific backend technologies
    /mouse.*button|keyboard.*macro/i, // Specific functionality
    /todo|calculator|timer/i,      // Well-defined apps
    /with.*react|using.*python/i,  // Technology specified
  ];

  // Interactive mode triggers - vague or complex requirements
  const interactiveTriggers = [
    /something.*useful|build.*app/i, // Vague requirements
    /video.*processing|ai.*analysis/i, // Complex domains
    /i.*want.*but.*not.*sure/i,    // User uncertainty
    /can.*you.*help.*with/i,      // Request for assistance
  ];

  // Count triggers for each mode
  const quickScore = quickTriggers.filter(trigger => trigger.test(lowercaseIdea)).length;
  const interactiveScore = interactiveTriggers.filter(trigger => trigger.test(lowercaseIdea)).length;

  // User explicit requests override auto-detection
  if (lowercaseIdea.includes('help me plan') || lowercaseIdea.includes('what should i')) {
    return 'interactive';
  }

  return interactiveScore > quickScore ? 'interactive' : 'quick';
}
```

## 🎯 Implementation Files

### **Main Hybrid Server** (`src/server-hybrid.ts`)
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

export class HybridKatPlannerServer {
  private server = new McpServer({
    name: 'kat-planner-hybrid',
    version: '1.0.0',
  });

  private currentProject: {
    idea: string;
    answers: Record<string, string>;
    projectType: string;
    workflowMode: 'quick' | 'interactive';
  } | null = null;

  private registerTools(): void {
    // Tool 1: Quick Generation
    this.server.registerTool('generate_complete_spec', {
      title: 'Quick Project Generation',
      description: 'Auto-detect requirements and generate complete project spec in one shot. Use when requirements are clear and specific.',
      inputSchema: {
        userIdea: z.string().describe('The user\\'s project idea'),
        generateSDD: z.boolean().optional().default(false).describe('Generate SDD documents if true'),
        generateTests: z.boolean().optional().default(false).describe('Generate test specifications if true'),
      },
    }, async (params: { userIdea: string; generateSDD?: boolean; generateTests?: boolean }) => {
      return this.handleQuickGeneration(params);
    });

    // Tool 2: Interactive Mode
    this.server.registerTool('start_interactive_spec', {
      title: 'Interactive Specification Development',
      description: 'Begin interactive spec development with questions and refinement. Use when requirements need clarification.',
      inputSchema: {
        userIdea: z.string().describe('The user\\'s project idea'),
        mode: z.enum(['question', 'refine', 'approve']).describe('Current mode: question, refine, or approve'),
        userAnswers: z.record(z.string()).optional().describe('User answers to clarifying questions'),
        explicitApproval: z.enum(['yes', 'approved', 'proceed']).optional().describe('Explicit user approval for final spec'),
      },
    }, async (params: { userIdea: string; mode: string; userAnswers?: Record<string, string>; explicitApproval?: string }) => {
      return this.handleInteractiveWorkflow(params);
    });

    // Tool 3: Smart Workflow Selection
    this.server.registerTool('smart_plan', {
      title: 'Smart Project Planning',
      description: 'Automatically selects the best workflow (quick or interactive) based on project complexity and user clarity.',
      inputSchema: {
        userIdea: z.string().describe('The user\\'s project idea'),
        generateSDD: z.boolean().optional().default(false).describe('Generate SDD documents if true'),
        generateTests: z.boolean().optional().default(false).describe('Generate test specifications if true'),
      },
    }, async (params: { userIdea: string; generateSDD?: boolean; generateTests?: boolean }) => {
      return this.handleSmartPlanning(params);
    });
  }

  private async handleQuickGeneration(params: { userIdea: string; generateSDD?: boolean; generateTests?: boolean }) {
    // Auto-detect requirements and generate complete spec in one shot
    const projectAnalysis = this.analyzeProjectIdea(params.userIdea);
    const refinedSpec = this.createRefinedSpecification(projectAnalysis);
    const projectType = this.detectProjectType(params.userIdea);

    // Generate SDD documents if requested
    let sddDocuments = [];
    let sddOutput = '';
    if (params.generateSDD) {
      sddDocuments = this.generateSDDDocuments(refinedSpec, projectType);
      sddOutput = `**Generated SDD Documents:**\n${sddDocuments.map((doc: { title: string }) => `- ${doc.title}`).join('\n')}\n\n`;
    }

    // Generate test specifications if requested
    let testOutput = '';
    if (params.generateTests) {
      const testSpecifications = this.generateTestSpecifications(projectType);
      testOutput = `**Generated Test Specifications:**\n${testSpecifications.coverage.join('\n')}\n\n`;
    }

    // Return comprehensive output
    let output = `✅ **Quick Project Generation Complete!**\n\n`;
    output += `**Refined Specification:**\n${refinedSpec}\n\n`;

    if (sddOutput) {
      output += sddOutput;
    }

    if (testOutput) {
      output += testOutput;
    }

    output += `*Your project plan is ready for immediate implementation.*`;

    return {
      content: [{
        type: 'text' as const,
        text: output
      }],
      structuredContent: {
        refinedSpecification: refinedSpec,
        projectType: projectType,
        sddDocuments: params.generateSDD ? sddDocuments : undefined,
        testSpecifications: params.generateTests ? this.generateTestSpecifications(projectType) : undefined,
        workflowMode: 'quick'
      }
    };
  }

  private async handleInteractiveWorkflow(params: { userIdea: string; mode: string; userAnswers?: Record<string, string>; explicitApproval?: string }) {
    // Initialize project if new
    if (!this.currentProject || this.currentProject.idea !== params.userIdea) {
      this.currentProject = {
        idea: params.userIdea,
        answers: {},
        projectType: this.detectProjectType(params.userIdea),
        workflowMode: 'interactive'
      };
    }

    switch (params.mode) {
      case 'question':
        return this.askClarifyingQuestions(params.userIdea);

      case 'refine':
        if (params.userAnswers) {
          this.currentProject.answers = { ...this.currentProject.answers, ...params.userAnswers };
        }
        return this.refineWithAnswers(params.userIdea, this.currentProject.answers);

      case 'approve':
        if (params.explicitApproval && ['yes', 'approved', 'proceed'].includes(params.explicitApproval.toLowerCase())) {
          return this.finalizeSpec(params.userIdea, this.currentProject.answers);
        } else {
          return {
            content: [{
              type: 'text' as const,
              text: `❌ **Approval Required**\n\nFinal specification generation requires explicit user approval. Please provide explicit approval to proceed.\n\n*Reply "yes", "approved", or "proceed" to finalize your project specification.*`,
              isError: true
            }]
          };
        }

      default:
        return {
          content: [{
            type: 'text' as const,
            text: `❌ **Invalid Mode**\n\nPlease use one of: "question", "refine", or "approve".`,
            isError: true
          }]
        };
    }
  }

  private async handleSmartPlanning(params: { userIdea: string; generateSDD?: boolean; generateTests?: boolean }) {
    const workflowMode = this.assessWorkflow(params.userIdea);

    if (workflowMode === 'quick') {
      return {
        content: [{
          type: 'text' as const,
          text: `🎯 **Smart Planning Decision: Quick Mode**\n\nBased on your project requirements, I've selected the quick generation workflow for maximum efficiency.\n\n*Proceeding with auto-detection and complete spec generation...*`
        }],
        structuredContent: {
          recommendedWorkflow: 'quick',
          reasoning: 'Requirements appear clear and specific'
        }
      };
    } else {
      return {
        content: [{
          type: 'text' as const,
          text: `🎯 **Smart Planning Decision: Interactive Mode**\n\nBased on your project requirements, I've selected the interactive workflow for optimal refinement.\n\n*Proceeding with clarifying questions...*`
        }],
        structuredContent: {
          recommendedWorkflow: 'interactive',
          reasoning: 'Requirements benefit from clarification and refinement'
        }
      };
    }
  }

  private askClarifyingQuestions(userIdea: string) {
    const questions = this.generateClarifyingQuestions(userIdea);
    return {
      content: [{
        type: 'text' as const,
        text: `🎯 **Interactive Project Planning - Clarification Phase**\n\nI'll help plan your project through interactive refinement. Please answer these clarifying questions:\n\n${questions}\n\n*Provide your answers and I'll create a refined specification.*`
      }],
      structuredContent: {
        nextStep: 'refine',
        clarifyingQuestions: questions,
        workflowMode: 'interactive'
      }
    };
  }

  private refineWithAnswers(userIdea: string, answers: Record<string, string>) {
    const refinedSpec = this.createRefinedSpecification(userIdea, answers);
    return {
      content: [{
        type: 'text' as const,
        text: `✅ **Interactive Project Planning - Refinement Phase**\n\nBased on your answers, here's your refined specification:\n\n${refinedSpec}\n\n*This specification is ready for final approval. Reply "approve: yes" to generate final documentation.*`
      }],
      structuredContent: {
        refinedSpecification: refinedSpec,
        nextStep: 'approve',
        workflowMode: 'interactive'
      }
    };
  }

  private finalizeSpec(userIdea: string, answers: Record<string, string>) {
    const refinedSpec = this.createRefinedSpecification(userIdea, answers);
    const projectType = this.detectProjectType(userIdea);

    // Generate SDD documents
    const sddDocuments = this.generateSDDDocuments(refinedSpec, projectType);
    const sddOutput = `**Generated SDD Documents:**\n${sddDocuments.map((doc: { title: string }) => `- ${doc.title}`).join('\n')}\n\n`;

    // Generate test specifications
    const testSpecifications = this.generateTestSpecifications(projectType);
    const testOutput = `**Generated Test Specifications:**\n${testSpecifications.coverage.join('\n')}\n\n`;

    let output = `🎉 **Interactive Project Planning Complete!**\n\n`;
    output += `**Final Refined Specification:**\n${refinedSpec}\n\n`;
    output += sddOutput;
    output += testOutput;
    output += `*Your comprehensively refined project plan is ready for implementation.*`;

    // Reset project state
    this.currentProject = null;

    return {
      content: [{
        type: 'text' as const,
        text: output
      }],
      structuredContent: {
        refinedSpecification: refinedSpec,
        projectType: projectType,
        sddDocuments: sddDocuments,
        testSpecifications: testSpecifications,
        workflowMode: 'interactive',
        planningComplete: true
      }
    };
  }

  // ... rest of the methods (analyzeProjectIdea, createRefinedSpecification, etc.)
  // would be implemented similarly to the single-shot version
}
```

## 🎯 When to Use Each Approach

| Scenario | Recommended Tool | Reasoning |
|----------|------------------|-----------|
| "Build a todo app with React" | `generate_complete_spec` | Specific technology and requirements |
| "Create a Python mouse button mapper" | `generate_complete_spec` | Clear, well-defined functionality |
| "I want to build something useful but I'm not sure what" | `start_interactive_spec` | Vague requirements need clarification |
| "Help me plan a video processing system" | `start_interactive_spec` | Complex domain requires discussion |
| User explicitly requests help planning | `start_interactive_spec` | User wants interactive refinement |

## 🚀 Benefits of Hybrid Approach

1. **Best of Both Worlds**: Quick generation for clear requirements, interactive for complex ones
2. **User Choice**: LLM can select appropriate workflow based on context
3. **Original Vision Preserved**: Interactive refinement capability maintained
4. **Rate Limiting Solved**: Quick mode eliminates repetitive calls
5. **Flexibility**: Adapts to project complexity and user clarity

This hybrid approach maintains our original interactive workflow vision while solving the rate limiting problem through intelligent workflow selection!