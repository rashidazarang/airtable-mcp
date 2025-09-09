/**
 * AI-Powered Prompt Templates Type Definitions
 * Enterprise-grade TypeScript types for all 10 AI prompt templates
 */

import { PromptSchema, PromptArgument } from './index';

// ============================================================================
// AI Prompt Template Interfaces
// ============================================================================

export interface AnalyzeDataPrompt {
  table: string;
  analysis_type?: 'trends' | 'statistical' | 'patterns' | 'predictive' | 'anomaly_detection' | 'correlation_matrix';
  field_focus?: string;
  time_dimension?: string;
  confidence_level?: 0.90 | 0.95 | 0.99;
}

export interface CreateReportPrompt {
  table: string;
  report_type: 'executive_summary' | 'detailed_analysis' | 'dashboard' | 'stakeholder_report';
  target_audience: 'executives' | 'managers' | 'analysts' | 'technical_team';
  include_recommendations?: boolean;
  time_period?: string;
  format_preference?: 'narrative' | 'bullet_points' | 'charts' | 'mixed';
}

export interface DataInsightsPrompt {
  table: string;
  insight_type: 'business_intelligence' | 'trend_analysis' | 'performance_metrics' | 'opportunity_identification';
  focus_areas?: string[];
  comparison_period?: string;
  include_forecasting?: boolean;
  stakeholder_context?: string;
}

export interface OptimizeWorkflowPrompt {
  table: string;
  current_process_description: string;
  optimization_goals: ('efficiency' | 'accuracy' | 'speed' | 'cost_reduction' | 'compliance')[];
  constraints?: string[];
  automation_preference?: 'minimal' | 'moderate' | 'aggressive';
  change_tolerance?: 'low' | 'medium' | 'high';
}

export interface SmartSchemaDesignPrompt {
  purpose: string;
  data_types: string[];
  expected_volume: 'small' | 'medium' | 'large' | 'enterprise';
  compliance_requirements?: ('GDPR' | 'HIPAA' | 'SOX' | 'PCI_DSS')[];
  performance_priorities?: ('query_speed' | 'storage_efficiency' | 'scalability' | 'maintainability')[];
  integration_needs?: string[];
  user_access_patterns?: string;
}

export interface DataQualityAuditPrompt {
  table: string;
  quality_dimensions: ('completeness' | 'accuracy' | 'consistency' | 'timeliness' | 'validity' | 'uniqueness')[];
  automated_fixes?: boolean;
  severity_threshold?: 'low' | 'medium' | 'high' | 'critical';
  compliance_context?: string;
  reporting_requirements?: string[];
}

export interface PredictiveAnalyticsPrompt {
  table: string;
  target_field: string;
  prediction_periods?: number;
  algorithm?: 'linear_regression' | 'arima' | 'exponential_smoothing' | 'random_forest' | 'neural_network';
  include_confidence_intervals?: boolean;
  historical_periods?: number;
  external_factors?: string[];
  business_context?: string;
}

export interface NaturalLanguageQueryPrompt {
  question: string;
  tables?: string[];
  response_format?: 'natural_language' | 'structured_data' | 'visualization_ready' | 'action_items';
  context_awareness?: boolean;
  confidence_threshold?: number;
  clarifying_questions?: boolean;
}

export interface SmartDataTransformationPrompt {
  source_table: string;
  target_schema?: string;
  transformation_goals: ('normalization' | 'aggregation' | 'enrichment' | 'validation' | 'standardization')[];
  data_quality_rules?: string[];
  preserve_history?: boolean;
  validation_strategy?: 'strict' | 'permissive' | 'custom';
  error_handling?: 'fail_fast' | 'log_and_continue' | 'manual_review';
}

export interface AutomationRecommendationsPrompt {
  workflow_description: string;
  current_pain_points: string[];
  automation_scope: 'single_task' | 'workflow_segment' | 'end_to_end' | 'cross_system';
  technical_constraints?: string[];
  business_impact_priority?: ('cost_savings' | 'time_efficiency' | 'error_reduction' | 'scalability')[];
  implementation_timeline?: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  risk_tolerance?: 'conservative' | 'moderate' | 'aggressive';
}

// ============================================================================
// AI Prompt Response Types
// ============================================================================

export interface AnalysisResult {
  summary: string;
  key_findings: string[];
  statistical_measures?: {
    mean?: number;
    median?: number;
    std_deviation?: number;
    correlation_coefficients?: Record<string, number>;
    confidence_intervals?: Array<{ field: string; lower: number; upper: number; confidence: number }>;
  };
  trends?: Array<{
    field: string;
    direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    strength: 'weak' | 'moderate' | 'strong';
    significance: number;
  }>;
  anomalies?: Array<{
    record_id: string;
    field: string;
    expected_value: unknown;
    actual_value: unknown;
    deviation_score: number;
  }>;
  recommendations: string[];
  next_steps: string[];
}

export interface ReportResult {
  title: string;
  executive_summary: string;
  detailed_sections: Array<{
    heading: string;
    content: string;
    supporting_data?: unknown[];
    visualizations?: Array<{ type: string; data: unknown; description: string }>;
  }>;
  key_metrics: Record<string, { value: unknown; change: string; significance: string }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    recommendation: string;
    expected_impact: string;
    implementation_effort: 'low' | 'medium' | 'high';
  }>;
  appendices?: Array<{ title: string; content: string }>;
}

export interface WorkflowOptimizationResult {
  current_state_analysis: {
    efficiency_score: number;
    bottlenecks: Array<{ step: string; impact: 'high' | 'medium' | 'low'; description: string }>;
    resource_utilization: Record<string, number>;
  };
  optimization_recommendations: Array<{
    category: 'automation' | 'process_redesign' | 'tool_integration' | 'skill_development';
    recommendation: string;
    expected_benefits: string[];
    implementation_complexity: 'simple' | 'moderate' | 'complex';
    estimated_roi: string;
    timeline: string;
  }>;
  implementation_roadmap: Array<{
    phase: number;
    duration: string;
    objectives: string[];
    deliverables: string[];
    success_metrics: string[];
  }>;
  risk_assessment: Array<{
    risk: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;
}

export interface SchemaDesignResult {
  recommended_schema: {
    tables: Array<{
      name: string;
      purpose: string;
      fields: Array<{
        name: string;
        type: string;
        constraints: string[];
        description: string;
      }>;
      relationships: Array<{
        type: 'one_to_one' | 'one_to_many' | 'many_to_many';
        target_table: string;
        description: string;
      }>;
    }>;
  };
  design_principles: string[];
  performance_considerations: string[];
  scalability_notes: string[];
  compliance_alignment: Record<string, string[]>;
  migration_strategy?: {
    phases: Array<{ phase: number; description: string; estimated_time: string }>;
    data_migration_notes: string[];
    validation_checkpoints: string[];
  };
}

export interface PredictionResult {
  predictions: Array<{
    period: string;
    predicted_value: number;
    confidence_interval?: { lower: number; upper: number };
    probability_bands?: Array<{ probability: number; range: [number, number] }>;
  }>;
  model_performance: {
    algorithm_used: string;
    accuracy_metrics: Record<string, number>;
    feature_importance?: Record<string, number>;
    validation_results: Record<string, number>;
  };
  business_insights: {
    trend_direction: 'positive' | 'negative' | 'stable';
    seasonality_detected: boolean;
    external_factors_impact: string[];
    risk_factors: string[];
  };
  recommendations: Array<{
    type: 'operational' | 'strategic' | 'tactical';
    recommendation: string;
    timing: string;
    confidence: number;
  }>;
}

// ============================================================================
// Prompt Template Definitions (Type-Safe)
// ============================================================================

// AI prompt templates are defined in prompt-templates.ts for runtime use

// ============================================================================
// Export All AI Prompt Types
// ============================================================================

export {
  AnalyzeDataPrompt,
  CreateReportPrompt,
  DataInsightsPrompt,
  OptimizeWorkflowPrompt,
  SmartSchemaDesignPrompt,
  DataQualityAuditPrompt,
  PredictiveAnalyticsPrompt,
  NaturalLanguageQueryPrompt,
  SmartDataTransformationPrompt,
  AutomationRecommendationsPrompt,
  
  AnalysisResult,
  ReportResult,
  WorkflowOptimizationResult,
  SchemaDesignResult,
  PredictionResult
};