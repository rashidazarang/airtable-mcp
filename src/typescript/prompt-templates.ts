/**
 * Runtime AI prompt templates for Airtable MCP Server
 */

export interface PromptArgument {
  name: string;
  description: string;
  required: boolean;
  type: string;
  enum?: string[];
}

export interface PromptSchema {
  name: string;
  description: string;
  arguments: PromptArgument[];
}

export const AI_PROMPT_TEMPLATES: Record<string, PromptSchema> = {
  analyze_data: {
    name: 'analyze_data',
    description: 'Advanced AI data analysis with statistical insights, pattern recognition, and predictive modeling',
    arguments: [
      { name: 'table', description: 'Table name or ID to analyze', required: true, type: 'string' },
      { name: 'analysis_type', description: 'Type of analysis', required: false, type: 'string', enum: ['trends', 'statistical', 'patterns', 'predictive', 'anomaly_detection', 'correlation_matrix'] },
      { name: 'field_focus', description: 'Specific fields to focus the analysis on', required: false, type: 'string' },
      { name: 'time_dimension', description: 'Time field for temporal analysis', required: false, type: 'string' },
      { name: 'confidence_level', description: 'Statistical confidence level', required: false, type: 'number', enum: ['0.90', '0.95', '0.99'] }
    ]
  },

  create_report: {
    name: 'create_report',
    description: 'Intelligent report generation with business insights and stakeholder-specific recommendations',
    arguments: [
      { name: 'table', description: 'Table name or ID for report data', required: true, type: 'string' },
      { name: 'report_type', description: 'Type of report to generate', required: true, type: 'string', enum: ['executive_summary', 'detailed_analysis', 'dashboard', 'stakeholder_report'] },
      { name: 'target_audience', description: 'Primary audience for the report', required: true, type: 'string', enum: ['executives', 'managers', 'analysts', 'technical_team'] },
      { name: 'include_recommendations', description: 'Include actionable recommendations', required: false, type: 'boolean' },
      { name: 'time_period', description: 'Time period for analysis', required: false, type: 'string' },
      { name: 'format_preference', description: 'Preferred report format', required: false, type: 'string', enum: ['narrative', 'bullet_points', 'charts', 'mixed'] }
    ]
  },

  predictive_analytics: {
    name: 'predictive_analytics',
    description: 'Advanced forecasting and trend prediction with multiple algorithms and uncertainty quantification',
    arguments: [
      { name: 'table', description: 'Table name or ID for prediction', required: true, type: 'string' },
      { name: 'target_field', description: 'Field to predict', required: true, type: 'string' },
      { name: 'prediction_periods', description: 'Number of periods to predict', required: false, type: 'number' },
      { name: 'algorithm', description: 'Prediction algorithm to use', required: false, type: 'string', enum: ['linear_regression', 'arima', 'exponential_smoothing', 'random_forest', 'neural_network'] },
      { name: 'include_confidence_intervals', description: 'Include confidence intervals', required: false, type: 'boolean' },
      { name: 'historical_periods', description: 'Historical periods for training', required: false, type: 'number' },
      { name: 'external_factors', description: 'External factors to consider', required: false, type: 'string' },
      { name: 'business_context', description: 'Business context for predictions', required: false, type: 'string' }
    ]
  },

  natural_language_query: {
    name: 'natural_language_query',
    description: 'Process natural language questions about data with intelligent context awareness',
    arguments: [
      { name: 'question', description: 'Natural language question about the data', required: true, type: 'string' },
      { name: 'tables', description: 'Specific tables to search (optional)', required: false, type: 'string' },
      { name: 'response_format', description: 'Preferred response format', required: false, type: 'string', enum: ['natural_language', 'structured_data', 'visualization_ready', 'action_items'] },
      { name: 'context_awareness', description: 'Use context from previous queries', required: false, type: 'boolean' },
      { name: 'confidence_threshold', description: 'Minimum confidence for responses', required: false, type: 'number' },
      { name: 'clarifying_questions', description: 'Ask clarifying questions if needed', required: false, type: 'boolean' }
    ]
  },

  data_insights: {
    name: 'data_insights',
    description: 'Discover hidden patterns, relationships, and actionable insights in your Airtable data',
    arguments: [
      { name: 'table', description: 'Table name or ID to analyze', required: true, type: 'string' },
      { name: 'insight_type', description: 'Type of insights to discover', required: false, type: 'string', enum: ['relationships', 'outliers', 'distributions', 'trends', 'all'] },
      { name: 'field_focus', description: 'Specific fields to focus on (comma-separated)', required: false, type: 'string' },
      { name: 'depth', description: 'Analysis depth', required: false, type: 'string', enum: ['quick', 'standard', 'deep'] }
    ]
  },

  optimize_workflow: {
    name: 'optimize_workflow',
    description: 'Analyze and optimize workflows represented in Airtable data with efficiency recommendations',
    arguments: [
      { name: 'table', description: 'Table name or ID containing workflow data', required: true, type: 'string' },
      { name: 'workflow_type', description: 'Type of workflow to optimize', required: false, type: 'string', enum: ['project_management', 'sales_pipeline', 'content_calendar', 'inventory', 'custom'] },
      { name: 'status_field', description: 'Field name representing workflow status/stage', required: false, type: 'string' },
      { name: 'date_field', description: 'Field name for date tracking', required: false, type: 'string' },
      { name: 'optimization_goal', description: 'Primary optimization goal', required: false, type: 'string', enum: ['speed', 'quality', 'cost', 'throughput'] }
    ]
  },

  smart_schema_design: {
    name: 'smart_schema_design',
    description: 'Get AI-powered recommendations for Airtable schema design and optimization',
    arguments: [
      { name: 'use_case', description: 'Description of your use case', required: true, type: 'string' },
      { name: 'existing_base_id', description: 'Base ID to analyze existing schema (optional)', required: false, type: 'string' },
      { name: 'scale', description: 'Expected data scale', required: false, type: 'string', enum: ['small', 'medium', 'large', 'enterprise'] },
      { name: 'priorities', description: 'Design priorities', required: false, type: 'string', enum: ['simplicity', 'flexibility', 'performance', 'data_integrity'] }
    ]
  },

  data_quality_audit: {
    name: 'data_quality_audit',
    description: 'Comprehensive data quality assessment with completeness, consistency, and accuracy checks',
    arguments: [
      { name: 'table', description: 'Table name or ID to audit', required: true, type: 'string' },
      { name: 'audit_type', description: 'Type of quality check', required: false, type: 'string', enum: ['completeness', 'consistency', 'accuracy', 'duplicates', 'comprehensive'] },
      { name: 'field_focus', description: 'Specific fields to audit (comma-separated)', required: false, type: 'string' },
      { name: 'severity_threshold', description: 'Minimum severity to report', required: false, type: 'string', enum: ['info', 'warning', 'error'] }
    ]
  },

  smart_data_transformation: {
    name: 'smart_data_transformation',
    description: 'Plan and execute data transformations with AI-guided mapping and validation',
    arguments: [
      { name: 'source_table', description: 'Source table name or ID', required: true, type: 'string' },
      { name: 'target_table', description: 'Target table name or ID (can be new)', required: true, type: 'string' },
      { name: 'transformation_type', description: 'Type of transformation', required: false, type: 'string', enum: ['restructure', 'aggregate', 'split', 'merge', 'enrich', 'normalize'] },
      { name: 'field_mapping', description: 'Explicit field mapping (JSON)', required: false, type: 'string' },
      { name: 'validation_rules', description: 'Validation rules to apply', required: false, type: 'string' }
    ]
  },

  automation_recommendations: {
    name: 'automation_recommendations',
    description: 'Get AI-powered recommendations for automating repetitive tasks and workflows in Airtable',
    arguments: [
      { name: 'table', description: 'Table name or ID to analyze', required: true, type: 'string' },
      { name: 'focus_area', description: 'Area to focus automation recommendations', required: false, type: 'string', enum: ['data_entry', 'notifications', 'status_updates', 'reporting', 'integrations', 'all'] },
      { name: 'current_pain_points', description: 'Description of current manual processes or pain points', required: false, type: 'string' },
      { name: 'integration_preferences', description: 'Preferred integration tools', required: false, type: 'string', enum: ['airtable_automations', 'zapier', 'make', 'n8n', 'custom_api'] }
    ]
  }
};
