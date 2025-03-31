/**
 * AI Think Gate: A Model Context Protocol (MCP) Server
 *
 * This project implements a Model Context Protocol server that provides several
 * AI-powered tools to help developers with thinking and planning:
 *
 * 1. ArchitectTool:
 *    - Analyzes technical requirements and creates detailed implementation plans
 *    - Breaks down complex tasks into well-structured steps
 *    - Uses a deterministic approach (low temperature) to provide consistent results
 *
 * 2. ThinkTool:
 *    - Helps structure thought processes for complex code problems
 *    - Can work with or without an LLM backend
 *    - Balances creativity and precision with a medium temperature setting
 *
 * 3. LLMGatewayTool:
 *    - Provides direct access to specialized LLMs
 *    - Supports customizable system prompts with different specializations:
 *      - Default for general use
 *      - Code-focused for programming tasks
 *      - Educational for explaining complex concepts
 *    - Allows configurating parameters like temperature and max tokens
 *
 * 4. SequentialThinkingTool:
 *    - Facilitates step-by-step problem-solving with a chain of thought approach
 *    - Supports revising previous thoughts and branching into different paths
 *    - Maintains state between calls to build on previous thinking
 *
 * Key Features:
 * - Follows the Model Context Protocol specification
 * - Supports different LLM providers through OpenAI-compatible API
 * - Ability to configure different API settings for each tool
 * - Provides detailed annotations to help clients understand tool capabilities
 * - Error handling with useful messages for both users and assistants
 * - Progress tracking for long-running operations
 *
 * Environment Configuration:
 * The server can be configured using environment variables:
 *
 * Global API settings:
 * - LLM_OPENAI_API_KEY: Common API key
 * - LLM_OPENAI_API_MODEL: Common model
 * - LLM_OPENAI_API_ENDPOINT: Common endpoint
 *
 * Tool-specific settings:
 * - LLM_ARCHITECT_API_KEY: Key for ArchitectTool
 * - LLM_THINK_API_KEY: Key for ThinkTool
 * - LLM_GATEWAY_API_KEY: Key for LLMGatewayTool
 * - LLM_ARCHITECT_API_MODEL: Model for ArchitectTool
 * - LLM_THINK_API_MODEL: Model for ThinkTool
 * - LLM_GATEWAY_API_MODEL: Model for LLMGatewayTool
 * - LLM_ARCHITECT_API_ENDPOINT: Endpoint for ArchitectTool
 * - LLM_THINK_API_ENDPOINT: Endpoint for ThinkTool
 * - LLM_GATEWAY_API_ENDPOINT: Endpoint for LLMGatewayTool
 *
 * Other settings:
 * - THINKGATE_DISABLED_TOOLS: Comma-separated list of tools to disable
 * - LOG_LEVEL: Logging level (debug, info, log, warn, error)
 * - LOG_DISABLED: Set to "true" to disable logging
 *
 * Compatible with:
 * - Claude Desktop
 * - Cursor
 * - Any other MCP-compliant client
 */
