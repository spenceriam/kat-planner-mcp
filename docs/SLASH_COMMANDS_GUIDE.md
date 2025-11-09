# KAT-PLANNER Slash Commands Guide

## Overview

The KAT-PLANNER MCP server now features a structured slash commands system that provides clear, step-by-step workflow guidance for LLMs. This system ensures proper interactive planning by guiding the LLM through each phase systematically.

## Key Concept: Slash Commands Are NOT for Users

**IMPORTANT**: Slash commands are NOT meant for you (the user) to type directly. They are internal commands that the LLM calls automatically as part of the structured workflow.

**Your Role**: Simply provide your project idea with context, and the LLM handles the rest.

## How It Works

### 1. You Provide Context
You start by describing your project idea in natural language:

```
I want to build a task management app with voice input. The app should help users create tasks using voice commands, organize them by priority, and provide daily summaries. Please use the kat-planner MCP to plan this new project out.
```

### 2. LLM Automatically Uses Slash Commands
The LLM will internally call the appropriate slash commands in sequence:

1. `/plan_project` - Starts the planning workflow
2. `/refine_requirements` - Asks clarifying questions
3. `/generate_specification` - Creates planning documents
4. `/plan_implementation` - Plans implementation phases
5. `/generate_tests` - Creates test specifications
6. `/final_review` - Gets approval
7. `/start_implementation` - Begins coding (only after approval)

### 3. You Interact at Key Points
At each stage, you'll be prompted for input:
- Answer clarifying questions
- Review and approve specifications
- Provide feedback on plans

## Complete Usage Examples

### Example 1: New Project Planning

**What you type:**
```
I'm working on a personal project to build a habit tracking app. I have some initial ideas but need help planning it properly. The app should help users track daily habits, provide streaks and reminders, and show progress over time. I'm thinking of using React Native for mobile development. Please use the kat-planner MCP to help me plan this project systematically.
```

**What happens:**
1. LLM calls `/plan_project` with your idea
2. LLM calls `/refine_requirements` and asks questions like:
   - What specific habits should users be able to track?
   - What platforms should the app support?
   - What type of reminders do you want?
3. You answer the questions
4. LLM calls `/generate_specification` to create planning documents
5. LLM waits for your approval before continuing

### Example 2: Existing Project Enhancement

**What you type:**
```
Looking at this existing codebase, I can see we have a basic note-taking app built with Vue.js and Firebase. I want to enhance it by adding collaborative features, markdown support, and offline functionality. The current app allows users to create and save notes, but lacks advanced features. Please use the kat-planner MCP to plan these enhancements.
```

**What happens:**
1. LLM calls `/plan_project` with your enhancement idea
2. LLM calls `/analyze_project` to examine the existing codebase
3. LLM calls `/refine_requirements` to clarify:
   - What type of collaboration features?
   - Which markdown features are most important?
   - What offline functionality is needed?
4. You provide answers and approval
5. LLM calls `/enhance_specification` to update existing documents

### Example 3: Bug Fix Planning

**What you type:**
```
I'm facing a performance issue with my e-commerce website. The product listing page takes 8+ seconds to load when there are more than 100 products, which is causing users to leave the site. The backend is built with Python/Django and uses PostgreSQL. Please use the kat-planner MCP to plan how to optimize this performance issue.
```

**What happens:**
1. LLM calls `/plan_project` with your bug description
2. LLM calls `/analyze_project` to understand the codebase structure
3. LLM calls `/refine_requirements` to understand:
   - Current database queries
   - Caching mechanisms in place
   - Expected vs actual performance
4. You provide technical details
5. LLM calls `/generate_specification` to create a detailed optimization plan

## What NOT to Do

### ❌ Incorrect: Typing Slash Commands Directly
```
/plan_project I want to build an app
```

**Why it's wrong**: Slash commands are internal LLM commands, not user commands.

### ❌ Incorrect: Skipping Context
```
Please generate the specification documents for my new app idea
```

**Why it's wrong**: This skips the interactive refinement phase.

### ❌ Incorrect: Asking for Implementation Too Early
```
Please start implementing a task management app for me
```

**Why it's wrong**: Implementation only happens after complete planning and approval.

## Proper Context Patterns

### Good: Detailed Project Description
```
I want to create a fitness tracking app that helps users log workouts, track nutrition, and monitor progress over time. The app should have:
- Exercise library with proper form videos
- Meal logging with calorie counting
- Progress tracking with charts and metrics
- Social features to share achievements
I'm considering using React Native for cross-platform mobile development with a Node.js backend.
```

### Good: Clear Enhancement Request
```
I have an existing e-commerce site built with Shopify and want to add custom functionality. Specifically, I need:
- Advanced product filtering and search
- Customer loyalty program integration
- Custom product recommendation engine
- Mobile app companion
The current site handles about 1000 orders per month and I want to improve the user experience significantly.
```

### Good: Specific Problem Statement
```
I'm working on a real-time chat application and experiencing WebSocket connection issues. Users are getting disconnected frequently, especially on mobile devices. The app is built with React frontend, Node.js backend, and uses Socket.IO for real-time communication. I need help planning how to fix the connection stability issues.
```

## Workflow Sequence Explained

### Phase 1: Planning (Interactive)
1. **`/plan_project`**: LLM starts by understanding your high-level idea
2. **`/refine_requirements`**: LLM asks detailed questions to clarify requirements
3. **`/analyze_project`**: (For existing projects) LLM examines current codebase

### Phase 2: Specification (Document Generation)
4. **`/generate_specification`**: LLM creates comprehensive planning documents
5. **`/enhance_specification`**: (For enhancements) LLM updates existing documents

### Phase 3: Implementation Planning
6. **`/plan_implementation`**: LLM creates detailed implementation roadmap
7. **`/plan_enhancement`**: (For enhancements) LLM plans enhancement implementation

### Phase 4: Quality Assurance
8. **`/generate_tests`**: LLM creates comprehensive test specifications
9. **`/generate_enhancement_tests`**: (For enhancements) LLM creates enhancement tests

### Phase 5: Final Review
10. **`/final_review`**: LLM presents all documents for final approval

### Phase 6: Implementation
11. **`/start_implementation`**: LLM begins actual coding (only after approval)

## Troubleshooting

### Issue: LLM is not following the workflow
**Solution**: Ensure you're using the slash commands server (`kat-planner-slash`) and providing proper context with your project idea.

### Issue: LLM is jumping to implementation too quickly
**Solution**: The LLM should wait for user approval at each stage. If it's not doing this, check that you're using the correct server configuration.

### Issue: No slash commands are being called
**Solution**: Make sure you're providing enough context and explicitly asking for planning assistance.

## Configuration Reminder

To use the slash commands system, configure your MCP tool with:

```json
{
  "mcpServers": {
    "kat-planner-slash": {
      "command": "node",
      "args": ["/absolute/path/to/kat-planner-mcp/dist/server-slash.js"]
    }
  }
}
```

## Summary

1. **You provide**: Project idea with context and details
2. **LLM handles**: Automatic slash command execution in proper sequence
3. **You interact**: At key decision points (questions, approvals, feedback)
4. **Result**: Comprehensive planning documents and implementation roadmap

The slash commands system ensures that planning happens systematically and that no implementation begins without proper specification and approval.