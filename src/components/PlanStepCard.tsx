/**
 * @fileoverview Defines the PlanStepCard component, which renders a single actionable
 * step within the execution pipeline list on the UI.
 */

import React from 'react';
import { PlanStep, StepStatus, StepType } from '../types';
import { Play, CheckCircle, CircleDashed, Clock, Code, PenTool, Lightbulb, BarChart, BrainCircuit, Camera } from 'lucide-react';

/**
 * Props for the PlanStepCard component.
 *
 * @interface PlanStepCardProps
 * @property {PlanStep} step - The data object containing step details (title, status, type, etc.).
 * @property {boolean} isActive - Flag indicating if this card is currently selected by the user.
 * @property {(step: PlanStep) => void} onSelect - Callback fired when the card is clicked.
 */
interface PlanStepCardProps {
  step: PlanStep;
  isActive: boolean;
  onSelect: (step: PlanStep) => void;
}

/**
 * Resolves the appropriate Lucide icon component based on the step's Module Type.
 *
 * @param {StepType} type - The designated type/category of the execution step.
 * @returns {React.JSX.Element} The rendered React element for the associated icon.
 */
const getTypeIcon = (type: StepType) => {
  switch (type) {
    case StepType.TECHNICAL: return <Code className="w-4 h-4 text-emerald-400" />;
    case StepType.CREATIVE: return <PenTool className="w-4 h-4 text-purple-400" />;
    case StepType.STRATEGY: return <Lightbulb className="w-4 h-4 text-amber-400" />;
    case StepType.ANALYSIS: return <BarChart className="w-4 h-4 text-blue-400" />;
    case StepType.VIPER: return <Camera className="w-4 h-4 text-[#E63946]" />;
    default: return <CircleDashed className="w-4 h-4 text-gray-400" />;
  }
};

/**
 * Resolves the appropriate status indicator element based on the step's current state.
 *
 * @param {StepStatus} status - The current operational status of the step.
 * @returns {React.JSX.Element | null} The rendered status icon or spinner, or null if unhandled.
 */
const getStatusIcon = (status: StepStatus) => {
  switch (status) {
    case StepStatus.COMPLETED: return <CheckCircle className="w-5 h-5 text-green-500" />;
    case StepStatus.IN_PROGRESS: return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    case StepStatus.PENDING: return <Clock className="w-5 h-5 text-gray-500" />;
    case StepStatus.FAILED: return <div className="w-5 h-5 bg-red-500 rounded-full" />;
    default: return null;
  }
};

/**
 * A functional React component that displays a summary card for a specific plan step.
 * Includes status indicators, module badges, and an interactive "play" hover state.
 *
 * @component
 * @param {PlanStepCardProps} props - The properties passed to the component.
 * @returns {React.JSX.Element} The interactive card element for the pipeline list.
 */
export const PlanStepCard: React.FC<PlanStepCardProps> = ({ step, isActive, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(step)}
      className={`
        relative p-4 rounded-xl border transition-all duration-200 cursor-pointer group
        ${isActive 
          ? 'bg-nexus-800 border-nexus-accent shadow-lg shadow-nexus-accent/10' 
          : 'bg-nexus-800/50 border-nexus-700 hover:border-nexus-600 hover:bg-nexus-800'}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="mt-1">
            {getStatusIcon(step.status)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-nexus-900 border border-nexus-700 text-nexus-300 flex items-center gap-1.5">
              {getTypeIcon(step.type)}
              {step.type}
            </span>
          </div>
          <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-nexus-200'}`}>
            {step.title}
          </h3>
          <p className="text-xs text-nexus-400 mt-1 line-clamp-2">
            {step.description}
          </p>

          {/* Thinking Process Indicator */}
          {step.thinkingProcess && step.status === StepStatus.COMPLETED && (
             <div className="mt-2 flex items-start gap-2 bg-nexus-900/50 p-2 rounded-lg border border-nexus-700/50">
               <BrainCircuit className="w-3.5 h-3.5 text-nexus-500 mt-0.5" />
               <div className="flex-1">
                 <p className="text-[10px] font-mono uppercase text-nexus-500 mb-0.5">Thinking Process</p>
                 <p className="text-xs text-nexus-300 line-clamp-2 leading-relaxed opacity-80 italic">
                   {step.thinkingProcess}
                 </p>
               </div>
             </div>
          )}
        </div>

        <div className={`
          opacity-0 group-hover:opacity-100 transition-opacity
          ${isActive ? 'opacity-100' : ''}
        `}>
          <button className="p-2 rounded-lg bg-nexus-700 hover:bg-nexus-600 text-white">
            <Play className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
      
      {/* Progress Bar indicator if in progress */}
      {step.status === StepStatus.IN_PROGRESS && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-nexus-900 rounded-b-xl overflow-hidden">
          <div className="h-full bg-nexus-accent animate-pulse-fast w-full origin-left" />
        </div>
      )}
    </div>
  );
};
