/**
 * Defines the functional category of an execution step in the pipeline.
 * Each type corresponds to a specific AI module and persona.
 */
export enum StepType {
  STRATEGY = 'STRATEGY',
  CREATIVE = 'CREATIVE',
  TECHNICAL = 'TECHNICAL',
  ANALYSIS = 'ANALYSIS'
}

/**
 * Represents the current execution state of a specific plan step.
 */
export enum StepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

/**
 * Represents the high-level phases of the NexusFlow application lifecycle.
 */
export enum PipelineStage {
  INPUT = 'INPUT',
  PLANNING = 'PLANNING',
  EXECUTION = 'EXECUTION'
}

/**
 * Represents a single actionable step within an Execution Plan.
 */
export interface PlanStep {
  /** Unique identifier for the step. */
  id: string;
  /** Short, descriptive title of the task. */
  title: string;
  /** Detailed explanation of what the task entails. */
  description: string;
  /** The module type assigned to handle this step. */
  type: StepType;
  /** The current execution status of the step. */
  status: StepStatus;
  /** The generated output from the AI module, populated after completion. */
  result?: string;
  /** The internal reasoning process of the AI, if applicable. */
  thinkingProcess?: string;
}

/**
 * Represents a complete strategic execution plan generated from user context.
 */
export interface ExecutionPlan {
  /** Unique identifier for the execution plan. */
  id: string;
  /** The primary objective the plan is designed to achieve. */
  goal: string;
  /** The sequential list of steps comprising the plan. */
  steps: PlanStep[];
  /** Unix timestamp indicating when the plan was created. */
  createdAt: number;
}

/**
 * Holds the input context provided by the user to generate a plan.
 */
export interface ContextData {
  /** The main objective or desired outcome. */
  goal: string;
  /** Limitations or boundaries for the execution (e.g., budget, time). */
  constraints: string;
  /** Assets or information available to assist in execution. */
  resources: string;
  /** Determines the reasoning depth applied during generation (FAST vs. DEEP). */
  depth: 'FAST' | 'DEEP';
  /** Shared memory context for Paraconsistent Stigmergic Coordination */
  scratchpad?: string;
}

/**
 * Configuration schema for an AI Execution Module.
 */
export interface ModuleConfig {
  /** Unique identifier for the module configuration. */
  id: string;
  /** Human-readable name of the module. */
  name: string;
  /** Brief description of the module's capabilities. */
  description: string;
  /** The specific AI model identifier used by the module (e.g., 'gemini-3-pro-preview'). */
  model: string;
  /** The system instruction dictating the AI's role and behavior. */
  persona: string;
  /** The name of the icon representing the module in the UI. */
  icon: string;
  /** The token budget allocated for internal reasoning, if applicable. */
  thinkingBudget?: number;
}
