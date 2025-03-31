import { BaseTool } from '../base-tool.js';
import { CallToolResult } from '../../../domain/types.js';
import { LLMClientFactory } from '../../../infrastructure/llm/client.js';
import { logService } from '../../services/logging-service.js';
import { DESCRIPTION, SYSTEM_PROMPT } from './prompt.js';
import { getArchitectToolAnnotations } from '../tool-annotations.js';
import { ToolNames } from '../../../domain/constants.js';

/**
 * Architect tool for requirements analysis and planning
 */
export class ArchitectTool extends BaseTool {
    constructor() {
        super(
            ToolNames.architect,
            DESCRIPTION,
            {
                type: "object",
                properties: {
                    prompt: {
                        type: "string",
                        description: "The technical request or coding task to analyze, in English"
                    },
                    context: {
                        type: "string",
                        description: "Optional context from previous conversation or system state, in English"
                    }
                },
                required: ["prompt"]
            },
            getArchitectToolAnnotations()
        );
    }

    /**
     * Execution of the Architect tool
     */
    async execute({ prompt, context }: { prompt: string, context?: string }): Promise<CallToolResult> {
        logService.log(`Handling architect tool with prompt: ${prompt.substring(0, 100)}...`);

        try {
            // Get the LLM client specific to this tool
            const llmClient = LLMClientFactory.getClient(ToolNames.architect);

            if (!llmClient.isInitialized()) {
                logService.log("No LLM API key configured for architect tool");
                return this.formatError(
                    "API key not configured",
                    "Architect tool requires LLM API key to be configured. Please check server configuration."
                );
            }

            // Prepare content for LLM
            const content = context 
                ? `Here is the context for the project:
                   <context>
                   ${context}
                   </context>
                   
                   And here are the specific technical requirements you need to analyze:
                   <requirements>
                   ${prompt}
                   </requirements>
                 ` 
                : prompt;

            // Process through LLM
            const response = await llmClient.process(SYSTEM_PROMPT, content, {
                temperature: 0.2,  // Low temperature for more deterministic responses
            });

            logService.log("Architect response generated");
            return this.formatResult(response);
        } catch (error) {
            logService.error("Error in architect tool:", error);
            return this.formatError(
                `${(error as Error)?.message || 'Unknown error'}`,
                "Error generating architecture plan. Please try again later."
            );
        }
    }
}

// Export an instance of the tool for use
export const architectTool = new ArchitectTool();