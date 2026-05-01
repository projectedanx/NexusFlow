/**
 * @fileoverview Main Application component for NexusFlow.
 * Handles state management for the execution pipeline, user context, and UI routing/rendering.
 */
import React, { useState } from 'react';
import { Boxes, Zap, ArrowRight, Loader2, Sparkles, CheckCircle2, Circle } from 'lucide-react';
import { PlanStepCard } from './components/PlanStepCard';
import { StepExecutor } from './components/StepExecutor';
import { PlanStep, StepStatus, ContextData, PipelineStage } from './types';
import { generateExecutionPlan, executeStepStream } from './services/geminiService';

/**
 * The primary root component of the NexusFlow application.
 * Manages the global state of the project context, generated execution steps,
 * and tracks the currently active/executing pipeline modules.
 *
 * @component
 * @returns {React.JSX.Element} The completely rendered App structure.
 */
const App: React.FC = () => {
  // State for Context Input
  const [context, setContext] = useState<ContextData>({
    goal: '',
    constraints: '',
    resources: '',
    depth: 'FAST',
    scratchpad: '',
    scars: [],
  });

  // Application State
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>(PipelineStage.INPUT);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [steps, setSteps] = useState<PlanStep[]>([]);
  const [isExecutingStep, setIsExecutingStep] = useState(false);

  // Derived state
  const activeStep = steps.find(s => s.id === activeStepId);

  /**
   * Updates a specific field within the global context state.
   *
   * @param {keyof ContextData} field - The key of the context data being updated.
   * @param {string} value - The new value to set.
   */
  const handleContextChange = (field: keyof ContextData, value: string) => {
    setContext(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Submits the current user context to the AI Orchestrator to generate
   * a structured execution plan. Updates state with the resulting steps.
   *
   * @async
   */
  const handleGeneratePlan = async () => {
    if (!context.goal.trim()) return;
    
    setIsGeneratingPlan(true);
    setPipelineStage(PipelineStage.PLANNING);
    try {
      const generatedSteps = await generateExecutionPlan(
        context.goal,
        context.constraints,
        context.resources,
        context.depth === 'DEEP'
      );
      setSteps(generatedSteps);
      if (generatedSteps.length > 0) {
        setActiveStepId(generatedSteps[0].id);
        setPipelineStage(PipelineStage.EXECUTION);
      }
    } catch (error) {
      console.error("Plan generation failed:", error);
      alert("Failed to generate plan. Please check your API key and try again.");
      setPipelineStage(PipelineStage.INPUT);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  /**
   * Triggers the AI stream execution for a specific plan step.
   * Streams chunks of data back into the step's result state.
   *
   * @async
   * @param {PlanStep} step - The specific step object to execute.
   */

  const handleMarkAsScar = (text: string) => {
    setContext(prev => ({
      ...prev,
      scars: [...(prev.scars || []), {
        id: `scar-${Date.now()}`,
        description: text.substring(0, 150) + (text.length > 150 ? '...' : ''), // truncate for summary
        timestamp: Date.now()
      }]
    }));
  };

  const handleAppendToScratchpad = (text: string) => {
    setContext(prev => ({
      ...prev,
      scratchpad: prev.scratchpad ? `${prev.scratchpad}\n\n${text}` : text
    }));
  };

  const handleExecuteStep = async (step: PlanStep) => {
    if (isExecutingStep) return;

    setIsExecutingStep(true);
    
    // Reset result if re-running
    setSteps(prev => prev.map(s => s.id === step.id ? { ...s, result: '', status: StepStatus.IN_PROGRESS } : s));

    try {
      const stream = executeStepStream(step, {
        goal: context.goal,
        constraints: context.constraints,
        resources: context.resources,
        depth: context.depth
      });

      let fullResult = '';
      
      for await (const chunk of stream) {
        fullResult += chunk;
        setSteps(prev => prev.map(s => 
          s.id === step.id ? { ...s, result: fullResult } : s
        ));
      }

      setSteps(prev => prev.map(s => 
        s.id === step.id ? { ...s, status: StepStatus.COMPLETED } : s
      ));

    } catch (error) {
      console.error("Execution failed:", error);
      setSteps(prev => prev.map(s => 
        s.id === step.id ? { ...s, status: StepStatus.FAILED, result: s.result + '\n\n**Execution Failed**' } : s
      ));
    } finally {
      setIsExecutingStep(false);
    }
  };

  /**
   * Resets the entire application state back to the initial input phase.
   */
  const resetPipeline = () => {
    setSteps([]);
    setActiveStepId(null);
    setContext(prev => ({ ...prev, goal: '' }));
    setPipelineStage(PipelineStage.INPUT);
  };

  // Pipeline Progress Component
  /**
   * Renders the visual timeline indicator showing current application phase.
   *
   * @returns {React.JSX.Element} The progress bar component.
   */
  const PipelineProgress = () => (
    <div className="flex items-center gap-4 text-sm font-medium mb-6 px-4">
      <div className={`flex items-center gap-2 ${pipelineStage === PipelineStage.INPUT ? 'text-nexus-accent' : 'text-nexus-300'}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${pipelineStage === PipelineStage.INPUT ? 'border-nexus-accent bg-nexus-accent/10' : 'border-nexus-600'}`}>
           <span className="text-xs">1</span>
        </div>
        Context
      </div>
      <div className="w-8 h-px bg-nexus-700" />
      <div className={`flex items-center gap-2 ${pipelineStage === PipelineStage.PLANNING ? 'text-nexus-accent' : (pipelineStage === PipelineStage.EXECUTION ? 'text-nexus-300' : 'text-nexus-600')}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${pipelineStage === PipelineStage.PLANNING ? 'border-nexus-accent animate-pulse' : (pipelineStage === PipelineStage.EXECUTION ? 'border-nexus-600' : 'border-nexus-700 text-nexus-700')}`}>
           <span className="text-xs">2</span>
        </div>
        Planning
      </div>
      <div className="w-8 h-px bg-nexus-700" />
      <div className={`flex items-center gap-2 ${pipelineStage === PipelineStage.EXECUTION ? 'text-nexus-accent' : 'text-nexus-600'}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${pipelineStage === PipelineStage.EXECUTION ? 'border-nexus-accent bg-nexus-accent/10' : 'border-nexus-700 text-nexus-700'}`}>
           <span className="text-xs">3</span>
        </div>
        Execution
      </div>
    </div>
  );

  const hasPlan = steps.length > 0;

  return (
    <div className="min-h-screen bg-nexus-900 text-nexus-100 flex flex-col">
      {/* Navbar */}
      <header className="h-16 border-b border-nexus-800 bg-nexus-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-nexus-accent to-purple-500 rounded-lg flex items-center justify-center">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Nexus<span className="text-nexus-400">Flow</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs font-mono text-nexus-500 border border-nexus-800 px-2 py-1 rounded">
               gemini-2.5-flash / gemini-3-pro
             </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 flex flex-col gap-6 overflow-hidden">
        
        {/* Pipeline Visualizer */}
        <div className="w-full flex justify-center">
            <PipelineProgress />
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Left Column: Context & Plan List */}
            <div className={`
            flex flex-col gap-6 transition-all duration-500 ease-in-out
            ${hasPlan ? 'w-1/3 min-w-[320px]' : 'w-full max-w-2xl mx-auto'}
            `}>
            
            {/* Input Section */}
            <div className={`
                bg-nexus-800 rounded-2xl p-6 border border-nexus-700 shadow-xl transition-all duration-500
                ${hasPlan ? 'h-auto' : 'flex-1'}
            `}>
                <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-nexus-accent" />
                <h2 className="text-lg font-semibold text-white">Project Context</h2>
                </div>
                
                <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-nexus-400 mb-1.5 uppercase tracking-wide">Primary Goal</label>
                    <textarea 
                    className="w-full bg-nexus-900 border border-nexus-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-nexus-accent focus:border-transparent outline-none transition-all placeholder:text-nexus-600"
                    rows={hasPlan ? 2 : 3}
                    placeholder="e.g., Create a marketing campaign for a new organic coffee brand..."
                    value={context.goal}
                    onChange={(e) => handleContextChange('goal', e.target.value)}
                    disabled={hasPlan}
                    />
                </div>

                {!hasPlan && (
                    <>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-xs font-medium text-nexus-400 mb-1.5 uppercase tracking-wide">Constraints</label>
                        <textarea 
                            className="w-full bg-nexus-900 border border-nexus-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-nexus-accent focus:border-transparent outline-none transition-all placeholder:text-nexus-600"
                            rows={3}
                            placeholder="e.g., Budget under $500, no paid ads..."
                            value={context.constraints}
                            onChange={(e) => handleContextChange('constraints', e.target.value)}
                        />
                        </div>
                        <div>
                        <label className="block text-xs font-medium text-nexus-400 mb-1.5 uppercase tracking-wide">Resources</label>
                        <textarea 
                            className="w-full bg-nexus-900 border border-nexus-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-nexus-accent focus:border-transparent outline-none transition-all placeholder:text-nexus-600"
                            rows={3}
                            placeholder="e.g., Logo assets, existing blog content..."
                            value={context.resources}
                            onChange={(e) => handleContextChange('resources', e.target.value)}
                        />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`
                            w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out
                            ${context.depth === 'DEEP' ? 'bg-purple-600' : 'bg-nexus-700'}
                            `}>
                            <div className={`
                                w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200
                                ${context.depth === 'DEEP' ? 'translate-x-4' : 'translate-x-0'}
                            `} />
                            </div>
                            <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={context.depth === 'DEEP'}
                            onChange={(e) => handleContextChange('depth', e.target.checked ? 'DEEP' : 'FAST')} 
                            />
                            <span className="text-sm font-medium text-nexus-300 group-hover:text-white transition-colors">
                            Deep Reasoning
                            </span>
                        </label>
                        {context.depth === 'DEEP' && (
                            <span className="text-xs text-purple-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Uses Gemini 3 Pro
                            </span>
                        )}
                        </div>
                    </div>
                    </>
                )}

                {!hasPlan && (
                    <button
                    onClick={handleGeneratePlan}
                    disabled={!context.goal.trim() || isGeneratingPlan}
                    className={`
                        w-full py-3 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all
                        ${!context.goal.trim() || isGeneratingPlan 
                        ? 'bg-nexus-700 text-nexus-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-nexus-accent to-blue-600 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-900/20 transform hover:-translate-y-0.5'}
                    `}
                    >
                    {isGeneratingPlan ? (
                        <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing Context...
                        </>
                    ) : (
                        <>
                        Generate Execution Plan
                        <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                    </button>
                )}
                </div>
            </div>

            {/* Stigmergic Scratchpad (Human-AI Shared Memory) */}
            {hasPlan && (
              <div className="bg-nexus-800 rounded-2xl p-4 border border-nexus-700 shadow-xl mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 text-purple-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>
                  </div>
                  <h3 className="text-sm font-semibold text-white">Stigmergic Scratchpad</h3>
                </div>
                <p className="text-xs text-nexus-400 mb-3 leading-relaxed">
                  Reflexive Thematic Synthesis area. Review AI outputs and append critical insights or "Symbolic Scars" here to guide subsequent pipeline steps.
                </p>
                <textarea
                  className="w-full bg-nexus-900 border border-nexus-700 rounded-lg p-3 text-sm text-nexus-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all custom-scrollbar placeholder:text-nexus-600/50"
                  rows={4}
                  placeholder="Shared memory context... AI will be strictly anchored to constraints defined here."
                  value={context.scratchpad}
                  onChange={(e) => handleContextChange('scratchpad', e.target.value)}
                />
              </div>
            )}


            {/* Scar Tissue Archive */}
            {hasPlan && context.scars && context.scars.length > 0 && (
              <div className="bg-nexus-900 rounded-2xl p-4 border border-red-500/30 shadow-xl mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                  </div>
                  <h3 className="text-sm font-semibold text-red-400">Symbolic Scar Archive [⊘]</h3>
                </div>
                <p className="text-xs text-nexus-400 mb-3 leading-relaxed">
                  Unresolved tensions and contradictions. The orchestrator must hold these in superposition (Φ) without attempting normalization.
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {context.scars.map(scar => (
                    <div key={scar.id} className="bg-nexus-950 border border-red-900/50 p-2 rounded text-xs text-nexus-300 font-mono flex items-start gap-2">
                       <span className="text-red-500 mt-0.5">[⊘]</span>
                       <span className="break-all">{scar.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plan List (Only visible after generation) */}
            {hasPlan && (
                <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-sm font-semibold text-nexus-300 uppercase tracking-wider">Execution Pipeline</h3>
                    <button 
                    onClick={resetPipeline}
                    className="text-xs text-nexus-500 hover:text-nexus-300 underline"
                    >
                    New Pipeline
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {steps.map((step) => (
                    <PlanStepCard
                        key={step.id}
                        step={step}
                        isActive={activeStepId === step.id}
                        onSelect={(s) => setActiveStepId(s.id)}
                    />
                    ))}
                </div>
                </div>
            )}
            </div>

            {/* Right Column: Execution Area (Only visible after generation) */}
            {hasPlan && activeStep && (
            <div className="flex-1 min-w-0 transition-opacity duration-500 animate-in fade-in slide-in-from-right-4">
                <StepExecutor
                step={activeStep}
                onExecute={handleExecuteStep}
                isExecuting={isExecutingStep && activeStepId === activeStep.id}
                onAppendToScratchpad={handleAppendToScratchpad}
                onMarkAsScar={handleMarkAsScar}
                />
            </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default App;