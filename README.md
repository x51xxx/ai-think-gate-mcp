# AI Think Gate

A Model Context Protocol (MCP) server that provides AI-powered thinking, code architecture, and direct LLM access tools for integration with MCP-compatible clients like Claude Desktop, Cursor, and others.

## Features

- **ArchitectTool**: Analyzes technical requirements and creates detailed implementation plans
- **ThinkTool**: Helps structure your thought process for complex code problems
- **LLMGatewayTool**: Provides direct access to specialized LLMs with configurable parameters
- **SequentialThinkingTool**: Facilitates step-by-step problem-solving with revision capabilities

## Installation

### Using Docker

```bash
# Build Docker image
docker build -t ai-think-gate .

# Run container
docker run -p 3000:3000 ai-think-gate-mcp
```

## Configuration

AI Think Gate supports multiple LLM providers through environment variables. The server works with any OpenAI-compatible API, including OpenAI, Anthropic (Claude), local models like Ollama, and more.

### Environment Variables

#### Common API Settings (for all tools)

```
LLM_OPENAI_API_KEY=your_api_key
LLM_OPENAI_API_MODEL=gpt-4
LLM_OPENAI_API_ENDPOINT=https://api.openai.com/v1
```

#### Tool-Specific API Settings

You can configure different API settings for each tool:

```
# Architect Tool
LLM_ARCHITECT_API_KEY=your_key
LLM_ARCHITECT_API_MODEL=gpt-4
LLM_ARCHITECT_API_ENDPOINT=https://api.openai.com/v1

# Think Tool
LLM_THINK_API_KEY=your_key
LLM_THINK_API_MODEL=gpt-3.5-turbo
LLM_THINK_API_ENDPOINT=https://api.openai.com/v1

# LLM Gateway Tool
LLM_GATEWAY_API_KEY=your_key
LLM_GATEWAY_API_MODEL=claude-3-opus
LLM_GATEWAY_API_ENDPOINT=https://api.anthropic.com/v1
```

#### Using with Ollama

For local LLM deployment with Ollama:

```
LLM_OPENAI_API_KEY=ollama
LLM_OPENAI_API_MODEL=llama3
LLM_OPENAI_API_ENDPOINT=http://localhost:11434/v1
```

#### Additional Settings

```
# Disable specific tools (comma-separated)
THINKGATE_DISABLED_TOOLS=think,llm_gateway

# Logging level
LOG_LEVEL=debug
```

## Usage with MCP Clients

### Claude Desktop

Basic installation:

```json
{
  "mcpServers": {
    "ai_think_gate": {
      "command": "npx",
      "args": [
        "@trishchuk/ai-think-gate-mcp"
      ],
      "env": {
        "LLM_OPENAI_API_KEY": "your_api_key",
        "LLM_OPENAI_API_MODEL": "gemini-2.5-pro-exp-03-25",
        "LLM_OPENAI_API_ENDPOINT": "https://generativelanguage.googleapis.com/v1beta/openai"
      }
    }
  }
}
```

Using different models for each tool and from locally built files:

```json
{
  "mcpServers": {
    "ai_think_gate": {
      "command": "node", 
      "args": ["/path/to/ai-think-gate-mcp/dist/index.js"],
      "env": {
        "LOG_LEVEL": "debug",
        
        "LLM_ARCHITECT_API_KEY": "sk-or-v1-your-key-here",
        "LLM_ARCHITECT_API_MODEL": "anthropic/claude-3-opus-20240229",
        "LLM_ARCHITECT_API_ENDPOINT": "https://api.anthropic.com/v1",
        
        "LLM_THINK_API_KEY": "sk-or-v1-your-key-here",
        "LLM_THINK_API_MODEL": "openai/gpt-4-turbo-preview",
        "LLM_THINK_API_ENDPOINT": "https://openrouter.ai/api/v1",
        
        "LLM_GATEWAY_API_KEY": "sk-or-v1-your-key-here",
        "LLM_GATEWAY_API_MODEL": "anthropic/claude-3-haiku",
        "LLM_GATEWAY_API_ENDPOINT": "https://openrouter.ai/api/v1",

        "LLM_SEQUENTIAL_THINKING_API_KEY": "sk-or-v1-your-key-here",
        "LLM_SEQUENTIAL_THINKING_API_MODEL": "google/gemini-1.5-pro",
        "LLM_SEQUENTIAL_THINKING_API_ENDPOINT": "https://openrouter.ai/api/v1"
      }
    }
  }
}
```

With Ollama integration:

```json
{
  "mcpServers": {
    "ai_think_gate": {
      "command": "npx",
      "args": ["@trishchuk/ai-think-gate-mcp"],
      "env": {
        "LOG_LEVEL": "debug",
        "LLM_OPENAI_API_KEY": "ollama",
        "LLM_OPENAI_API_MODEL": "llama3",
        "LLM_OPENAI_API_ENDPOINT": "http://localhost:11434/v1"
      }
    }
  }
}
```

## Tool Descriptions

### ArchitectTool

Analyzes technical requirements and produces clear, actionable implementation plans. It breaks down complex tasks into well-structured steps that a junior developer could follow.

Parameters:
- `prompt` (string, required): The technical request or coding task to analyze
- `context` (string, optional): Additional context from previous conversation or system state

### ThinkTool

Helps structure your thought process for analyzing complex code issues. It breaks down problems, evaluates potential solutions, and recommends the best approach with detailed justification.

Parameters:
- `thought` (string, required): Your detailed thoughts about the problem or idea
- `context` (string, optional): Additional context from previous conversation or system state

### LLMGatewayTool

Provides direct access to specialized language models for specific types of tasks, with configurable parameters.

Parameters:
- `message` (string, required): Message or query to the LLM
- `context` (string, optional): Additional context to improve the response
- `systemPrompt` (string, optional): Custom system prompt to override the default
- `systemPromptType` (string, optional): Type of system prompt: "default", "code", or "educational"
- `temperature` (number, optional): Creativity level (0.0-1.0)
- `maxTokens` (number, optional): Maximum number of tokens in the response

### SequentialThinkingTool

Facilitates a detailed, step-by-step thinking process for problem-solving with the ability to revise previous thoughts and branch into alternative paths.

Parameters:
- `thought` (string, required): Your current thinking step
- `nextThoughtNeeded` (boolean, required): Whether another thought step is needed
- `thoughtNumber` (integer, required): Current thought number
- `totalThoughts` (integer, required): Estimated total thoughts needed
- `isRevision` (boolean, optional): Whether this revises previous thinking
- `revisesThought` (integer, optional): Which thought is being reconsidered
- `branchFromThought` (integer, optional): Branching point thought number
- `branchId` (string, optional): Branch identifier
- `needsMoreThoughts` (boolean, optional): If more thoughts are needed

## Development

```bash
# Clone the repository
git clone https://github.com/x51xxx/ai-think-gate-mcp.git
cd ai-think-gate-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

## License

MIT
