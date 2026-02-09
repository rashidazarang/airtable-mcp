/**
 * TypeScript Test Suite for Airtable MCP Server
 * Comprehensive type-safe testing with enterprise validation
 */
interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
    duration: number;
}
interface TestSuite {
    name: string;
    tests: TestResult[];
    totalPassed: number;
    totalFailed: number;
    totalDuration: number;
}
declare class TypeScriptTestRunner {
    private results;
    runTest(name: string, testFn: () => Promise<void>): Promise<TestResult>;
    runSuite(suiteName: string, tests: Array<{
        name: string;
        fn: () => Promise<void>;
    }>): Promise<TestSuite>;
    generateReport(): void;
}
declare class MockAirtableMCPServer {
    initialize(): Promise<any>;
    handleToolCall(name: string, params: Record<string, unknown>): Promise<any>;
    handlePromptGet(_name: string, _args: Record<string, unknown>): Promise<any>;
}
declare function runAllTests(): Promise<void>;
export { TypeScriptTestRunner, MockAirtableMCPServer, runAllTests, TestResult, TestSuite };
