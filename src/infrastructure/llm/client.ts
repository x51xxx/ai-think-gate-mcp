import {ChatOpenAI} from "@langchain/openai";
import {AIClient, AIProcessOptions} from '../../domain/interfaces.js';
import {logService} from '../../application/services/logging-service.js';
import {
    DEFAULT_TEMPERATURES,
    LLM_API_ENDPOINTS,
    LLM_API_KEYS,
    LLM_API_MODELS,
    MAX_TOKENS
} from '../../domain/constants.js';
import {ToolType} from '../../domain/types.js';
import {HumanMessage, SystemMessage} from "@langchain/core/messages";

/**
 * Base client for interacting with LLM through OpenAI-compatible API
 */
export class OpenAIClient implements AIClient {
    private model: ChatOpenAI | null = null;
    private modelName?: string;
    private apiEndpoint?: string;
    private toolName?: ToolType;

    /**
     * OpenAI client constructor
     */
    constructor(toolName?: ToolType) {
        this.toolName = toolName;
        this.initialize();
    }

    /**
     * Initialize OpenAI client with appropriate keys and settings
     */
    private initialize(): void {
        // Determine API key according to tool or general
        const apiKey = this.toolName
            ? process.env[LLM_API_KEYS[this.toolName]] || process.env[LLM_API_KEYS.DEFAULT]
            : process.env[LLM_API_KEYS.DEFAULT];

        // Determine model according to tool or general
        this.modelName = this.toolName
            ? process.env[LLM_API_MODELS[this.toolName]] || process.env[LLM_API_MODELS.DEFAULT]
            : process.env[LLM_API_MODELS.DEFAULT];

        // Determine endpoint according to tool or general
        this.apiEndpoint = this.toolName
            ? process.env[LLM_API_ENDPOINTS[this.toolName]] || process.env[LLM_API_ENDPOINTS.DEFAULT]
            : process.env[LLM_API_ENDPOINTS.DEFAULT];

        // Configure default temperature according to tool
        const defaultTemperature = this.toolName
            ? DEFAULT_TEMPERATURES[this.toolName]
            : 0.5;

        if (apiKey) {
            try {
                this.model = new ChatOpenAI({
                    apiKey,
                    model: this.modelName,
                    configuration: this.apiEndpoint ? {
                        baseURL: this.apiEndpoint
                    } : undefined,
                    temperature: defaultTemperature,
                });

                logService.log(`OpenAI client initialized ${this.toolName ? `for ${this.toolName}` : ''}`);
                logService.debug(`Using model: ${this.modelName}, endpoint: ${this.apiEndpoint || 'default'}`);
            } catch (error) {
                logService.error(`Error initializing OpenAI client: ${error}`);
                this.model = null;
            }
        } else {
            logService.warn(`No API key provided for OpenAI ${this.toolName ? `(${this.toolName})` : ''}, client disabled`);
        }
    }

    /**
     * Process content through LLM
     */
    async process(systemPrompt: string, userContent: string, options?: AIProcessOptions): Promise<string> {
        if (!this.model) {
            throw new Error("OpenAI client not initialized. Please provide API key.");
        }

        try {
            logService.debug(`Request to LLM ${this.toolName ? `(${this.toolName})` : ''}: ${userContent.substring(0, 100)}...`);

            const modelConfig: any = {};

            // Apply options if provided
            if (options) {
                if (options.temperature !== undefined) {
                    modelConfig.temperature = options.temperature;
                }

                if (options.maxTokens !== undefined) {
                    modelConfig.maxTokens = options.maxTokens;
                } else if (this.toolName) {
                    // Apply default max tokens for the tool
                    modelConfig.maxTokens = MAX_TOKENS[this.toolName];
                }

                if (options.stopSequences) {
                    modelConfig.stopSequences = options.stopSequences;
                }
            }

            // Create temporary model with needed parameters or use existing
            const modelToUse = Object.keys(modelConfig).length > 0
                ? this.model.bind(modelConfig)
                : this.model;

            // Use proper LangChain message objects
            const response = await modelToUse.invoke([
                new SystemMessage(systemPrompt),
                new HumanMessage(userContent)
            ]);

            return typeof response.content === 'string'
                ? response.content
                : JSON.stringify(response.content);
        } catch (error) {
            logService.error(`Error in OpenAI processing: ${error}`);
            throw error;
        }
    }

    /**
     * Check if client is initialized
     */
    isInitialized(): boolean {
        return this.model !== null;
    }

    /**
     * Get model name being used
     */
    getModelName(): string | undefined {
        return this.modelName;
    }

    /**
     * Get provider name
     */
    getProviderName(): string {
        return "OpenAI-compatible";
    }
}

/**
 * Factory for creating LLM clients according to tool
 */
export class LLMClientFactory {
    private static instances: Map<string, AIClient> = new Map();

    /**
     * Get client for specific tool
     */
    static getClient(toolName?: ToolType): AIClient {
        const key = toolName || 'default';

        if (!this.instances.has(key)) {
            this.instances.set(key, new OpenAIClient(toolName));
        }

        return this.instances.get(key)!;
    }
}
