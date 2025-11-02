# KAT-CODER Initial Development Prompt

I need you to help me build "kat-planner" - an MCP (Model Context Protocol) server for the KwaiKAT AI Dev Challenge. This tool will automate spec-driven development by helping users refine their ideas and generate comprehensive specification documents optimized for AI-assisted coding.

**Project Repository**: https://github.com/spenceriam/kat-planner-mcp

## Project Context
- **Challenge**: KwaiKAT AI Dev Challenge (Deadline: Nov 8)
- **Purpose**: Create an MCP server that transforms ideas into LLM-optimized specs
- **Integration**: Works with Claude Code, Cursor, Windsurf via MCP protocol
- **Key Innovation**: Automates the spec-driven development process

## Core Functionality

The MCP server will expose three main tools:

1. **refinement_tool**: 
   - Detects if working with new or existing codebase
   - Asks clarifying questions like a PM/software architect
   - Iteratively refines the idea until user approves
   - Maintains conversation context

2. **sdd_gen**: 
   - Creates a `.spec` folder with specification documents
   - Generates AGENTS.md (project brain/organizer) at root
   - Creates requirements.md (functional PRD)
   - Creates design.md (technical + UI/UX specs)
   - Creates tasks.md (BMAD-method task breakdown)

3. **sdd_testing** (optional):
   - Generates test specifications when requested
   - Based on the generated solution specs

## Technical Requirements

Please set up a TypeScript MCP server with:
- Node.js/TypeScript with @modelcontextprotocol/sdk
- File system operations for reading/writing specs
- Codebase analysis capabilities for existing projects
- LLM integration for intelligent refinement and generation

## First Task

Let's start by setting up the basic MCP server structure. Please:

1. Initialize a new TypeScript project with the necessary dependencies
2. Create the basic MCP server that can register and handle tool calls
3. Set up the project structure as outlined in the design document
4. Implement a simple health check to verify the server works

The complete specifications are provided in the attached documents:
- AGENTS.md - Project overview and status tracking
- requirements.md - Detailed functional requirements
- design.md - Technical architecture and UI/UX design  
- tasks.md - BMAD-method task breakdown

Focus on Phase 1 tasks (1-3) to get the foundation working. Once we have the basic server running, we'll incrementally add the refinement and generation tools.

Please use modern TypeScript practices, proper error handling, and make the code modular and extensible. The goal is to have a working demo for the hackathon that showcases both new project and existing codebase enhancement scenarios.

Let's begin with the project setup and basic MCP server implementation. What's your first step?
