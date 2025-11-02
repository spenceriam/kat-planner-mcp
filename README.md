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
<summary>Claude Desktop Configuration</summary>

**Official Documentation:** [Claude Desktop MCP Setup](https://modelcontextprotocol.io/docs/develop/build-server)

Edit your Claude Desktop configuration file:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/claude/claude_desktop_config.json` (if available)

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

**Important Notes:**
- Use absolute paths (not relative)
- Create the file if it doesn't exist
- Restart Claude Desktop completely after configuration (Cmd+Q or right-click system tray → Quit)
</details>

<details>
<summary>Claude Code Configuration</summary>

**Official Documentation:** [Claude Code MCP Setup](https://modelcontextprotocol.io/docs/develop/build-server)

Claude Code uses the same configuration format as Claude Desktop. Edit your Claude Code configuration file:

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

**File Location:**
- Configuration file location may vary - check Claude Code documentation for specific path
</details>

<details>
<summary>VSCode Configuration</summary>

**Documentation:** MCP support in VSCode is evolving. Check the VSCode marketplace for MCP extensions.

For VSCode with MCP extensions, add to your `settings.json`:

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

**Alternative Method:**
Add to your workspace settings (`/.vscode/settings.json`):

```json
{
  "mcp.servers": {
    "kat-planner": {
      "command": "node",
      "args": ["${workspaceFolder}/dist/index.js"]
    }
  }
}
```

**Note:** MCP ecosystem in VSCode is rapidly evolving. Check the VSCode marketplace for the latest MCP extensions.
</details>

<details>
<summary>Cursor IDE Configuration</summary>

**Documentation:** Cursor IDE has built-in MCP support. Check Cursor documentation for latest configuration details.

For Cursor IDE, add to your MCP configuration file (location varies by platform):

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

**File Locations:**
- Check Cursor documentation for your specific platform
- Common locations: `~/.cursor/` or `~/Library/Application Support/Cursor/`
</details>

<details>
<summary>Windsurf Configuration</summary>

**Documentation:** Windsurf is a newer terminal interface with evolving MCP support. Check Windsurf documentation for latest configuration.

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

**Configuration File:**
- Location varies by platform - check Windsurf documentation
- Typically found in user configuration directories
</details>

<details>
<summary>Warp.dev Configuration</summary>

**Documentation:** Warp.dev terminal is actively developing MCP support. Check Warp.dev documentation for current configuration methods.

For Warp.dev, configuration may use:

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

**Configuration Methods:**
- Check Warp.dev settings or configuration files
- May support both JSON config and environment variables
</details>

<details>
<summary>Generic MCP Configuration</summary>

**Official Documentation:** [MCP Protocol Specification](https://modelcontextprotocol.io/docs)

For any MCP-compatible tool, use this standard configuration format:

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

**Configuration Guidelines:**
- Replace the path with your actual project path
- Ensure Node.js is in your system PATH
- Use absolute paths for reliability
- Check your tool's documentation for specific file locations
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

Restart your MCP-compatible development tool to load the server configuration.

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
