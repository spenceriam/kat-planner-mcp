# Refined Hybrid KAT-PLANNER MCP Server - LLM-Centric Approach

## 🎯 Implementation of Claude Sonnet 4.5's Latest Insights

Based on the excellent analysis, here's the refined implementation that **trusts the LLM** while providing crystal-clear guidance and state communication.

## 🚀 Refined Tool Descriptions - Self-Documenting and Stateful

### **Tool 1: Quick Generation - Complete in ONE Call**
```typescript
{
  name: "generate_complete_spec",
  description: `Generate a complete project specification in ONE call when requirements are clear and detailed.

USE THIS TOOL WHEN you have:
- Specific technology stack mentioned (e.g., "React", "FastAPI", "PostgreSQL")
- Clear features described (e.g., "CRUD operations", "user authentication")
- Detailed requirements (more than just "build me an app")

Example inputs that should use THIS tool:
✅ "Build a React todo app with PostgreSQL, JWT auth, and CRUD operations"
✅ "Create a Python FastAPI server with MongoDB, user registration, and REST API"
✅ "Node.js Express backend with MySQL, user profiles, and file uploads"

DO NOT use this tool when:
❌ User says "help me build something" (too vague)
❌ User says "I'm not sure about..." (needs clarification)
❌ Requirements are unclear or missing tech stack

If uncertain, use 'start_interactive_spec' instead - it's safer.

This tool returns a COMPLETE specification and you're DONE. Do not call other tools after this.`,

  inputSchema: {
    userIdea: z.string().describe('The user\\'s project idea with all requirements'),
    generateSDD: z.boolean().optional().default(false).describe('Generate SDD documents if true'),
    generateTests: z.boolean().optional().default(false).describe('Generate test specifications if true'),
  }
}
```

### **Tool 2: Interactive Mode - Three-Step Workflow**
```typescript
{
  name: "start_interactive_spec",
  description: `Start an interactive specification process for vague or complex requirements.

USE THIS TOOL WHEN:
- Requirements are vague or unclear
- User needs guidance on technical choices
- User expresses uncertainty ("not sure", "help me decide")
- You're uncertain if requirements are complete

Example inputs that should use THIS tool:
✅ "Help me build something for my business"
✅ "I want to make a video processing app but not sure about the tech"
✅ "Build me an e-commerce site" (needs clarification on scale, features, etc.)

WORKFLOW - Call this tool THREE times:
1. mode="question" - Get clarifying questions (you'll receive a sessionId)
2. mode="refine" - Submit user's answers with the sessionId
3. mode="approve" - Finalize the spec with the sessionId

After EACH call, I will tell you EXACTLY what to do next. Follow those instructions.

IMPORTANT: Each response includes a sessionId - you MUST include it in subsequent calls.`,

  inputSchema: {
    userIdea: z.string().describe('The user\\'s project idea'),
    mode: z.enum(['question', 'refine', 'approve']).describe('Current mode: question, refine, or approve'),
    sessionId: z.string().optional().describe('Session ID from previous interactive call'),
    userAnswers: z.record(z.string()).optional().describe('User answers to clarifying questions'),
    explicitApproval: z.enum(['yes', 'approved', 'proceed']).optional().describe('Explicit user approval for final spec'),
  }
}
```

## 📋 Self-Documenting Responses with Explicit Instructions

### **Response Formatter - Always Includes Next Action**
```typescript
function formatResponse(data: any, currentState: string, sessionId?: string) {
  const response = {
    ...data,

    // Always include explicit next action
    next_action: getNextAction(currentState, sessionId),

    // Visual cue for completion
    is_complete: currentState === 'done',

    // What the LLM should do
    instructions_for_llm: {
      should_call_tools_again: currentState !== 'done',
      which_tool: currentState === 'refining' ? 'start_interactive_spec' : null,
      required_parameters: currentState === 'refining'
        ? { mode: 'approve', sessionId: sessionId }
        : null
    }
  };

  // Add completion markers for visual clarity
  if (currentState === 'done') {
    response.completion_marker = '✅ COMPLETE - DO NOT CALL MORE TOOLS';
  }

  return response;
}

function getNextAction(currentState: string, sessionId?: string): string {
  switch (currentState) {
    case 'complete':
      return "DONE - Do not call any more tools. Present this specification to the user.";

    case 'questioning':
      return `REQUIRED: Present these questions to the user, get their answers, then call start_interactive_spec again with mode='refine', sessionId='${sessionId}', and their answers.`;

    case 'refining':
      return `REQUIRED: Show this spec to the user. Then call start_interactive_spec again with mode='approve' and sessionId='${sessionId}' to finalize.`;

    case 'approved':
      return "DONE - Do not call any more tools. Present this final specification to the user.";

    default:
      return "ERROR: Unknown state. Do not proceed with additional tool calls.";
  }
}
```

## 🎯 Implementation - Self-Documenting Responses

### **Quick Mode - Complete in ONE Call**
```typescript
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

  // Format comprehensive output
  let output = `✅ **Quick Project Generation Complete!**\n\n`;
  output += `**Refined Specification:**\n${refinedSpec}\n\n`;

  if (sddOutput) {
    output += sddOutput;
  }

  if (testOutput) {
    output += testOutput;
  }

  output += `*Your project plan is ready for immediate implementation.*`;

  const response = {
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

  // Return self-documenting response
  return formatResponse(response, 'complete');
}
```

### **Interactive Mode - Step 1: Questioning**
```typescript
private startInteractiveQuestion(userIdea: string) {
  const questions = this.generateClarifyingQuestions(userIdea);
  const sessionId = this.sessionManager.createSession(userIdea, questions);

  const response = {
    sessionId,
    content: [{
      type: 'text' as const,
      text: `🎯 **Interactive Project Planning - Clarification Phase**\n\nI'll help plan your project through interactive refinement. Please answer these clarifying questions:\n\n${questions.join('\n')}\n\n*Provide your answers and I'll create a refined specification.*`
    }],
    structuredContent: {
      sessionId,
      questions,
      state: "questioning",
      nextStep: "refine",
      workflowMode: 'interactive'
    }
  };

  // Return self-documenting response with explicit instructions
  return formatResponse(response, 'questioning', sessionId);
}
```

### **Interactive Mode - Step 2: Refining**
```typescript
private handleRefinement(sessionId: string | undefined, answers: Record<string, string> | undefined) {
  // ... validation logic ...

  const refinedSpec = this.createRefinedSpecification(session.projectIdea, answers);

  const response = {
    sessionId,
    content: [{
      type: 'text' as const,
      text: `✅ **Interactive Project Planning - Refinement Phase**\n\nBased on your answers, here's your refined specification:\n\n${refinedSpec}\n\n*This specification is ready for final approval.*`
    }],
    structuredContent: {
      sessionId,
      refinedSpecification: refinedSpec,
      state: "refining",
      nextStep: "approve",
      workflowMode: 'interactive'
    }
  };

  // Return self-documenting response with explicit instructions
  return formatResponse(response, 'refining', sessionId);
}
```

### **Interactive Mode - Step 3: Approval**
```typescript
private handleApproval(sessionId: string | undefined, explicitApproval: string | undefined) {
  // ... validation and generation logic ...

  let output = `🎉 **Interactive Project Planning Complete!**\n\n`;
  output += `**Final Refined Specification:**\n${refinedSpec}\n\n`;
  output += `**Generated SDD Documents:**\n${sddDocuments.map(doc => `- ${doc.title}`).join('\n')}\n\n`;
  output += `**Generated Test Specifications:**\n${testSpecifications.coverage.join('\n')}\n\n`;
  output += `*Your comprehensively refined project plan is ready for implementation.*`;

  const response = {
    sessionId,
    content: [{
      type: 'text' as const,
      text: output
    }],
    structuredContent: {
      sessionId,
      refinedSpecification: refinedSpec,
      projectType: projectType,
      sddDocuments: sddDocuments,
      testSpecifications: testSpecifications,
      state: "approved",
      workflowMode: 'interactive',
      planningComplete: true
    }
  };

  // Return self-documenting response with completion marker
  return formatResponse(response, 'approved', sessionId);
}
```

## 🎯 Example Interactions - Self-Documenting

### **Quick Mode Example**
**User Input**: "Build a React todo app with PostgreSQL, JWT auth, and CRUD operations"

**Response**:
```typescript
{
  "content": [{
    "type": "text",
    "text": "✅ **Quick Project Generation Complete!**\n\n**Refined Specification:**\n**Project:** React Todo App\n**Platform:** React 18+, TypeScript\n**Database:** PostgreSQL 14+\n**Authentication:** JWT with refresh tokens\n**Core Features:**\n- User registration and login\n- Create, read, update, delete todos\n- Filter and search todos\n- Persistent state management\n\n**Generated SDD Documents:**\n- requirements.md\n- design.md\n- tasks.md\n\n*Your project plan is ready for immediate implementation.*"
  }],
  "structuredContent": { /* ... */ },
  "next_action": "DONE - Do not call any more tools. Present this specification to the user.",
  "is_complete": true,
  "instructions_for_llm": {
    "should_call_tools_again": false
  },
  "completion_marker": "✅ COMPLETE - DO NOT CALL MORE TOOLS"
}
```

### **Interactive Mode Example**
**User Input**: "Help me build something for my business"

**Step 1 Response**:
```typescript
{
  "sessionId": "abc123",
  "content": [{
    "type": "text",
    "text": "🎯 **Interactive Project Planning - Clarification Phase**\n\nI'll help plan your project through interactive refinement. Please answer these clarifying questions:\n\n📋 **Business Application Clarification**\n\n1. Core functionality: What is the primary problem this project solves for your business?\n2. User management: Do you need user registration, roles, and permissions?\n3. Data requirements: What types of data will you need to track and manage?\n4. Integration: Do you need to connect with existing business tools or APIs?\n5. Scale: How many users and how much data do you expect to handle?"
  }],
  "structuredContent": { /* ... */ },
  "next_action": "REQUIRED: Present these questions to the user, get their answers, then call start_interactive_spec again with mode='refine', sessionId='abc123', and their answers.",
  "is_complete": false,
  "instructions_for_llm": {
    "should_call_tools_again": true,
    "which_tool": "start_interactive_spec",
    "required_parameters": { "mode": "refine", "sessionId": "abc123" }
  }
}
```

## ✅ Why This Approach Works Better

| Approach | Hardcoded Keywords | LLM Chooses with Good Prompts |
|----------|-------------------|-------------------------------|
| **Flexibility** | ❌ Brittle | ✅ Handles variations |
| **Maintenance** | ❌ Constant updates | ✅ Prompt updates only |
| **Edge cases** | ❌ Misses many | ✅ Understands context |
| **Future-proof** | ❌ Breaks with new tech | ✅ Adapts naturally |
| **Workflow control** | ⚠️ Server enforces | ✅ Clear instructions |

## 🚀 Key Innovation: Trust the LLM

**✅ Keep two tools** (quick + interactive)
**✅ Let the LLM choose** based on excellent descriptions
**✅ Every response includes explicit "next_action"**
**✅ Mark completion clearly** (is_complete: true)
**✅ Include examples** in tool descriptions
**✅ Trust the LLM** - it's good at this!

The "repetitive calling" problem is solved by **clear communication**, not by taking decisions away from the LLM. This approach respects the LLM's capabilities while providing the guidance it needs to make optimal workflow choices.