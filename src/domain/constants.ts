// Constants for ThinkGate-MCP

// Environment variables for different LLM providers
export const LLM_API_KEYS = {
    // Common API key for all tools if specific one is not provided
    DEFAULT: 'LLM_OPENAI_API_KEY',
    // Specific keys for each tool
    architect: 'LLM_ARCHITECT_API_KEY',
    think: 'LLM_THINK_API_KEY',
    llm_gateway: 'LLM_GATEWAY_API_KEY',
} as const;

// Environment variables for LLM models
export const LLM_API_MODELS = {
    // Common model for all tools if specific one is not provided
    DEFAULT: 'LLM_OPENAI_API_MODEL',
    // Specific models for each tool
    architect: 'LLM_ARCHITECT_API_MODEL',
    think: 'LLM_THINK_API_MODEL',
    llm_gateway: 'LLM_GATEWAY_API_MODEL',
} as const;

// Environment variables for LLM endpoints
export const LLM_API_ENDPOINTS = {
    // Common endpoint for all tools if specific one is not provided
    DEFAULT: 'LLM_OPENAI_API_ENDPOINT',
    // Specific endpoints for each tool
    architect: 'LLM_ARCHITECT_API_ENDPOINT',
    think: 'LLM_THINK_API_ENDPOINT',
    llm_gateway: 'LLM_GATEWAY_API_ENDPOINT',
} as const;

// Tool names
export const ToolNames = {
    architect: 'architect',
    think: 'think',
    llm_gateway: 'llm_gateway',
    sequential_thinking: 'sequential_thinking'
} as const;

// List of all available custom tools
export const ALL_CUSTOM_TOOLS = Object.values(ToolNames);

// Environment variable with disabled tools
export const DISABLED_TOOLS_ENV = 'THINKGATE_DISABLED_TOOLS';

// Default temperatures for different tools
export const DEFAULT_TEMPERATURES = {
    architect: 0.2,  // Low temperature for more deterministic responses
    think: 0.4,      // Medium temperature for balancing creativity and accuracy
    llm_gateway: 0.7 // Higher temperature for more creative responses
} as const;

// Maximum number of tokens in response
export const MAX_TOKENS = {
    architect: 16384,
    think: 4096,
    llm_gateway: 32768
} as const;
