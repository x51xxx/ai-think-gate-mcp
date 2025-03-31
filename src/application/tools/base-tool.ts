import { Tool } from '../../domain/interfaces.js';
import { CallToolResult } from '../../domain/types.js';
import { ContentAnnotations, ContentItem } from '../../domain/mcp-types.js';
import { ToolAnnotations } from '../../domain/mcp-types.js';

/**
 * Base class for all tools
 */
export abstract class BaseTool implements Tool {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties?: Record<string, any>;
        required?: string[];
    };
    annotations?: ToolAnnotations;

    constructor(
        name: string, 
        description: string, 
        inputSchema: any,
        annotations?: ToolAnnotations
    ) {
        this.name = name;
        this.description = description;
        this.inputSchema = inputSchema;
        this.annotations = annotations;
    }

    abstract execute(args: any): Promise<CallToolResult>;

    /**
     * Format tool result
     */
    protected formatResult(text: string, isError: boolean = false, annotations?: ContentAnnotations): CallToolResult {
        return {
            content: [{
                type: "text",
                text,
                annotations
            }],
            isError
        };
    }

    /**
     * Format result with multiple content items
     */
    protected formatMultiContentResult(contentItems: ContentItem[], isError: boolean = false): CallToolResult {
        return {
            content: contentItems,
            isError
        };
    }

    /**
     * Format error with appropriate annotations
     */
    protected formatError(errorMessage: string, userFriendlyMessage?: string): CallToolResult {
        // More user-friendly message
        const userMessage = userFriendlyMessage || 
            `An error occurred while executing the ${this.name} tool. Please try again later.`;
        
        // Detailed message for assistant
        const assistantMessage = `Error executing ${this.name} tool: ${errorMessage}`;
        
        return {
            content: [
                {
                    type: "text",
                    text: userMessage,
                    annotations: {
                        priority: 1.0,
                        audience: ["user"]
                    }
                },
                {
                    type: "text",
                    text: assistantMessage,
                    annotations: {
                        priority: 0.8,
                        audience: ["assistant"]
                    }
                }
            ],
            isError: true
        };
    }

    /**
     * Create progress content for long operations
     */
    protected createProgressContent(current: number, total: number, message: string): ContentItem {
        return {
            type: "text",
            text: `${message} (${current}/${total})`,
            annotations: {
                priority: 0.5,
                metadata: {
                    progress: {
                        current,
                        total
                    }
                }
            }
        };
    }
}
