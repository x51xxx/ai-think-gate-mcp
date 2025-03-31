import { ContentAnnotations, ToolAnnotations } from './mcp-types.js';

/**
 * Tool definition for registration
 */
export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: {
        type: "object"; // Must be specifically "object" to match MCP SDK
        properties: Record<string, any>;
        required?: string[];
        [x: string]: unknown; // Additional properties for MCP SDK compatibility
    };
    annotations?: ToolAnnotations;
    [x: string]: unknown; // Additional properties for MCP SDK compatibility
}

/**
 * Tool call result
 */
export interface CallToolResult {
    content: ContentItem[];
    isError?: boolean;
}

/**
 * Content item in response
 */
export interface ContentItem {
    type: string;
    text: string;
    data?: string;
    mimeType?: string;
    annotations?: ContentAnnotations;
}

/**
 * Tool type
 */
export type ToolType = 'architect' | 'think' | 'llm_gateway';

/**
 * LLM provider configuration
 */
export interface LLMProviderConfig {
    apiKey?: string;
    model?: string;
    endpoint?: string;
    temperature?: number;
    maxTokens?: number;
    toolName?: ToolType;
}

/**
 * Progress notification
 */
export interface ProgressNotification {
    current: number;
    total: number;
    message?: string;
}

/**
 * Parameters for Architect tool
 */
export interface ArchitectToolParams {
    prompt: string; // Technical task or problem to analyze
    context?: string; // Additional context (previous conversation, system state)
}

/**
 * Parameters for Think tool
 */
export interface ThinkToolParams {
    thought: string; // Thought or idea to analyze
    context?: string; // Additional context
}

/**
 * Parameters for LLM Gateway tool
 */
export interface LLMGatewayParams {
    message: string; // Message to LLM
    context?: string; // Additional context
    systemPrompt?: string; // System prompt
    temperature?: number; // Creativity parameter (0.0-1.0)
    maxTokens?: number; // Maximum number of tokens
    stream?: boolean; // Whether to stream the response
}
