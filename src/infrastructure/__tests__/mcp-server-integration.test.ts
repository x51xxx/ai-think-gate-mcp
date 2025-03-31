import * as fs from 'fs';
import {mcpServer} from "../../application/server/mcp-server.js";
import {ToolNames} from "../../domain/constants.js";

// Create log file for debugging
fs.writeFileSync('mcp-server-test.log',
    `=== MCP Server Test Started: ${new Date().toISOString()} ===\n\n`);

// Define type for our mock stdin
interface MockStdin {
    on: jest.Mock;
    off: jest.Mock;
    listenerCount: jest.Mock;
    pause: jest.Mock;
    emit: jest.Mock;
    setEncoding: jest.Mock;
    resume: jest.Mock;
    isTTY: boolean;
    _dataHandler: ((data: Buffer) => void) | null;
}

// Mock for process.stdin and process.stdout
const mockStdin: MockStdin = {
    on: jest.fn((event: string, handler: (data: Buffer) => void) => {
        // Store handlers to call them directly
        if (event === 'data') {
            mockStdin._dataHandler = handler;
        }
    }),
    off: jest.fn(),
    listenerCount: jest.fn().mockReturnValue(0),
    pause: jest.fn(),
    emit: jest.fn(),
    setEncoding: jest.fn(),
    resume: jest.fn(),
    isTTY: false,
    _dataHandler: null // Store the data handler for direct calls
};

// Store all written responses
const serverResponses: string[] = [];

const mockStdout = {
    write: jest.fn((data: any) => {
        if (typeof data === 'string') {
            // Log responses for debugging
            fs.appendFileSync('mcp-server-test.log',
                `SERVER RESPONSE [${new Date().toISOString()}]: ${data}\n`);

            // Store response for later assertions
            serverResponses.push(data);
        }
        return true;
    }),
    once: jest.fn()
};

// Function for emulating client requests
const sendClientRequest = async (method: string, params: Record<string, any> = {}, id: number = 1) => {
    const request = {
        jsonrpc: "2.0",
        id,
        method,
        params
    };

    const requestStr = JSON.stringify(request);
    fs.appendFileSync('mcp-server-test.log',
        `CLIENT REQUEST [${new Date().toISOString()}]: ${requestStr}\n`);

    // Use the stored handler directly instead of emit
    if (mockStdin._dataHandler) {
        mockStdin._dataHandler(Buffer.from(requestStr + '\n'));
    } else {
        fs.appendFileSync('mcp-server-test.log',
            `ERROR: No data handler registered\n`);
    }

    // Small delay to allow processing
    await new Promise(resolve => setTimeout(resolve, 100));

    return request;
};

// Override console.log to avoid test output clutter
const originalConsoleLog = console.log;
console.log = jest.fn();

describe('MCP Server Tests', () => {
    beforeAll(async () => {
        // Replace stdin and stdout with mocks
        Object.defineProperty(process, 'stdin', {value: mockStdin});
        Object.defineProperty(process, 'stdout', {value: mockStdout});

        // Start server once for all tests
        await mcpServer.start();

        // Directly inject server handler into transport if needed
        const transport = (mcpServer as any).server?.transport;
        if (transport) {
            fs.appendFileSync('mcp-server-test.log',
                `Transport found, configuring direct access\n`);
        }

        // Give the server time to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
    });

    afterAll(async () => {
        // Stop the server
        await mcpServer.stop();

        // Restore original stdin/stdout
        Object.defineProperty(process, 'stdin', {value: process.stdin});
        Object.defineProperty(process, 'stdout', {value: process.stdout});

        // Restore console.log
        console.log = originalConsoleLog;

        fs.appendFileSync('mcp-server-test.log',
            `\n=== MCP Server Test Ended: ${new Date().toISOString()} ===\n`);
    });

    beforeEach(() => {
        // Clear mocks and stored responses before each test
        jest.clearAllMocks();
        serverResponses.length = 0;
    });

    test('Server should handle tools/list request', async () => {
        // Send request and wait for response
        await sendClientRequest('tools/list');

        // Create a spy on the server's internal handler for direct invocation if needed
        const serverTransport = (mcpServer as any).server?.transport;
        fs.appendFileSync('mcp-server-test.log',
            `Server transport: ${serverTransport ? 'exists' : 'missing'}\n`);

        // Check if we got a response
        expect(serverResponses.length).toBeGreaterThan(0);

        if (serverResponses.length === 0) {
            // If we still have no responses, manually parse the log file
            fs.appendFileSync('mcp-server-test.log',
                `TEST DEBUG: No responses received. Server state inspection:\n` +
                `mcpServer keys: ${Object.keys((mcpServer as any))}\n` +
                `stdin handlers count: ${mockStdin.on.mock.calls.length}\n`);

            // Fail the test but provide useful debug info
            fail("No server responses received - see mcp-server-test.log for details");
            return;
        }

        // Parse the response
        const response = JSON.parse(serverResponses[0]);

        // Verify the response structure
        expect(response).toHaveProperty('jsonrpc', '2.0');
        expect(response).toHaveProperty('id', 1);
        expect(response).toHaveProperty('result.tools');
        expect(Array.isArray(response.result.tools)).toBe(true);

        // Verify tools
        const toolNames = response.result.tools.map((tool: any) => tool.name);
        expect(toolNames).toContain(ToolNames.think);
        expect(toolNames).toContain(ToolNames.architect);
        expect(toolNames).toContain(ToolNames.llm_gateway);
        expect(toolNames).toContain(ToolNames.sequential_thinking);
    });

    // Additional tests condensed to a single test for brevity
    test('Server should handle various requests', async () => {
        // Test resources/list (unsupported)
        await sendClientRequest('resources/list', {}, 1);

        // Test sequential requests
        await sendClientRequest('tools/list', {}, 2);
        await sendClientRequest('tools/call', {
            name: ToolNames.think,
            arguments: {
                thought: "Testing the think tool"
            }
        }, 3);

        // Verify we got responses
        expect(serverResponses.length).toBeGreaterThan(0);

        // Parse and check responses
        const parsedResponses = serverResponses.map(res => {
            try {
                return JSON.parse(res);
            } catch (e) {
                const error = e as Error;
                fs.appendFileSync('mcp-server-test.log',
                    `ERROR parsing response: ${error.message}, response: ${res}\n`);
                return null;
            }
        }).filter(Boolean);

        // Check that we have some valid responses
        expect(parsedResponses.length).toBeGreaterThan(0);

        // Log what we received for debugging
        fs.appendFileSync('mcp-server-test.log',
            `Received ${parsedResponses.length} valid responses\n`);

        parsedResponses.forEach((resp, i) => {
            fs.appendFileSync('mcp-server-test.log',
                `Response #${i}: id=${resp.id}, type=${resp.error ? 'error' : 'result'}\n`);
        });

        // Find responses by ID
        const resourcesResponse = parsedResponses.find(r => r.id === 1);
        const toolsResponse = parsedResponses.find(r => r.id === 2);
        const thinkResponse = parsedResponses.find(r => r.id === 3);

        // If we found the responses, verify their structure
        if (resourcesResponse) {
            expect(resourcesResponse).toHaveProperty('error.code', -32601);
        }

        if (toolsResponse) {
            expect(toolsResponse).toHaveProperty('result.tools');
        }

        if (thinkResponse) {
            expect(thinkResponse).toHaveProperty('result.content');
        }
    });

// Test to check JSON formatting issue
    test('Server should send properly formatted JSON', async () => {
        // Start the server
        await mcpServer.start();

        // Send tools/list request
        sendClientRequest('tools/list');

        // Wait for asynchronous processing
        await new Promise(resolve => setTimeout(resolve, 100));

        // Get the last write call for analysis
        const lastWriteCall = mockStdout.write.mock.calls[mockStdout.write.mock.calls.length - 1];

        // Check that the sent JSON is correct
        let response;
        expect(() => {
            response = JSON.parse(lastWriteCall[0]);
        }).not.toThrow();

        // Check that the sent string does not contain extra characters after JSON
        const jsonString = lastWriteCall[0];
        // Parse JSON and serialize again for comparison
        const parsedAndStringified = JSON.stringify(JSON.parse(jsonString));

        // Check that the strings are identical after trimming spaces
        expect(jsonString.trim()).toBe(parsedAndStringified);

        // Stop the server
        await mcpServer.stop();
    });
});
