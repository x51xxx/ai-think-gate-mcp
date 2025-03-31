import { BaseTool } from '../base-tool.js';
import { CallToolResult } from '../../../domain/types.js';
import { LLMClientFactory } from '../../../infrastructure/llm/client.js';
import { logService } from '../../services/logging-service.js';
import { DESCRIPTION, SYSTEM_PROMPT, CODE_SYSTEM_PROMPT, EDUCATIONAL_SYSTEM_PROMPT } from './prompt.js';
import { getLLMGatewayToolAnnotations } from '../tool-annotations.js';
import { ToolNames } from '../../../domain/constants.js';

/**
 * LLMGateway tool for direct interaction with specialized LLM models
 */
export class LLMGatewayTool extends BaseTool {
    constructor() {
        super(
            ToolNames.llm_gateway,
            DESCRIPTION,
            {
                type: "object",
                properties: {
                    message: {
                        type: "string",
                        description: "Message or query to the LLM, in English"
                    },
                    context: {
                        type: "string",
                        description: "Additional context to improve the response, in English"
                    },
                    systemPrompt: {
                        type: "string",
                        description: "System prompt for the LLM (will replace the default), in English"
                    },
                    systemPromptType: {
                        type: "string",
                        enum: ["default", "code", "educational"],
                        description: "Type of system prompt: default, code, or educational"
                    },
                    temperature: {
                        type: "number",
                        minimum: 0,
                        maximum: 1,
                        description: "Creativity level of the response (0.0 - deterministic, 1.0 - creative)"
                    },
                    maxTokens: {
                        type: "number",
                        minimum: 1,
                        description: "Maximum number of tokens in the response"
                    }
                },
                required: ["message"]
            },
            getLLMGatewayToolAnnotations()
        );
    }

    /**
     * Execution of the LLMGateway tool
     */
    async execute({ 
        message, 
        context, 
        systemPrompt, 
        systemPromptType = "default",
        temperature, 
        maxTokens 
    }: { 
        message: string, 
        context?: string, 
        systemPrompt?: string, 
        systemPromptType?: string,
        temperature?: number, 
        maxTokens?: number 
    }): Promise<CallToolResult> {
        logService.log(`Handling llm_gateway request: ${message.substring(0, 100)}...`);

        try {
            // Get the LLM client specific to this tool
            const llmClient = LLMClientFactory.getClient(ToolNames.llm_gateway);

            if (!llmClient.isInitialized()) {
                logService.log("No LLM API key configured for llm_gateway tool");
                return this.formatError(
                    "API key not configured",
                    "LLM Gateway tool requires LLM API key to be configured. Please check server configuration."
                );
            }

            // Select system prompt based on type or use custom one
            let finalSystemPrompt = systemPrompt;
            if (!finalSystemPrompt) {
                switch (systemPromptType) {
                    case "code":
                        finalSystemPrompt = CODE_SYSTEM_PROMPT;
                        break;
                    case "educational":
                        finalSystemPrompt = EDUCATIONAL_SYSTEM_PROMPT;
                        break;
                    default:
                        finalSystemPrompt = SYSTEM_PROMPT;
                }
            }

            // Prepare content for LLM
            const content = context 
                ? `${message}\n\nAdditional context:\n${context}`
                : message;

            // Add model information to the result
            const modelInfo = `Model used: ${llmClient.getModelName() || 'not specified'} (${llmClient.getProviderName()})`;
            
            // Process through LLM
            const response = await llmClient.process(finalSystemPrompt, content, {
                temperature,
                maxTokens
            });

            // Format response with model information
            return this.formatMultiContentResult([
                {
                    type: "text",
                    text: response,
                    annotations: {
                        priority: 1.0,
                        audience: ["user", "assistant"]
                    }
                },
                {
                    type: "text",
                    text: modelInfo,
                    annotations: {
                        priority: 0.3,
                        audience: ["user", "assistant"],
                        metadata: {
                            model: llmClient.getModelName(),
                            provider: llmClient.getProviderName()
                        }
                    }
                }
            ]);
            
        } catch (error) {
            logService.error("Error in llm_gateway tool:", error);
            return this.formatError(
                `${(error as Error)?.message || 'Unknown error'}`,
                "An error occurred while interacting with the LLM model. Please try again later."
            );
        }
    }
}

// Export an instance of the tool for use
export const llmGatewayTool = new LLMGatewayTool();