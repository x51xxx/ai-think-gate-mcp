import { Tool } from '../../domain/interfaces.js';
import { thinkTool } from '../tools/think/think.js';
import { architectTool } from '../tools/architect/architect.js';
import { llmGatewayTool } from '../tools/llm-gateway/llm-gateway.js';
import { sequentialThinkingTool } from '../tools/sequential-thinking/sequential-thinking.js';
import { logService } from '../services/logging-service.js';
import { ToolDefinition } from '../../domain/types.js';
import { DISABLED_TOOLS_ENV } from '../../domain/constants.js';

/**
 * Tool registry for the MCP
 */
export class ToolRegistry {
    private readonly customTools: Tool[] = [];
    private originalTools: any[] = [];
    private disabledTools: string[] = [];
    private allAvailableTools: Map<string, Tool> = new Map();

    constructor() {
        this.loadDisabledToolsConfig();
        this.registerCustomTools();
    }

    /**
     * Load configuration of disabled tools
     */
    private loadDisabledToolsConfig(): void {
        const disabledToolsEnv = process.env[DISABLED_TOOLS_ENV];
        if (disabledToolsEnv) {
            this.disabledTools = disabledToolsEnv.split(',').map(tool => tool.trim());
            logService.log(`Disabled tools: ${this.disabledTools.join(', ')}`);
        }
    }

    /**
     * Check if a tool is disabled
     */
    private isToolDisabled(toolName: string): boolean {
        return this.disabledTools.includes(toolName) ||
               this.disabledTools.includes('all'); // Special value to disable all tools
    }

    /**
     * Register custom tools
     */
    private registerCustomTools(): void {
        // Map of all available tools
        // Use type assertion to handle the specific tool implementations
        this.allAvailableTools = new Map<string, Tool>([
            ['think', thinkTool as Tool],
            ['architect', architectTool as Tool],
            ['llm_gateway', llmGatewayTool as Tool],
            ['sequential_thinking', sequentialThinkingTool as Tool]
        ]);

        // Register only tools that aren't disabled
        for (const [name, tool] of this.allAvailableTools.entries()) {
            if (!this.isToolDisabled(name)) {
                this.customTools.push(tool);
                logService.log(`Registered tool: ${name}`);
            } else {
                logService.log(`Skipped disabled tool: ${name}`);
            }
        }

        logService.log(`Registered ${this.customTools.length} tools out of ${this.allAvailableTools.size} available`);
    }

    /**
     * Configure original tools from IDE
     */
    setOriginalTools(tools: any[]): void {
        this.originalTools = tools;
        logService.log(`Set ${tools.length} original tools from IDE`);
    }

    /**
     * Get complete list of tools in ToolDefinition[] format
     */
    getAllTools(): ToolDefinition[] {
        // Add custom tools
        const customToolDefinitions = this.customTools.map(tool => this.convertToToolDefinition(tool));

        // Combine original tools and custom tools
        // The mapping to any ensures compatibility with the MCP SDK expected types
        return [...this.originalTools, ...customToolDefinitions] as any;
    }

    /**
     * Convert a tool to ToolDefinition format
     */
    private convertToToolDefinition(tool: Tool): ToolDefinition {
        // Ensure inputSchema exists and has properties before accessing
        const properties = tool.inputSchema?.properties || {};
        const required = tool.inputSchema?.required || [];

        return {
            name: tool.name,
            description: tool.description,
            inputSchema: {
                type: "object", // Explicitly set as "object" to match MCP SDK requirements
                properties,
                required
            }
        };
    }

    /**
     * Get a tool by name
     */
    getToolByName(name: string): Tool | null {
        return this.customTools.find(tool => tool.name === name) || null;
    }

    /**
     * Get list of disabled tools
     */
    getDisabledTools(): string[] {
        return [...this.disabledTools];
    }

    /**
     * Get list of all available tools
     */
    getAllAvailableTools(): string[] {
        // If 'all' is disabled, return empty array
        if (this.disabledTools.includes('all')) {
            return [];
        }

        // Return all registered tools that are not disabled
        return Array.from(this.allAvailableTools.keys())
            .filter(name => !this.isToolDisabled(name));
    }
}

// Export a singleton instance
export const toolRegistry = new ToolRegistry();
