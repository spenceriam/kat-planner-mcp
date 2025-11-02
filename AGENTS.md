# KAT-PLANNER MCP SERVER

## Project Overview
A Model Context Protocol (MCP) server that automates spec-driven development workflows for AI-assisted coding. It acts as an intelligent project planning assistant that refines ideas and generates comprehensive specifications optimized for LLM-based development tools.

## Project Status
- Phase: Initial Development
- Current Focus: MVP Implementation
- Target: KwaiKAT AI Dev Challenge (Nov 8 deadline)

## Key Components
1. **MCP Server Core**: Handles protocol communication with coding tools
2. **Refinement Tool**: Interactive idea refinement through PM/dev questioning
3. **SDD Generator**: Creates spec-driven development documents
4. **Testing Tool** (Optional): Generates test specifications when requested

## Integration Points
- Claude Code, Cursor, Windsurf, or any MCP-compatible tool
- Supports any LLM model (KAT-Coder, Claude, GPT-4, etc.)
- Local file system for reading existing codebases
- Git-aware for version control context

## Document Structure
```
project-root/
├── AGENTS.md (this file - project brain)
└── .spec/
    ├── requirements.md (functional PRD)
    ├── design.md (technical + UI/UX design)
    └── tasks.md (BMAD-method task breakdown)
```

## Usage Patterns
- **New Project**: "I want to build [idea]. Please use kat-planner MCP to plan this new project out"
- **Enhancement**: "I need to add [feature] to this tool. Please use kat-planner MCP to plan out the steps"
- **Bug Fix**: "There's a bug with [issue]. Please use kat-planner MCP to plan the fix"

## Progress Log
- [ ] MCP server implementation
- [ ] Refinement tool with context awareness
- [ ] SDD generation tool
- [ ] Optional testing tool
- [ ] Integration testing with Claude Code
- [ ] Demo preparation for hackathon
