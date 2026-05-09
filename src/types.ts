/**
 * @fileoverview Core type definitions, interfaces, and enumerations for the NexusFlow pipeline.
 * Defines the shape of data flowing through the AI orchestration system.
 */

/**
 * Defines the functional category of an execution step in the pipeline.
 * Each type corresponds to a specific AI module and persona.
 */
export enum StepType {
  /** Strategy and planning module. */
  STRATEGY = 'STRATEGY',
  /** Creative writing and design module. */
  CREATIVE = 'CREATIVE',
  /** Technical implementation and coding module. */
  TECHNICAL = 'TECHNICAL',
  /** Data analysis, critical review, and auditing module. */
  ANALYSIS = 'ANALYSIS',
  /** System architecture and distributed design module (VULCAN). */
  ARCHITECT = 'ARCHITECT',
  /** Visual intent and spatial geometry module (VIPER). */
  VIPER = 'VIPER'
}

/**
 * Represents the current execution state of a specific plan step.
 */
export enum StepStatus {
  /** The step has been created but execution has not started. */
  PENDING = 'PENDING',
  /** The step is currently being executed by the AI module. */
  IN_PROGRESS = 'IN_PROGRESS',
  /** The step execution has finished successfully. */
  COMPLETED = 'COMPLETED',
  /** The step execution encountered an error. */
  FAILED = 'FAILED'
}

/**
 * Represents the high-level phases of the NexusFlow application lifecycle.
 */
export enum PipelineStage {
  /** Initial stage where the user provides goal and context. */
  INPUT = 'INPUT',
  /** Stage where the orchestrator is generating the step-by-step plan. */
  PLANNING = 'PLANNING',
  /** Stage where individual steps are being executed by specialized modules. */
  EXECUTION = 'EXECUTION'
}

/**
 * Represents a single actionable step within an Execution Plan.
 */
export interface PlanStep {
  /**
   * Unique identifier for the step.
   * @type {string}
   */
  id: string;
  /**
   * Short, descriptive title of the task.
   * @type {string}
   */
  title: string;
  /**
   * Detailed explanation of what the task entails.
   * @type {string}
   */
  description: string;
  /**
   * The module type assigned to handle this step.
   * @type {StepType}
   */
  type: StepType;
  /**
   * The current execution status of the step.
   * @type {StepStatus}
   */
  status: StepStatus;
  /**
   * The generated output from the AI module, populated after completion.
   * @type {string | undefined}
   */
  result?: string;
  /**
   * The internal reasoning process of the AI, if applicable.
   * @type {string | undefined}
   */
  thinkingProcess?: string;
}

/**
 * Represents a complete strategic execution plan generated from user context.
 */
export interface ExecutionPlan {
  /**
   * Unique identifier for the execution plan.
   * @type {string}
   */
  id: string;
  /**
   * The primary objective the plan is designed to achieve.
   * @type {string}
   */
  goal: string;
  /**
   * The sequential list of steps comprising the plan.
   * @type {PlanStep[]}
   */
  steps: PlanStep[];
  /**
   * Unix timestamp indicating when the plan was created.
   * @type {number}
   */
  createdAt: number;
}

/**
 * Represents a human-identified structural tension or contradiction.
 * Paraconsistent logic dictates this tension is preserved, not resolved.
 */
export interface Scar {
  /**
   * Unique identifier for the scar.
   * @type {string}
   */
  id: string;
  /**
   * The description of the contradiction or tension to preserve.
   * @type {string}
   */
  description: string;
  /**
   * Timestamp of when the scar was recorded.
   * @type {number}
   */
  timestamp: number;
}

/**
 * Holds the input context provided by the user to generate a plan and guide execution.
 */
export interface ContextData {
  /**
   * The main objective or desired outcome.
   * @type {string}
   */
  goal: string;
  /**
   * Limitations or boundaries for the execution (e.g., budget, time).
   * @type {string}
   */
  constraints: string;
  /**
   * Assets or information available to assist in execution.
   * @type {string}
   */
  resources: string;
  /**
   * Determines the reasoning depth applied during generation (FAST vs. DEEP).
   * @type {'FAST' | 'DEEP'}
   */
  depth: 'FAST' | 'DEEP';
  /**
   * Shared memory context for Paraconsistent Stigmergic Coordination.
   * @type {string | undefined}
   */
  scratchpad?: string;
  /**
   * Symbolic Scar Registry to maintain epistemic tension.
   * @type {Scar[] | undefined}
   */
  scars?: Scar[];
}

/**
 * Configuration schema for an AI Execution Module.
 */
export interface ModuleConfig {
  /**
   * Unique identifier for the module configuration.
   * @type {string}
   */
  id: string;
  /**
   * Human-readable name of the module.
   * @type {string}
   */
  name: string;
  /**
   * Brief description of the module's capabilities.
   * @type {string}
   */
  description: string;
  /**
   * The specific AI model identifier used by the module (e.g., 'gemini-3-pro-preview').
   * @type {string}
   */
  model: string;
  /**
   * The system instruction dictating the AI's role and behavior.
   * @type {string}
   */
  persona: string;
  /**
   * The name of the icon representing the module in the UI.
   * @type {string}
   */
  icon: string;
  /**
   * The token budget allocated for internal reasoning, if applicable.
   * @type {number | undefined}
   */
  thinkingBudget?: number;
}
