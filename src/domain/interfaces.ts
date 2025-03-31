import { CallToolResult } from './types.js';

/**
 * MCP tool interface
 */
export interface Tool {
    name: string;
    description: string;
    inputSchema: {
        type: "object"; // Must be specifically "object" to match MCP SDK
        properties?: Record<string, any>;
        required?: string[];
    };
    execute(args: any): Promise<CallToolResult>;
}

/**
 * AI/LLM client interface
 */
export interface AIClient {
    /**
     * Process content through LLM
     */
    process(systemPrompt: string, userContent: string, options?: AIProcessOptions): Promise<string>;

    /**
     * Check if client is initialized
     */
    isInitialized(): boolean;

    /**
     * Get the model name being used
     */
    getModelName(): string | undefined;

    /**
     * Get provider name
     */
    getProviderName(): string;
}

/**
 * Additional options for processing requests to LLM
 */
export interface AIProcessOptions {
    temperature?: number;       // Generation temperature (creativity)
    maxTokens?: number;         // Maximum number of tokens in response
    stopSequences?: string[];   // Sequences on which generation should stop
    systemName?: string;        // System name for LLM (if supported)
    userName?: string;          // User name for LLM (if supported)
    toolName?: string;          // Name of the tool generating the response
}

/**
 * Logger interface
 */
export interface Logger {
    log(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
}

/**
 * IDE endpoint finder interface
 */
export interface IDEEndpointFinder {
    updateIDEEndpoint(): Promise<void>;
    getToolsList(): Promise<any[]>;
}

/**
 * Configuration service interface
 */
export interface ConfigService {
    /**
     * Get configuration value
     */
    get<T>(key: string, defaultValue?: T): T;

    /**
     * Set configuration value
     */
    set<T>(key: string, value: T): void;

    /**
     * Load configuration from file
     */
    loadFromFile(filePath: string): Promise<void>;

    /**
     * Save configuration to file
     */
    saveToFile(filePath: string): Promise<void>;
}
