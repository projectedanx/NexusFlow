/**
 * @fileoverview Defines the StepExecutor component, which provides the primary workspace
 * for running and reviewing the output of individual AI module steps.
 */

import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { PlanStep, StepStatus, StepType } from '../types';
import { Play, RotateCcw, Copy, Check, Cpu, BrainCircuit, Activity, PlusSquare } from 'lucide-react';
import { MODULES } from '../services/geminiService';

/**
 * Props for the StepExecutor component.
 *
 * @interface StepExecutorProps
 * @property {PlanStep} step - The currently selected execution step to be processed or reviewed.
 * @property {(step: PlanStep) => void} onExecute - Callback fired to trigger the AI execution pipeline for this step.
 * @property {boolean} isExecuting - Flag indicating whether the AI is currently generating a response for this step.
 */
interface StepExecutorProps {
  step: PlanStep;
  onExecute: (step: PlanStep) => void;
  isExecuting: boolean;
  onAppendToScratchpad?: (text: string) => void;
  onMarkAsScar?: (text: string) => void;
}

/**
 * A functional React component representing the main execution workspace.
 * Displays module telemetry, execution controls, and a Markdown-rendered output stream.
 *
 * @component
 * @param {StepExecutorProps} props - The properties passed to the component.
 * @returns {React.JSX.Element} The rendered execution interface.
 */
export const StepExecutor: React.FC<StepExecutorProps> = ({ step, onExecute, isExecuting, onAppendToScratchpad }) => {
  const [copied, setCopied] = React.useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const activeModule = MODULES[step.type];

  // Auto-scroll to bottom during generation
  useEffect(() => {
    if (isExecuting && resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [step.result, isExecuting]);

  /**
   * Handles copying the generated AI result to the system clipboard.
   * Briefly shows a success state to the user.
   */
  const handleCopy = () => {
    if (step.result) {
      navigator.clipboard.writeText(step.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col bg-nexus-800 rounded-2xl border border-nexus-700 overflow-hidden shadow-2xl">
      {/* Module Header - Shows which "Component" is running */}
      <div className="p-6 border-b border-nexus-700 bg-gradient-to-r from-nexus-800 to-nexus-900">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border ${
                    step.type === StepType.TECHNICAL ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' :
                    step.type === StepType.CREATIVE ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' :
                    step.type === StepType.STRATEGY ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' :
                    'bg-blue-500/10 border-blue-500/50 text-blue-400'
                }`}>
                    {activeModule.name} Module
                </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{step.title}</h2>
            <p className="text-nexus-400 text-sm leading-relaxed">{step.description}</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onExecute(step)}
              disabled={isExecuting}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${isExecuting 
                  ? 'bg-nexus-700 text-nexus-400 cursor-not-allowed' 
                  : 'bg-nexus-accent hover:bg-nexus-accentHover text-white shadow-lg shadow-blue-500/20'}
              `}
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  {step.status === StepStatus.COMPLETED ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  {step.status === StepStatus.COMPLETED ? 'Re-run' : 'Execute'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Module Telemetry Bar */}
        <div className="flex items-center gap-4 p-3 bg-nexus-900/50 rounded-lg border border-nexus-700/50">
            <div className="flex items-center gap-2 text-xs text-nexus-300">
                <Cpu className="w-3.5 h-3.5 text-nexus-500" />
                <span className="font-mono">{activeModule.model}</span>
            </div>
            <div className="w-px h-3 bg-nexus-700" />
            <div className="flex items-center gap-2 text-xs text-nexus-300">
                <BrainCircuit className="w-3.5 h-3.5 text-nexus-500" />
                <span className="font-mono">Thinking Budget: {activeModule.thinkingBudget}</span>
            </div>
             <div className="w-px h-3 bg-nexus-700" />
            <div className="flex items-center gap-2 text-xs text-nexus-300 truncate max-w-[200px]" title={activeModule.persona}>
                <Activity className="w-3.5 h-3.5 text-nexus-500" />
                <span className="truncate opacity-80">{activeModule.description}</span>
            </div>
        </div>
      </div>

      {/* Result Area */}
      <div className="flex-1 relative bg-nexus-900/50">
        {!step.result && step.status !== StepStatus.IN_PROGRESS ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-nexus-500 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-nexus-800 flex items-center justify-center mb-4 border border-nexus-700">
              <Play className="w-8 h-8 opacity-50 ml-1" />
            </div>
            <p className="text-lg font-medium mb-1 text-nexus-300">Ready to Initialize {activeModule.name}</p>
            <p className="text-sm opacity-60 max-w-sm">
              Click Execute to trigger the {activeModule.model} pipeline with a {activeModule.thinkingBudget} token reasoning budget.
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-nexus-900 border-b border-nexus-700">
              <span className="text-xs font-mono text-nexus-400 uppercase tracking-wider flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${isExecuting ? 'bg-emerald-500 animate-pulse' : 'bg-nexus-600'}`} />
                 Output Stream
              </span>
              <div className="flex items-center gap-2">
                {onAppendToScratchpad && step.result && (
                  <button
                    onClick={() => onAppendToScratchpad(step.result!)}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                    title="Append to Stigmergic Scratchpad"
                  >
                    <PlusSquare className="w-3.5 h-3.5" />
                    Append to Scratchpad
                  </button>
                )}
                {onMarkAsScar && step.result && (
                  <button
                    onClick={() => onMarkAsScar(step.result!)}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                    title="Mark as Symbolic Scar [⊘]"
                  >
                    <PlusSquare className="w-3.5 h-3.5" />
                    Mark Scar [⊘]
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded hover:bg-nexus-700 text-nexus-400 hover:text-white transition-colors"
                  title="Copy output"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div 
              ref={resultRef}
              className="flex-1 overflow-y-auto p-6 font-mono text-sm text-nexus-200 scroll-smooth"
            >
               <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mb-4 mt-6 border-b border-nexus-700 pb-2" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-white mb-3 mt-5" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-white mb-2 mt-4" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                    code: ({node, inline, className, children, ...props}: any) => {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline ? (
                        <div className="my-4 rounded-lg overflow-hidden border border-nexus-700 bg-nexus-950">
                          <div className="bg-nexus-900/50 px-4 py-1 text-xs text-nexus-400 border-b border-nexus-800 font-mono">
                            {match ? match[1] : 'code'}
                          </div>
                          <code className="block p-4 overflow-x-auto" {...props}>
                            {children}
                          </code>
                        </div>
                      ) : (
                        <code className="bg-nexus-800 px-1.5 py-0.5 rounded text-nexus-200 border border-nexus-700" {...props}>
                          {children}
                        </code>
                      )
                    },
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-nexus-500 pl-4 py-1 my-4 bg-nexus-800/30 rounded-r" {...props} />,
                  }}
                >
                  {step.result || ''}
                </ReactMarkdown>
                {isExecuting && (
                  <div className="inline-block w-2 h-4 bg-nexus-accent ml-1 animate-pulse align-middle" />
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
