import { ToolAnnotations } from '../../domain/mcp-types.js';

/**
 * Get standard annotations for the Architect tool
 */
export function getArchitectToolAnnotations(): ToolAnnotations {
    return {
        title: "Software Architecture Planner",
        readOnlyHint: true,  // Architect tool doesn't modify anything, it just produces plans
        openWorldHint: false  // Architect operates on information provided within context
    };
}

/**
 * Get standard annotations for the Think tool
 */
export function getThinkToolAnnotations(): ToolAnnotations {
    return {
        title: "Thought Analyzer",
        readOnlyHint: true,  // Think tool doesn't modify anything, it just analyzes thinking
        openWorldHint: false  // Think operates on information provided within context
    };
}

/**
 * Get standard annotations for the LLM Gateway tool
 */
export function getLLMGatewayToolAnnotations(): ToolAnnotations {
    return {
        title: "Specialized Language Model Gateway",
        readOnlyHint: true,  // LLM Gateway doesn't modify anything
        openWorldHint: true   // LLM has access to its training data which is an "open world"
    };
}

/**
 * Get standard annotations for the Sequential Thinking tool
 */
export function getSequentialThinkingToolAnnotations(): ToolAnnotations {
    return {
        title: "Sequential Chain of Thought Problem Solver",
        readOnlyHint: false,  // Sequential thinking maintains state between calls
        destructiveHint: false, // Only performs additive updates to its state
        idempotentHint: false,  // Calling with the same thought will add duplicates
        openWorldHint: false   // Sequential thinking operates on information within its history
    };
}