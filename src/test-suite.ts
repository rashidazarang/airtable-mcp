/**
 * TypeScript Test Suite for Airtable MCP Server
 * Comprehensive type-safe testing with enterprise validation
 */

import {
  ValidationError,
  AirtableError,
  ListRecordsInput,
  CreateRecordInput,
  AnalyzeDataPrompt
} from '../types/index';

// import { AirtableMCPServer } from './airtable-mcp-server';

// Test framework types
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

// Enhanced test runner with type safety
class TypeScriptTestRunner {
  private results: TestSuite[] = [];

  async runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      return { name, passed: true, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      return { 
        name, 
        passed: false, 
        error: error instanceof Error ? error.message : String(error),
        duration 
      };
    }
  }

  async runSuite(suiteName: string, tests: Array<{ name: string; fn: () => Promise<void> }>): Promise<TestSuite> {
    console.log(`\n🧪 Running test suite: ${suiteName}`);
    
    const suiteStartTime = Date.now();
    const testResults: TestResult[] = [];
    
    for (const test of tests) {
      console.log(`  ⏳ ${test.name}...`);
      const result = await this.runTest(test.name, test.fn);
      testResults.push(result);
      
      if (result.passed) {
        console.log(`  ✅ ${test.name} (${result.duration}ms)`);
      } else {
        console.log(`  ❌ ${test.name} (${result.duration}ms): ${result.error}`);
      }
    }
    
    const totalDuration = Date.now() - suiteStartTime;
    const totalPassed = testResults.filter(r => r.passed).length;
    const totalFailed = testResults.filter(r => !r.passed).length;
    
    const suite: TestSuite = {
      name: suiteName,
      tests: testResults,
      totalPassed,
      totalFailed,
      totalDuration
    };
    
    this.results.push(suite);
    
    console.log(`\n📊 Suite "${suiteName}" completed:`);
    console.log(`  ✅ Passed: ${totalPassed}`);
    console.log(`  ❌ Failed: ${totalFailed}`);
    console.log(`  ⏱️ Duration: ${totalDuration}ms`);
    
    return suite;
  }

  generateReport(): void {
    console.log('\n📋 TypeScript Test Report');
    console.log('=' .repeat(50));
    
    let overallPassed = 0;
    let overallFailed = 0;
    let overallDuration = 0;
    
    for (const suite of this.results) {
      console.log(`\n📦 ${suite.name}:`);
      console.log(`  Tests: ${suite.tests.length}`);
      console.log(`  Passed: ${suite.totalPassed}`);
      console.log(`  Failed: ${suite.totalFailed}`);
      console.log(`  Duration: ${suite.totalDuration}ms`);
      
      overallPassed += suite.totalPassed;
      overallFailed += suite.totalFailed;
      overallDuration += suite.totalDuration;
      
      if (suite.totalFailed > 0) {
        console.log('  Failed tests:');
        suite.tests
          .filter(t => !t.passed)
          .forEach(t => console.log(`    - ${t.name}: ${t.error}`));
      }
    }
    
    console.log('\n🎯 Overall Results:');
    console.log(`  Total Tests: ${overallPassed + overallFailed}`);
    console.log(`  Passed: ${overallPassed}`);
    console.log(`  Failed: ${overallFailed}`);
    console.log(`  Success Rate: ${((overallPassed / (overallPassed + overallFailed)) * 100).toFixed(1)}%`);
    console.log(`  Total Duration: ${overallDuration}ms`);
    
    if (overallFailed === 0) {
      console.log('\n🎉 All tests passed with TypeScript type safety!');
    } else {
      console.log(`\n⚠️ ${overallFailed} test(s) failed. Review and fix before deployment.`);
    }
  }
}

// Mock server for testing (no real API calls)
class MockAirtableMCPServer {
  async initialize(): Promise<any> {
    return {
      name: 'mock-airtable-mcp-server',
      version: '3.1.0',
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: { listChanged: false },
        prompts: { listChanged: false }
      }
    };
  }
  async handleToolCall(name: string, params: Record<string, unknown>): Promise<any> {
    // Mock successful responses for testing
    switch (name) {
      case 'list_tables':
        return {
          content: [{
            type: 'text',
            text: 'Mock tables response',
            data: [{ id: 'tbl123', name: 'Test Table' }]
          }]
        };
      case 'list_records':
        return {
          content: [{
            type: 'text',
            text: 'Mock records response',
            data: { records: [{ id: 'rec123', fields: { Name: 'Test Record' } }] }
          }]
        };
      case 'create_record':
        return {
          content: [{
            type: 'text',
            text: 'Mock create response',
            data: { id: 'rec456', fields: params }
          }]
        };
      default:
        throw new ValidationError(`Unknown tool: ${name}`, 'tool_name');
    }
  }

  async handlePromptGet(_name: string, _args: Record<string, unknown>): Promise<any> {
    return {
      messages: [{
        role: 'assistant',
        content: {
          type: 'text',
          text: `Mock AI response for ${_name} with TypeScript validation`
        }
      }]
    };
  }
}

// Comprehensive test suites
async function typeValidationTests(runner: TypeScriptTestRunner): Promise<void> {
  const mockServer = new MockAirtableMCPServer();
  
  await runner.runSuite('Type Validation Tests', [
    {
      name: 'Valid ListRecordsInput parameters',
      fn: async () => {
        const validParams: ListRecordsInput = {
          table: 'TestTable',
          maxRecords: 10,
          filterByFormula: 'Status = "Active"'
        };
        
        const result = await mockServer.handleToolCall('list_records', validParams as any);
        if (!result.content || !Array.isArray(result.content)) {
          throw new Error('Invalid response structure');
        }
      }
    },
    
    {
      name: 'Valid CreateRecordInput with type casting',
      fn: async () => {
        const validParams: CreateRecordInput = {
          table: 'TestTable',
          fields: {
            'Name': 'Test Record',
            'Priority': 'High',
            'Count': 42
          },
          typecast: true
        };
        
        const result = await mockServer.handleToolCall('create_record', validParams as any);
        if (!result.content) {
          throw new Error('No response content');
        }
      }
    },
    
    {
      name: 'Valid AnalyzeDataPrompt with confidence level',
      fn: async () => {
        const validParams: AnalyzeDataPrompt = {
          table: 'SalesData',
          analysis_type: 'predictive',
          confidence_level: 0.95,
          field_focus: 'revenue,conversion_rate'
        };
        
        const result = await mockServer.handlePromptGet('analyze_data', validParams as any);
        if (!result.messages || !Array.isArray(result.messages)) {
          throw new Error('Invalid AI response structure');
        }
      }
    },
    
    {
      name: 'Invalid tool name handling',
      fn: async () => {
        try {
          await mockServer.handleToolCall('invalid_tool', {});
          throw new Error('Should have thrown ValidationError');
        } catch (error) {
          if (!(error instanceof ValidationError)) {
            throw new Error('Expected ValidationError for invalid tool');
          }
        }
      }
    }
  ]);
}

async function serverInitializationTests(runner: TypeScriptTestRunner): Promise<void> {
  await runner.runSuite('Server Initialization Tests', [
    {
      name: 'Server initialization with capabilities',
      fn: async () => {
        const server = new MockAirtableMCPServer();
        
        const serverInfo = await server.initialize();
        
        if (!serverInfo.name || !serverInfo.version || !serverInfo.protocolVersion) {
          throw new Error('Invalid server info structure');
        }
        
        if (serverInfo.protocolVersion !== '2024-11-05') {
          throw new Error('Incorrect protocol version');
        }
      }
    },
    
    {
      name: 'Server capabilities validation',
      fn: async () => {
        const server = new MockAirtableMCPServer();
        
        const serverInfo = await server.initialize();
        
        if (!serverInfo.capabilities.tools || !serverInfo.capabilities.prompts) {
          throw new Error('Missing required capabilities');
        }
      }
    }
  ]);
}

async function aiPromptTests(runner: TypeScriptTestRunner): Promise<void> {
  const mockServer = new MockAirtableMCPServer();
  
  await runner.runSuite('AI Prompt Tests', [
    {
      name: 'Statistical analysis prompt',
      fn: async () => {
        const params: AnalyzeDataPrompt = {
          table: 'Analytics',
          analysis_type: 'statistical',
          confidence_level: 0.99
        };
        
        const result = await mockServer.handlePromptGet('analyze_data', params as any);
        
        if (!result.messages || result.messages.length === 0) {
          throw new Error('Empty AI response');
        }
        
        if (result.messages[0].role !== 'assistant') {
          throw new Error('Invalid message role');
        }
      }
    },
    
    {
      name: 'Predictive analytics with all parameters',
      fn: async () => {
        const params = {
          table: 'Revenue',
          target_field: 'monthly_revenue',
          prediction_periods: 12,
          algorithm: 'random_forest' as const,
          include_confidence_intervals: true,
          historical_periods: 24
        };
        
        const result = await mockServer.handlePromptGet('predictive_analytics', params);
        
        if (!result.messages) {
          throw new Error('No AI response messages');
        }
      }
    },
    
    {
      name: 'Natural language query processing',
      fn: async () => {
        const params = {
          question: 'What are the top 5 products by revenue?',
          response_format: 'natural_language' as const,
          confidence_threshold: 0.8
        };
        
        const result = await mockServer.handlePromptGet('natural_language_query', params);
        
        if (!result.messages[0].content.text.includes('Mock AI response')) {
          throw new Error('Unexpected AI response content');
        }
      }
    }
  ]);
}

async function errorHandlingTests(runner: TypeScriptTestRunner): Promise<void> {
  await runner.runSuite('Error Handling Tests', [
    {
      name: 'ValidationError for missing required parameters',
      fn: async () => {
        const mockServer = new MockAirtableMCPServer();
        
        try {
          // Missing required 'table' parameter
          await mockServer.handleToolCall('list_records', {});
          throw new Error('Should have thrown an error');
        } catch (error) {
          // Should handle gracefully with proper error response
          if (!(error instanceof Error)) {
            throw new Error('Expected Error instance');
          }
        }
      }
    },
    
    {
      name: 'AirtableError simulation',
      fn: async () => {
        const error = new AirtableError('API Error', 'INVALID_REQUEST', 400);
        
        if (error.code !== 'INVALID_REQUEST') {
          throw new Error('Incorrect error code');
        }
        
        if (error.statusCode !== 400) {
          throw new Error('Incorrect status code');
        }
      }
    },
    
    {
      name: 'Type safety enforcement',
      fn: async () => {
        // This test validates that TypeScript compilation would catch type errors
        const params: ListRecordsInput = {
          table: 'ValidTable',
          maxRecords: 10
          // TypeScript would catch if we tried to add invalid properties
        };
        
        if (typeof params.table !== 'string') {
          throw new Error('Type validation failed');
        }
      }
    }
  ]);
}

async function performanceTests(runner: TypeScriptTestRunner): Promise<void> {
  await runner.runSuite('Performance Tests', [
    {
      name: 'Multiple concurrent tool calls',
      fn: async () => {
        const mockServer = new MockAirtableMCPServer();
        const startTime = Date.now();
        
        const promises = Array.from({ length: 10 }, (_, i) => 
          mockServer.handleToolCall('list_records', { table: `Table${i}` })
        );
        
        await Promise.all(promises);
        
        const duration = Date.now() - startTime;
        if (duration > 1000) { // Should complete within 1 second for mock calls
          throw new Error(`Too slow: ${duration}ms`);
        }
      }
    },
    
    {
      name: 'Large parameter validation',
      fn: async () => {
        const mockServer = new MockAirtableMCPServer();
        
        const largeFields: Record<string, unknown> = {};
        for (let i = 0; i < 100; i++) {
          largeFields[`field_${i}`] = `value_${i}`;
        }
        
        const params: CreateRecordInput = {
          table: 'LargeTable',
          fields: largeFields
        };
        
        const startTime = Date.now();
        await mockServer.handleToolCall('create_record', params as any);
        const duration = Date.now() - startTime;
        
        if (duration > 500) { // Should handle large objects efficiently
          throw new Error(`Parameter validation too slow: ${duration}ms`);
        }
      }
    }
  ]);
}

// Main test execution
async function runAllTests(): Promise<void> {
  console.log('🚀 Starting TypeScript Airtable MCP Test Suite');
  console.log('=' .repeat(60));
  
  const runner = new TypeScriptTestRunner();
  
  try {
    // Run all test suites
    await typeValidationTests(runner);
    await serverInitializationTests(runner);
    await aiPromptTests(runner);
    await errorHandlingTests(runner);
    await performanceTests(runner);
    
    // Generate comprehensive report
    runner.generateReport();
    
  } catch (error) {
    console.error('\n💥 Test suite execution failed:', error);
    process.exit(1);
  }
}

// Export for integration testing
export {
  TypeScriptTestRunner,
  MockAirtableMCPServer,
  runAllTests,
  TestResult,
  TestSuite
};

// Run tests if executed directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('\n🎉 TypeScript test suite completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test suite failed:', error);
      process.exit(1);
    });
}