# KAT-PLANNER

An MCP (Model Context Protocol) server that automates spec-driven development workflows for AI-assisted coding. Transform your ideas into comprehensive, LLM-optimized specification documents.

Built for the KwaiKAT AI Dev Challenge using KAT-Coder-Pro V1.

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/spenceriam/kat-planner-mcp.git
cd kat-planner-mcp
npm install
npm run build
```

### 2. Configure MCP Tool

Add kat-planner to your tool's MCP configuration:

<details>
<summary>📋 Claude Desktop / Claude Code Configuration</summary>

Edit your Claude configuration file:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/claude/claude_desktop_config.json`

Add the following configuration:

```json
{
  "mcpServers": {
    "kat-planner": {
      "command": "node",
      "args": ["/absolute/path/to/kat-planner-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```
</details>

<details>
<summary>🤖 Factory.ai Droid Configuration</summary>

For Factory.ai Droid, add to your MCP configuration:

```json
{
  "mcpServers": {
    "kat-planner": {
      "command": "node",
      "args": ["/absolute/path/to/kat-planner-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

Location of config file varies by platform - check Factory.ai documentation for your specific setup.
</details>

<details>
<summary>💻 Codex CLI Configuration</summary>

For Codex CLI, add to your MCP configuration:

```json
{
  "mcpServers": {
    "kat-planner": {
      "command": "node",
      "args": ["/absolute/path/to/kat-planner-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

Check Codex CLI documentation for config file location and format.
</details>

<details>
<summary>🔍 Gemini CLI Configuration</summary>

For Gemini CLI, add to your MCP configuration:

```json
{
  "mcpServers": {
    "kat-planner": {
      "command": "node",
      "args": ["/absolute/path/to/kat-planner-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

Refer to Gemini CLI documentation for config file specifics.
</details>

<details>
<summary>🔧 Cursor-Agent Configuration</summary>

For Cursor-Agent, add to your MCP configuration:

```json
{
  "mcpServers": {
    "kat-planner": {
      "command": "node",
      "args": ["/absolute/path/to/kat-planner-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

Check Cursor-Agent documentation for configuration file location.
</details>

<details>
<summary>⚡ VSCode Configuration</summary>

For VSCode with MCP extensions, add to your settings.json:

```json
{
  "mcp.servers": {
    "kat-planner": {
      "command": "node",
      "args": ["/absolute/path/to/kat-planner-mcp/dist/index.js"]
    }
  }
}
```

Or add to your workspace settings if using workspace-specific configuration.
</details>

<details>
<summary>🎯 Cursor Configuration</summary>

For Cursor IDE, add to your MCP configuration:

```json
{
  "mcpServers": {
    "kat-planner": {
      "command": "node",
      "args": ["/absolute/path/to/kat-planner-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

Check Cursor documentation for config file location.
</details>

<details>
<summary>🌊 Windsurf Configuration</summary>

For Windsurf, add to your MCP configuration:

```json
{
  "mcpServers": {
    "kat-planner": {
      "command": "node",
      "args": ["/absolute/path/to/kat-planner-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

Refer to Windsurf documentation for configuration specifics.
</details>

<details>
<summary>⚡ Warp.dev Configuration</summary>

For Warp.dev, add to your MCP configuration:

```json
{
  "mcpServers": {
    "kat-planner": {
      "command": "node",
      "args": ["/absolute/path/to/kat-planner-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

Check Warp.dev documentation for config file location.
</details>

<details>
<summary>🌐 Generic MCP Configuration</summary>

For any MCP-compatible tool, use this generic configuration format:

```json
{
  "mcpServers": {
    "kat-planner": {
      "command": "node",
      "args": ["/absolute/path/to/kat-planner-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

Replace the path with your actual project path and adjust the format based on your tool's requirements.
</details>

#### For Development (Hot Reload)

```json
{
  "mcpServers": {
    "kat-planner": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/kat-planner-mcp/src/index.ts"]
    }
  }
}
```

### 3. Restart Your Tool

Restart Claude Desktop, Claude Code, or your MCP-compatible tool to load the server.

## Usage

### New Project
```
I want to build a task management app with voice input. Please use kat-planner MCP to plan this new project out.
```

### Enhance Existing Project
```
I need to add real-time collaboration to this app. Please use kat-planner MCP to plan out the steps.
```

### Bug Fix Planning
```
There's an issue with user authentication timing out. Please use kat-planner MCP to plan the fix.
```

## How It Works

1. **Refinement Phase**: The tool asks clarifying questions to understand your requirements
2. **Approval Checkpoint**: Review the refined specification before proceeding
3. **Document Generation**: Creates a `.spec` folder with:
   - `requirements.md` - Functional requirements and user stories
   - `design.md` - Technical architecture and UI/UX specs
   - `tasks.md` - BMAD-method task breakdown
   - `AGENTS.md` - Project brain/progress tracker (at root)

## Project Structure

```
your-project/
├── AGENTS.md              # Project overview and progress tracking
└── .spec/
    ├── requirements.md    # Functional PRD
    ├── design.md         # Technical + UI/UX design
    └── tasks.md          # Granular task breakdown
```

## Tools Provided

### refinement_tool
Intelligently refines your project idea through conversational Q&A, adapting its approach based on whether you're starting fresh or enhancing existing code.

### sdd_gen
Generates comprehensive specification documents following spec-driven development best practices, optimized for consumption by AI coding assistants.

### sdd_testing (optional)
Creates test specifications based on your requirements and design documents.

## Development

### Running Tests

```bash
npm test
```

### Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## Troubleshooting

### Server Not Connecting

1. Ensure the path in your config is absolute, not relative
2. Check that Node.js is installed: `node --version`
3. Verify the build completed: Check for `dist/index.js`
4. Check tool logs for error messages

### Permission Errors

On macOS/Linux, make the file executable:
```bash
chmod +x dist/index.js
```

### Tool Not Appearing

1. Restart your MCP-compatible tool completely
2. Check the configuration file for JSON syntax errors
3. Ensure there are no other MCP servers with the same name

## License

MIT

## Links

- [GitHub Repository](https://github.com/spenceriam/kat-planner-mcp)
- [KwaiKAT Challenge](https://x.com/kwaikat)
- [MCP Documentation](https://modelcontextprotocol.io)

## Author

Spencer
- X/Twitter: [@spencer_i_am](https://x.com/spencer_i_am)
- GitHub: [spenceriam](https://github.com/spenceriam)
