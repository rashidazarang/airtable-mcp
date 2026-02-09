import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AI_PROMPT_TEMPLATES, PromptSchema } from '../../prompt-templates';
import { AppContext } from '../context';

function buildPromptMessages(template: PromptSchema, args: Record<string, string>): Array<{ role: 'user'; content: { type: 'text'; text: string } }> {
  const argSummary = Object.entries(args)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  const toolGuidance: Record<string, string> = {
    analyze_data: `Use the following tools in sequence:
1. Use "describe" to get the schema for the table
2. Use "query" or "list_records" to fetch the data
3. Analyze the data and provide statistical insights, patterns, and trends`,

    create_report: `Use the following tools in sequence:
1. Use "describe" to understand the table structure
2. Use "query" or "list_records" to fetch relevant data
3. Synthesize the data into a report with the requested format and audience`,

    predictive_analytics: `Use the following tools in sequence:
1. Use "describe" to understand the data schema
2. Use "query" to fetch historical data for the target field
3. Apply forecasting analysis and provide predictions with confidence intervals`,

    natural_language_query: `Use the following tools to answer the question:
1. Use "list_bases" and "describe" to understand available data
2. Use "search_records" or "query" with appropriate filters
3. Synthesize results into a natural language answer`,

    data_insights: `Use the following tools:
1. Use "describe" to get the full schema
2. Use "query" or "list_records" to sample the data
3. Identify patterns, outliers, correlations, and actionable insights`,

    optimize_workflow: `Use the following tools:
1. Use "describe" to understand the workflow table structure
2. Use "query" to fetch workflow data including status and date fields
3. Analyze bottlenecks, cycle times, and suggest optimizations`,

    smart_schema_design: `Use the following tools:
1. If an existing base ID is provided, use "describe" and "get_base_schema" to analyze current schema
2. Use "list_field_types" to understand available field types
3. Provide schema recommendations based on the use case`,

    data_quality_audit: `Use the following tools:
1. Use "describe" to understand the table schema
2. Use "query" or "list_records" to sample data across all fields
3. Check for missing values, inconsistencies, duplicates, and format issues`,

    smart_data_transformation: `Use the following tools:
1. Use "describe" to understand both source and target table schemas
2. Use "query" to sample source data
3. Plan the transformation mapping and validate with sample records`,

    automation_recommendations: `Use the following tools:
1. Use "describe" to understand the table structure and field types
2. Use "query" or "list_records" to understand data patterns
3. Identify repetitive patterns and suggest automation opportunities`
  };

  const guidance = toolGuidance[template.name] || 'Use the available Airtable tools to complete this task.';

  const text = `You are an AI assistant with access to Airtable data tools. Please perform the following task:

**Task**: ${template.description}

**Parameters**:
${argSummary || '(no additional parameters specified)'}

**Approach**:
${guidance}

Please proceed step by step, showing your work and explaining your findings.`;

  return [{ role: 'user' as const, content: { type: 'text' as const, text } }];
}

function buildZodShape(template: PromptSchema): Record<string, z.ZodTypeAny> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const arg of template.arguments) {
    let schema: z.ZodTypeAny = z.string();
    if (arg.description) {
      schema = (schema as z.ZodString).describe(arg.description);
    }
    if (!arg.required) {
      schema = schema.optional();
    }
    shape[arg.name] = schema;
  }
  return shape;
}

export function registerAllPrompts(server: McpServer, _ctx: AppContext): void {
  for (const [name, template] of Object.entries(AI_PROMPT_TEMPLATES)) {
    const argsShape = buildZodShape(template);

    server.prompt(
      name,
      template.description,
      argsShape,
      async (args: Record<string, unknown>) => {
        const stringArgs: Record<string, string> = {};
        for (const [k, v] of Object.entries(args)) {
          if (v !== undefined && v !== null) stringArgs[k] = String(v);
        }
        return { messages: buildPromptMessages(template, stringArgs) };
      }
    );
  }
}
