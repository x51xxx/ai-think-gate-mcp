import {LLMClientFactory} from '../../infrastructure/llm/client.js';
import {ToolNames} from '../../domain/constants.js';
import {ThinkTool} from '../tools/think/think.js';
import {CallToolResult} from '../../domain/types.js';

import 'dotenv/config';

/**
 * E2E test for Think Tool functionality
 *
 * To run this test, make sure you have LLM_THINK_API_KEY or LLM_OPENAI_API_KEY
 * environment variables set in your .env file
 */
describe('Think Tool Integration Test', () => {
    // Extend the test timeout as LLM calls can be slow
    jest.setTimeout(60000); // 60 seconds timeout

    let thinkTool: ThinkTool;
    let thinkClient: any;

    beforeEach(() => {
        thinkTool = new ThinkTool();
        thinkClient = LLMClientFactory.getClient(ToolNames.think);
    });

    it('should successfully invoke the think tool with LLM enhancement', async () => {
        // Skip test if the LLM client is not initialized
        if (!thinkClient.isInitialized()) {
            console.warn("⚠️ Skipping test: Think LLM client not initialized. Check your .env file.");
            return;
        }

        const thought = "I'm having trouble understanding this recursive function. It's supposed to calculate factorials, but it's not working correctly.";
        const context = "The function is: function factorial(n) { if (n <= 0) return 0; return n * factorial(n-1); }";

        const result: CallToolResult = await thinkTool.execute({thought, context});

        console.log("LLM Response:", result.content[0].text);

        // Verify the result
        expect(result.isError).toBe(false);
        expect(result.content[0].text).toContain("Thought processed and enhanced");
        expect(result.content[0].text.length).toBeGreaterThan(100); // Ensure we got a substantial response

        // Check that the response has meaningful content related to factorials
        expect(result.content[0].text.toLowerCase()).toMatch(/factorial|recursion|base case/);
    });

    it('should handle execution without LLM enhancement', async () => {
        // Mock the LLM client to simulate it not being initialized
        const originalIsInitialized = thinkClient.isInitialized;
        thinkClient.isInitialized = jest.fn().mockReturnValue(false);

        const thought = "This is a test thought";

        const result: CallToolResult = await thinkTool.execute({thought});

        // Restore the original method
        thinkClient.isInitialized = originalIsInitialized;

        // Verify the result for non-LLM case
        expect(result.isError).toBe(false); // Not marked as error, just returning basic response
        expect(result.content[0].text).toContain("Your thought has been logged");
        expect(result.content[0].text).toContain("Set LLM_THINK_API_KEY");
    });
});
