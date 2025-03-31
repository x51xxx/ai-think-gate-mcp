import { BaseTool } from '../base-tool.js';
import { CallToolResult } from '../../../domain/types.js';
import { LLMClientFactory } from '../../../infrastructure/llm/client.js';
import { logService } from '../../services/logging-service.js';
import { DESCRIPTION, SYSTEM_PROMPT } from './prompt.js';
import { getThinkToolAnnotations } from '../tool-annotations.js';
import { ToolNames } from '../../../domain/constants.js';

/**
 * Think Tool for "thinking through" problems
 */
export class ThinkTool extends BaseTool {
    constructor() {
        super(
            ToolNames.think,
            DESCRIPTION,
            {
                type: "object",
                properties: {
                    thought: {
                        type: "string",
                        description: "Your detailed thoughts about the problem or idea, in English"
                    },
                    context: {
                        type: "string",
                        description: "Optional context from previous conversation or system state, in English"
                    }
                },
                required: ["thought"]
            },
            getThinkToolAnnotations()
        );
    }

    /**
     * Execution of the Think tool
     */
    async execute({ thought, context }: { thought: string, context?: string }): Promise<CallToolResult> {
        logService.log(`Handling think tool with thought: ${thought.substring(0, 100)}...`);

        try {
            // Get the LLM client specific to this tool
            const llmClient = LLMClientFactory.getClient(ToolNames.think);
            
            // If LLM is configured, use it to enhance the thought
            if (llmClient.isInitialized()) {
                logService.log("Using LLM to enhance thinking");
                try {
                    const promptContent = `Analyze this thought and provide structured insights: 
                                           ${thought} 
                                           
                                           Your working language is ONLY English.
                                           
                                           ${context ? `Context: <context>\n${context}\n</context>` : ''}`;
                    
                    const response = await llmClient.process(
                        SYSTEM_PROMPT,
                        promptContent,
                        {
                            temperature: 0.4, // Medium temperature for balancing creativity and precision
                        }
                    );

                    logService.log("Received response from LLM");
                    return this.formatResult(`Thought processed and enhanced:\n\n${response}`);
                } catch (aiError) {
                    logService.error("Error using LLM:", aiError);
                    // Fall back to basic response if AI fails
                    return this.formatResult(
                        `Your thought has been logged: ${thought}\n\n(Note: AI enhancement failed: ${(aiError as Error)?.message})`,
                        false
                    );
                }
            } else {
                // Basic response if LLM is not configured
                logService.log("No LLM API key configured, returning basic response");
                return this.formatResult(
                    `Your thought has been logged: ${thought}\n\n(Set LLM_THINK_API_KEY or LLM_OPENAI_API_KEY env var for enhanced thinking)`,
                    false
                );
            }
        } catch (error) {
            logService.error("Error in think tool:", error);
            return this.formatError(
                `${(error as Error)?.message || 'Unknown error'}`,
                "An error occurred while processing your thought. Please try again."
            );
        }
    }
}

// Export an instance of the tool for use
export const thinkTool = new ThinkTool();