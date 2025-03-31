#!/usr/bin/env node
import {mcpServer} from './application/server/mcp-server.js';
import {logService} from './application/services/logging-service.js';
import {LLMClientFactory} from './infrastructure/llm/client.js';
import { ToolNames } from './domain/constants.js';

/**
 * Main function to start the ThinkGate-MCP server
 */
async function runServer() {
    logService.log("Starting ThinkGate-MCP server...");

    await mcpServer.start()

    // Output information about the server status
    printStatus();

    logService.log("ThinkGate-MCP server is running");
}

/**
 * Print status of available tools and LLM configurations
 */
function printStatus() {
    // Check architect tool
    const architectClient = LLMClientFactory.getClient(ToolNames.architect);
    const architectStatus = architectClient.isInitialized()
        ? `enabled with ${architectClient.getModelName() || 'default model'}`
        : 'unavailable (API key not configured)';

    // Check think tool
    const thinkClient = LLMClientFactory.getClient(ToolNames.think);
    const thinkStatus = thinkClient.isInitialized()
        ? `enabled with ${thinkClient.getModelName() || 'default model'}`
        : 'enabled with basic functionality (no LLM)';

    // Check llm_gateway tool
    const gatewayClient = LLMClientFactory.getClient(ToolNames.llm_gateway);
    const gatewayStatus = gatewayClient.isInitialized()
        ? `enabled with ${gatewayClient.getModelName() || 'default model'}`
        : 'unavailable (API key not configured)';

    logService.log(`ArchitectTool: ${architectStatus}`);
    logService.log(`ThinkTool: ${thinkStatus}`);
    logService.log(`LLMGatewayTool: ${gatewayStatus}`);
    logService.log(`SequentialThinkingTool: enabled (stateful tool)`);

    // Display API configuration help if needed
    if (!architectClient.isInitialized() || !gatewayClient.isInitialized()) {
        logService.log("\nTo enable all tools, configure the following environment variables:");
        logService.log("  LLM_OPENAI_API_KEY=your_api_key            # Common API key for all tools");
        logService.log("  LLM_OPENAI_API_MODEL=gpt-4                 # Common model for all tools");
        logService.log("  LLM_OPENAI_API_ENDPOINT=https://api...     # Common endpoint for all tools");
        logService.log("\nOr configure specific tools separately:");
        logService.log("  LLM_ARCHITECT_API_KEY=your_key             # Specific key for ArchitectTool");
        logService.log("  LLM_THINK_API_KEY=your_key                 # Specific key for ThinkTool");
        logService.log("  LLM_GATEWAY_API_KEY=your_key               # Specific key for LLMGatewayTool");
        logService.log("  LLM_ARCHITECT_API_MODEL=gpt-4              # Specific model for ArchitectTool");
        logService.log("  LLM_THINK_API_MODEL=gpt-3.5-turbo          # Specific model for ThinkTool");
        logService.log("  LLM_GATEWAY_API_MODEL=claude-3-opus        # Specific model for LLMGatewayTool");
    }
}

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
    logService.error("Uncaught exception:", error);
    // In production, we might want to restart the server here
});

process.on('unhandledRejection', (error) => {
    logService.error("Unhandled rejection:", error);
    // In production, we might want to restart the server here
});

// Handle termination signals
process.on('SIGINT', async () => {
    logService.log("Received SIGINT, shutting down...");
    await mcpServer.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logService.log("Received SIGTERM, shutting down...");
    await mcpServer.stop();
    process.exit(0);
});

// Start the server
runServer().catch(error => {
    logService.error("Unhandled error during server startup:", error);
    process.exit(1);
});
