# KAT-PLANNER MCP SERVER

## Project Overview
A Model Context Protocol (MCP) server that automates spec-driven development workflows for AI-assisted coding. It acts as an intelligent project planning assistant that refines ideas and generates comprehensive specifications optimized for LLM-based development tools.

**Location**: `/docs/AGENTS.md` - Project brain and progress tracker

## Project Status
- Phase: **Production Ready Implementation Complete**
- Current Focus: **Stateful Workflow Management Active**
- Target: KwaiKAT AI Dev Challenge (Nov 8 deadline)

## Key Components
1. MCP Server Core: Handles protocol communication with coding tools
2. **Stateful Refinement Tool**: Interactive idea refinement with sequential workflow enforcement
3. **Validated SDD Generator**: Creates spec-driven development documents with approval requirements
4. **Permission-based Testing Tool**: Generates test specifications only with explicit user consent
5. **Slash Commands System**: Structured command-driven workflow with MCP resource-based guidance

## Integration Points
- Claude Code, Cursor, Windsurf, or any MCP-compatible tool
- Supports any LLM model (KAT-Coder, Claude, GPT-4, etc.)
- Local file system for reading existing codebases
- Git-aware for version control context
- Documentation organized in `/docs/` folder with structured guides

## Document Structure
```
project-root/
├── src/                     # Source code
│   ├── server.ts           # Main MCP server implementation
│   ├── server-slash.ts     # Slash commands MCP server implementation
│   ├── slash-commands.ts   # Slash commands definitions and validation
│   ├── slash-commands-resource.ts # MCP resources for slash commands
│   ├── tools/              # Tools and utilities
│   │   ├── refinement.ts   # Refinement logic module
│   │   └── sdd-generator.ts # Document generation module
│   └── index.ts            # Entry point
├── test/                   # Test files
│   ├── test-basic-mcp.mjs
│   ├── test-development-tool.mjs
│   ├── test-enhanced-workflow.mjs
│   ├── test-fixed-server.mjs
│   ├── test-llm-guidance.mjs
│   ├── test-mcp-connection-final.mjs
│   ├── test-mcp-connection-improved.mjs
│   ├── test-mcp-connection.mjs
│   ├── test-minimal-connection.mjs
│   ├── test-minimal.mjs
│   ├── test-minimal.ts
│   ├── test-production.mjs
│   ├── test-response-format.mjs
│   ├── test-robust.mjs
│   ├── test-simple.ts
│   ├── test-single-shot.mjs
│   ├── test-slash-commands.mjs
│   ├── test-syntax.ts
│   ├── test-tools-discovery.mjs
│   ├── test-workflow-fix.mjs
│   ├── test-interactive-workflow.mjs
│   └── workflow-enforcement-test.mjs
├── docs/                 # Documentation
│   ├── AGENTS.md         # Project overview and progress tracking
│   └── README.md         # User documentation and setup guide
├── dist/                 # Compiled JavaScript output
├── .spec/                # Generated specification documents
│   ├── requirements.md   # Functional requirements
│   ├── design.md         # Technical design
│   └── tasks.md          # Implementation tasks
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # Quick start guide (at root)
```

## Usage Patterns
- New Project: "I want to build [idea]. Please use kat-planner MCP to plan this new project out"
- Enhancement: "I need to add [feature] to this tool. Please use kat-planner MCP to plan out the steps"
- Bug Fix: "There's a bug with [issue]. Please use kat-planner MCP to plan the fix"

## Technical Implementation

### Core Architecture
- TypeScript: Node16 module resolution with ES modules
- MCP Protocol: @modelcontextprotocol/sdk v1.20.2 integration
- Transport: StdioServerTransport for MCP communication
- Validation: Zod schemas for all tool input parameters
- **State Management**: Workflow state tracking with sequential validation

### MCP Tools Implemented
1. health_check: Basic connectivity verification
2. **refinement_tool**: Project idea refinement with conversational Q&A and stateful workflow enforcement
3. **sdd_gen**: Specification document generation with approval validation
4. **sdd_testing**: Test specification generation with explicit consent requirement

### Testing Infrastructure
- Headless Test Harness: Complete MCP tool simulation without client dependency
- **Stateful Workflow Tests**: Validates sequential tool calling and state management
- **Workflow Enforcement Tests**: Verifies approval requirements and user consent
- Comprehensive Test Suite: All tools tested with realistic prompts
- Build Automation: TypeScript compilation and distribution generation
- Validation Framework: Response format and protocol compliance verification

## Progress Log
- [x] MCP server implementation - Basic server structure with tool registration system completed
- [x] Refinement tool with context awareness - Full implementation with stateful workflow management
- [x] SDD generation tool - Complete implementation with approval validation
- [x] Optional testing tool - Complete implementation with explicit consent requirement
- [x] Comprehensive testing suite - Headless test harness created and validated
- [x] TypeScript compilation and build system - Zero compilation errors, distributable output
- [x] Integration testing framework - Ready for Claude Code integration
- [x] **Stateful workflow management** - Sequential validation and state tracking implemented
- [x] **Workflow enforcement mechanisms** - Approval requirements and user consent validation
- [ ] Demo preparation for hackathon

## Testing Results
All MCP tools pass comprehensive testing:
- health_check - Basic connectivity verification
- **refinement_tool** - Project idea refinement with stateful workflow enforcement (tested with multiple scenarios)
- **sdd_gen** - Specification document generation with approval validation
- **sdd_testing** - Test specification generation with explicit consent requirement

## Next Steps
1. Integration Testing: Connect with Claude Code or other MCP clients
2. Demo Development: Build actual AI-powered refinement and document generation logic
3. Hackathon Preparation: Create compelling demo for KwaiKAT AI Dev Challenge

## Quick Start
```bash
# Test the MCP server
./test-scripts/test-server.sh

# Build for production
npm run build

# Start server (for MCP client integration)
node dist/server.js

# Test stateful workflow management
node stateful-workflow-test.mjs

# Test workflow enforcement
node workflow-test.mjs

# Test slash commands implementation
node test-slash-commands.mjs
```

## Technical Notes
- Server uses StdioServerTransport for MCP protocol communication
- All tools follow MCP response format with proper content arrays
- TypeScript strict mode enabled with comprehensive type checking
- **Stateful workflow management prevents out-of-sequence tool calls**
- **Sequential validation enforces proper user interaction between stages**
- **Approval requirements ensure user consent before proceeding**
- **Slash commands system provides structured workflow guidance through MCP resources**
- **Command sequence validation prevents LLM from jumping ahead in workflow**
- **MCP resource-based approach guides LLM behavior without forcing through tools**
- Ready for AI integration with comprehensive workflow enforcement
