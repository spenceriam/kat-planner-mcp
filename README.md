# KAT-PLANNER

An MCP (Model Context Protocol) server that automates spec-driven development workflows for AI-assisted coding. Transform your ideas into comprehensive, LLM-optimized specification documents.

Built for the KwaiKAT AI Dev Challenge using KAT-Coder-Pro V1.

## Features

- 🎯 **Intelligent Refinement**: Acts as a PM/Software Architect to refine your ideas
- 📝 **Automated Spec Generation**: Creates complete specification documents
- 🔍 **Codebase Analysis**: Understands existing projects for enhancements
- 🤖 **LLM-Optimized**: Generates documents formatted for AI coding agents
- 🔧 **Universal Compatibility**: Works with Claude Code, Cursor, Windsurf, and any MCP-compatible tool

## Installation

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- Claude Desktop, Claude Code, Cursor, or any MCP-compatible tool

### Step 1: Clone the Repository

```bash
git clone https://github.com/spenceriam/kat-planner-mcp.git
cd kat-planner-mcp
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Build the Project

```bash
npm run build
```

### Step 4: Configure Your MCP Tool

Add kat-planner to your tool's MCP configuration:

#### For Claude Desktop/Claude Code

Edit your Claude configuration file:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/claude/claude_desktop_config.json`

Add the following:

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

#### For Cursor

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "kat-planner": {
      "command": "node",
      "args": ["/absolute/path/to/kat-planner-mcp/dist/index.js"]
    }
  }
}
```

#### For Development (Hot Reload)

If you want to modify the code and test without rebuilding:

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

### Step 5: Restart Your Tool

Restart Claude Desktop, Claude Code, or your MCP-compatible tool to load the server.

## Usage

### New Project

```
"I want to build a task management app with voice input. Please use kat-planner MCP to plan this new project out."
```

### Enhance Existing Project

```
"I need to add real-time collaboration to this app. Please use kat-planner MCP to plan out the steps."
```

### Bug Fix Planning

```
"There's an issue with user authentication timing out. Please use kat-planner MCP to plan the fix."
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

## Tools Provided

### refinement_tool
Intelligently refines your project idea through conversational Q&A, adapting its approach based on whether you're starting fresh or enhancing existing code.

### sdd_gen
Generates comprehensive specification documents following spec-driven development best practices, optimized for consumption by AI coding assistants.

### sdd_testing (optional)
Creates test specifications based on your requirements and design documents.

## Troubleshooting

### Server Not Connecting

1. Ensure the path in your config is absolute, not relative
2. Check that Node.js is installed: `node --version`
3. Verify the build completed: Check for `dist/index.js`
4. Check tool logs for error messages

### Permission Errors

On macOS/Linux, you may need to make the file executable:
```bash
chmod +x dist/index.js
```

### Tool Not Appearing

1. Restart your MCP-compatible tool completely
2. Check the configuration file for JSON syntax errors
3. Ensure there are no other MCP servers with the same name

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

## License

MIT

## Acknowledgments

Built with KAT-Coder-Pro V1 for the KwaiKAT AI Dev Challenge.

## Links

- [GitHub Repository](https://github.com/spenceriam/kat-planner-mcp)
- [KwaiKAT Challenge](https://x.com/kwaikat)
- [MCP Documentation](https://modelcontextprotocol.io)
- [Demo Video](#) (Coming soon)

## Author

Spencer
- X/Twitter: [@spencer_i_am](https://x.com/spencer_i_am)
- GitHub: [spenceriam](https://github.com/spenceriam)

---

**#KwaiKATChallenge #AIChallenge**
