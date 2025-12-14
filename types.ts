export enum StepType {
  STRATEGY = 'STRATEGY',
  CREATIVE = 'CREATIVE',
  TECHNICAL = 'TECHNICAL',
  ANALYSIS = 'ANALYSIS'
}

export enum StepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum PipelineStage {
  INPUT = 'INPUT',
  PLANNING = 'PLANNING',
  EXECUTION = 'EXECUTION'
}

export interface PlanStep {
  id: string;
  title: string;
  description: string;
  type: StepType;
  status: StepStatus;
  result?: string;
  thinkingProcess?: string;
}

export interface ExecutionPlan {
  id: string;
  goal: string;
  steps: PlanStep[];
  createdAt: number;
}

export interface ContextData {
  goal: string;
  constraints: string;
  resources: string;
  depth: 'FAST' | 'DEEP';
}

export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  model: string;
  persona: string;
  icon: string;
  thinkingBudget?: number;
}
