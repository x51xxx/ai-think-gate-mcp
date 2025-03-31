import { BaseTool } from '../base-tool.js';
import { CallToolResult } from '../../../domain/types.js';
import { logService } from '../../services/logging-service.js';
import { DESCRIPTION } from './prompt.js';
import { getSequentialThinkingToolAnnotations } from '../tool-annotations.js';
import { ToolNames } from '../../../domain/constants.js';

/**
 * Data structure for storing sequential thought information
 */
interface ThoughtData {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  isRevision?: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  needsMoreThoughts?: boolean;
  nextThoughtNeeded: boolean;
}

/**
 * Sequential Thinking tool for step-by-step problem-solving
 */
export class SequentialThinkingTool extends BaseTool {
  private thoughtHistory: ThoughtData[] = [];
  private branches: Record<string, ThoughtData[]> = {};

  constructor() {
    super(
      ToolNames.sequential_thinking,
      DESCRIPTION,
      {
        type: "object",
        properties: {
          thought: {
            type: "string",
            description: "Your current thinking step"
          },
          nextThoughtNeeded: {
            type: "boolean",
            description: "Whether another thought step is needed"
          },
          thoughtNumber: {
            type: "integer",
            description: "Current thought number",
            minimum: 1
          },
          totalThoughts: {
            type: "integer",
            description: "Estimated total thoughts needed",
            minimum: 1
          },
          isRevision: {
            type: "boolean",
            description: "Whether this revises previous thinking"
          },
          revisesThought: {
            type: "integer",
            description: "Which thought is being reconsidered",
            minimum: 1
          },
          branchFromThought: {
            type: "integer",
            description: "Branching point thought number",
            minimum: 1
          },
          branchId: {
            type: "string",
            description: "Branch identifier"
          },
          needsMoreThoughts: {
            type: "boolean",
            description: "If more thoughts are needed"
          }
        },
        required: ["thought", "nextThoughtNeeded", "thoughtNumber", "totalThoughts"]
      },
      getSequentialThinkingToolAnnotations()
    );
  }

  /**
   * Validate thought data structure
   */
  private validateThoughtData(input: unknown): ThoughtData {
    const data = input as Record<string, unknown>;

    if (!data.thought || typeof data.thought !== 'string') {
      throw new Error('Invalid thought: must be a string');
    }
    if (!data.thoughtNumber || typeof data.thoughtNumber !== 'number') {
      throw new Error('Invalid thoughtNumber: must be a number');
    }
    if (!data.totalThoughts || typeof data.totalThoughts !== 'number') {
      throw new Error('Invalid totalThoughts: must be a number');
    }
    if (typeof data.nextThoughtNeeded !== 'boolean') {
      throw new Error('Invalid nextThoughtNeeded: must be a boolean');
    }

    return {
      thought: data.thought as string,
      thoughtNumber: data.thoughtNumber as number,
      totalThoughts: data.totalThoughts as number,
      nextThoughtNeeded: data.nextThoughtNeeded as boolean,
      isRevision: data.isRevision as boolean | undefined,
      revisesThought: data.revisesThought as number | undefined,
      branchFromThought: data.branchFromThought as number | undefined,
      branchId: data.branchId as string | undefined,
      needsMoreThoughts: data.needsMoreThoughts as boolean | undefined,
    };
  }

  /**
   * Format a thought for display
   */
  private formatThought(thoughtData: ThoughtData): string {
    const { thoughtNumber, totalThoughts, thought, isRevision, revisesThought, branchFromThought, branchId } = thoughtData;

    let prefix = '';
    let context = '';

    if (isRevision) {
      prefix = '🔄 Revision';
      context = ` (revising thought ${revisesThought})`;
    } else if (branchFromThought) {
      prefix = '🌿 Branch';
      context = ` (from thought ${branchFromThought}, ID: ${branchId})`;
    } else {
      prefix = '💭 Thought';
      context = '';
    }

    const header = `${prefix} ${thoughtNumber}/${totalThoughts}${context}`;
    const border = '─'.repeat(Math.max(header.length, thought.length) + 4);

    return `
┌${border}┐
│ ${header} │
├${border}┤
│ ${thought.padEnd(border.length - 2)} │
└${border}┘`;
  }

  /**
   * Execution of the SequentialThinking tool
   */
  async execute(args: unknown): Promise<CallToolResult> {
    logService.log(`Handling sequential_thinking tool with args: ${JSON.stringify(args).substring(0, 100)}...`);

    try {
      const validatedInput = this.validateThoughtData(args);

      // Adjust total thoughts if current thought exceeds total
      if (validatedInput.thoughtNumber > validatedInput.totalThoughts) {
        validatedInput.totalThoughts = validatedInput.thoughtNumber;
      }

      // Add thought to history
      this.thoughtHistory.push(validatedInput);

      // Handle branching
      if (validatedInput.branchFromThought && validatedInput.branchId) {
        if (!this.branches[validatedInput.branchId]) {
          this.branches[validatedInput.branchId] = [];
        }
        this.branches[validatedInput.branchId].push(validatedInput);
      }

      // Log the formatted thought
      const formattedThought = this.formatThought(validatedInput);
      logService.log(formattedThought);

      // Return the state information for the next step
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            thoughtNumber: validatedInput.thoughtNumber,
            totalThoughts: validatedInput.totalThoughts,
            nextThoughtNeeded: validatedInput.nextThoughtNeeded,
            branches: Object.keys(this.branches),
            thoughtHistoryLength: this.thoughtHistory.length
          }, null, 2)
        }]
      };
    } catch (error) {
      logService.error("Error in sequential_thinking tool:", error);
      return this.formatError(
        `${(error as Error)?.message || 'Unknown error'}`,
        "Invalid thought data provided. Please check the required parameters."
      );
    }
  }
}

// Export an instance of the tool for use
export const sequentialThinkingTool = new SequentialThinkingTool();