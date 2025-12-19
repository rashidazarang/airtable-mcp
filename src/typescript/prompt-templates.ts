/**
 * Runtime AI prompt templates for Airtable MCP Server
 */

import type { PromptSchema } from './index';

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
  }
};