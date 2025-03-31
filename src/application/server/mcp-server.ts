import {Server} from "@modelcontextprotocol/sdk/server/index.js";
import {logService} from '../services/logging-service.js';
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {toolRegistry} from './registry.js';
import {Tool} from '../../domain/interfaces.js';
import {CallToolResult} from '../../domain/types.js';
import {CallToolRequestSchema, ListToolsRequestSchema, ListToolsResult} from "@modelcontextprotocol/sdk/types.js";

/**
 * MCP server implementation
 */
export class MCPServer {
    private server: Server;
    private notifyTimeout?: NodeJS.Timeout;

    constructor() {
        this.server = new Server(
            {
                name: "thinkgate-mcp",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {},
                }
            }
        );
    }

    /**
     * Start the MCP server
     */
    async start(): Promise<void> {
        try {
            // Connect to transport
            const transport = new StdioServerTransport();
            await this.server.connect(transport);

            // Set up request handlers
            this.setupRequestHandlers();

            logService.log(`ThinkGate-MCP server started`);
        } catch (error) {
            logService.error(`Failed to start MCP server: ${error}`);
            throw error;
        }
    }

    /**
     * Set up request handlers for the server
     */
    private setupRequestHandlers(): void {
        // Handle tools listing request
        this.server.setRequestHandler(
            ListToolsRequestSchema,
            async (): Promise<ListToolsResult> => {
                logService.debug("Handling tools/list request");
                // Convert to expected type format using type assertion
                const tools = toolRegistry.getAllTools();
                return {tools} as ListToolsResult;
            }
        );

        // Handle tool call request
        this.server.setRequestHandler(
            CallToolRequestSchema,
            async (request) => {
                const {name, arguments: args, _meta} = request.params;
                logService.log(`Handling tools/call request for ${name}`);

                const tool = toolRegistry.getToolByName(name);
                if (!tool) {
                    return this.createErrorResponse(`Tool '${name}' not found`);
                }

                try {
                    const result = await this.executeToolWithProgress(tool, args, _meta?.progressToken as string);
                    return {
                        content: result.content,
                        isError: result.isError
                    };
                } catch (error) {
                    logService.error(`Error executing tool ${name}: ${error}`);
                    return this.createErrorResponse(`Error executing tool ${name}: ${(error as Error)?.message || 'Unknown error'}`);
                }
            }
        );
    }

    /**
     * Execute a tool with progress updates
     */
    private async executeToolWithProgress(tool: Tool, args: any, progressToken?: string): Promise<CallToolResult> {
        try {
            // Send initial progress if token is provided
            if (progressToken) {
                await this.sendProgressNotification(progressToken, 0, 100, `Starting ${tool.name}...`);
            }

            // Execute the tool
            const result = await tool.execute(args);

            // Send completion progress if token is provided
            if (progressToken) {
                await this.sendProgressNotification(progressToken, 100, 100, `Completed ${tool.name}`);
            }

            return result;
        } catch (error) {
            // Send error progress if token is provided
            if (progressToken) {
                await this.sendProgressNotification(
                    progressToken,
                    100,
                    100,
                    `Error in ${tool.name}: ${(error as Error)?.message || 'Unknown error'}`
                );
            }
            throw error;
        }
    }

    /**
     * Send a progress notification
     */
    private async sendProgressNotification(
        progressToken: string,
        progress: number,
        total: number,
        message?: string
    ): Promise<void> {
        try {
            await this.server.notification({
                method: "notifications/progress",
                params: {
                    progressToken,
                    progress,
                    total,
                    message
                }
            });
        } catch (error) {
            logService.warn(`Failed to send progress notification: ${error}`);
        }
    }

    /**
     * Create an error response
     */
    private createErrorResponse(errorMessage: string) {
        return {
            content: [{
                type: "text",
                text: errorMessage,
                annotations: {
                    priority: 1.0,
                    audience: ["user", "assistant"]
                }
            }],
            isError: true
        };
    }

    /**
     * Send a notification that tools have changed
     */
    async sendToolsChangedNotification(): Promise<void> {
        // Debounce notification to avoid sending too many
        if (this.notifyTimeout) {
            clearTimeout(this.notifyTimeout);
        }

        this.notifyTimeout = setTimeout(async () => {
            try {
                await this.server.notification({
                    method: "notifications/tools/changed",
                    params: {}
                });
                logService.debug("Sent tools changed notification");
            } catch (error) {
                logService.warn(`Failed to send tools changed notification: ${error}`);
            }
        }, 500);
    }

    /**
     * Stop the MCP server
     */
    async stop(): Promise<void> {
        try {
            await this.server.close();
            logService.log("MCP server stopped");
        } catch (error) {
            logService.error(`Error stopping MCP server: ${error}`);
        }
    }
}

// Export a singleton instance
export const mcpServer = new MCPServer();
