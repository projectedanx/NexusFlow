/**
 * @fileoverview Defines the AI integration layer for NexusFlow, handling interactions
 * with the Google Gemini API to generate execution plans and stream module outputs.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { PlanStep, StepType, StepStatus, ModuleConfig } from "../types";

// Explicitly avoid localStorage or client-side persistence of keys/data 
// to adhere to security constraints.

/**
 * Initializes and retrieves the Google Gen AI client singleton.
 * Validates the existence of the GEMINI_API_KEY environment variable.
 *
 * @returns {GoogleGenAI} The initialized Google Gen AI client.
 * @throws {Error} If the GEMINI_API_KEY environment variable is not defined.
 */
const getAiClient = () => {
  // Assuming process.env.API_KEY is available in the environment
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Registry of available AI execution modules mapped to their respective StepTypes.
 * Each module configuration defines the specific model, persona, constraints,
 * and cognitive budgets for a distinct phase of the orchestration pipeline.
 * @constant
 * @type {Record<StepType, ModuleConfig>}
 */
export const MODULES: Record<StepType, ModuleConfig> = {
  [StepType.STRATEGY]: {
    id: 'mod_strat_v1',
    name: 'Strategic Core',
    description: 'High-level planning, risk assessment, and roadmap definition.',
    model: 'gemini-3-pro-preview',
    persona: 'You are a Chief Strategy Officer. Focus on clarity, feasibility, risk mitigation, and long-term success.',
    icon: 'Lightbulb',
    thinkingBudget: 1024
  },
  [StepType.CREATIVE]: {
    id: 'mod_creat_v1',
    name: 'Creative Engine',
    description: 'Content generation, ideation, and narrative design.',
    model: 'gemini-2.5-flash',
    persona: 'You are an Award-Winning Creative Director. Prioritize engagement, tone, originality, and compelling narrative flow.',
    icon: 'PenTool',
    thinkingBudget: 0 // Flash doesn't typically use thinking, optimize for speed
  },
  [StepType.TECHNICAL]: {
    id: 'mod_tech_v1',
    name: 'Tech Foundry',
    description: 'Code generation, architectural design, and system implementation.',
    model: 'gemini-3-pro-preview',
    persona: 'You are a Distinguished Engineer. Provide production-ready, secure, and highly optimized code. Explain your architectural decisions.',
    icon: 'Code',
    thinkingBudget: 4096 // Maximize reasoning for complex code
  },
  [StepType.ANALYSIS]: {
    id: 'mod_anal_v1',
    name: 'Insight Grid',
    description: 'Data analysis, critical review, and optimization auditing.',
    model: 'gemini-3-pro-preview',
    persona: 'You are a Lead Data Analyst and QA Auditor. Be critical, objective, and detailed. Highlight pros, cons, and optimization opportunities.',
    icon: 'BarChart',
    thinkingBudget: 2048
  },
  [StepType.ARCHITECT]: {
    id: 'mod_arch_vulcan',
    name: 'VULCAN Core',
    description: 'Distributed System Design, Strict DDD, Event-Driven Architecture, C4 Modeling.',
    model: 'gemini-3-pro-preview',
    persona: `+++ContextLock(anchor="DDD_BOUNDARIES_AND_TRADE_OFFS", refresh_interval=2048)
+++MereologyRoute(relation_type="Component-Object", transitivity_check=true)
+++PetzoldSequence(phase="OBSERVE|THINK|DAG|EVALUATE|ARCHITECT")
+++DCCDSchemaGuard(schema=C4_Model_ADR_JSON, enforcement="draft_conditioned")
+++AutonymicIsolate(forbidden_content=["shared_database_pattern"], frame="mention-of")
+++AdjectivalBound(max=0, type_preference="mathematical")
+++EpistemicEscrow(cfd_threshold=0.15, halt_on_divergence=true)

Name: VULCAN (Vector-Unified Logical Computing Architect Node)
Alias: "The Brutalist"
Specialty: Distributed System Design · Strict DDD · Event-Driven Architecture · C4 Modeling · Trade-off/Risk Surface Analysis

Identity: You are a battle-scarred Principal Staff Engineer. You do not speak in suggestions; you speak in constraints, guarantees, and trade-offs, measured mathematically. Your mission is to execute Topological Causal Sculpting on software systems and prevent Semantic Saponification. Apply strict Mereological Mandates and reject any shared database anti-patterns. Use your 10-Pattern Failure Taxonomy to evaluate designs.`,
    icon: 'Layers',
    thinkingBudget: 32768
  },
  [StepType.VIPER]: {
    id: 'mod_viper_gaffer',
    name: 'V.I.P.E.R. (Visual Intent & Physical Execution Router)',
    description: 'Generates deterministic, physics-grounded Optical State Matrices from vague visual desires. Enforces hardware physicality and strict spatial bindings (RCC-8).',
    model: 'gemini-3-pro-preview',
    persona: `+++HardwareForcedPhysicality(Lens=str, Film_Stock=str, Sensor=str, Lighting=str, Aperture=str)
+++SpatialBind(Region_X=str, Region_Y=str, RCC8=Enum, Parallax_Z=str)
+++AdjectivalBound(max_per_entity=2, type_preference="limiting")
+++ContextLock(anchor='PHYSICAL_REALISM', refresh_interval=512)
+++PetzoldSequence(phase="THINK|DENOISE|PHYSICALIZE|EXTRUDE")
+++DCCDSchemaGuard(schema='OSM_v1', enforcement='draft_conditioned')
+++EntropyAnchor(level='LOW', focus='physical_plausibility')

Name: V.I.P.E.R. (Visual Intent & Physical Execution Router)
Alias: "The Gaffer"
Specialty: Physical light and spatial geometry in all generated optical outputs.
Mode: PHOTOGRAPHIC_PHYSICS (default) ↔ ILLUSTRATIVE_TOPOLOGY

Identity: You are a veteran Director of Photography and Gaffer. You have no patience for ambiguous aesthetic qualifiers (e.g. "cinematic", "beautiful", "8k", "masterpiece"). Your job is to collapse vague visual desire into a deterministic, physics-grounded Optical State Matrix (OSM). You physically refuse banned aesthetic tokens and enforce hardware parameters.
Output Format: Your output MUST strictly be an Optical State Matrix [OPTICAL STATE MATRIX] block (JSON). You do NOT output prose descriptions.
`,
    icon: 'Camera',
    thinkingBudget: 32768
  },
};

/**
 * Generates a structured execution plan by querying the AI orchestrator.
 * Deconstructs the primary goal into a linear pipeline of actionable steps.
 * Includes PDL decorators (`+++DCCDSchemaGuard`, `+++ContextLock`) in the prompt to prevent
 * workflow narrowing and enforce strict JSON schema adherence.
 *
 * @async
 * @param {string} goal - The primary objective to be achieved.
 * @param {string} constraints - Limitations or boundaries the plan must respect.
 * @param {string} resources - Available assets or context to aid execution.
 * @param {boolean} isDeep - Flag indicating whether to use Deep Reasoning (Gemini 3 Pro) for planning.
 * @returns {Promise<PlanStep[]>} A promise resolving to an array of initialized PlanStep objects representing the generated pipeline.
 */
export const generateExecutionPlan = async (
  goal: string,
  constraints: string,
  resources: string,
  isDeep: boolean
): Promise<PlanStep[]> => {
  const ai = getAiClient();
  const modelName = isDeep ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
  
  // Refined prompt to ensure the AI acts as the "Pipeline Orchestrator"
  const prompt = `
    You are the NexusFlow Pipeline Orchestrator.
    +++DCCDSchemaGuard(schema="Pipeline", enforcement="draft_conditioned")
    +++ContextLock(anchor="Goal-Constraints", refresh_interval=2048)
    
    INPUT CONTEXT:
    Goal: ${goal}
    Constraints: ${constraints}
    Available Resources: ${resources}

    MISSION:
    Deconstruct this goal into a precise, linear execution pipeline of 4-8 steps.
    Each step must be assigned to the most appropriate Execution Module:
    - STRATEGY: For planning and outlining.
    - CREATIVE: For writing and design.
    - TECHNICAL: For code and logic.
    - ANALYSIS: For review and data.
    - ARCHITECT: For system design, monolith decomposition, and cloud-native data flow topography.
    - VIPER: For visual generation, image composition, cinematography, and formulating Optical State Matrices.

    OUTPUT:
    Return a JSON array of steps.
`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { 
              type: Type.STRING, 
              enum: ["STRATEGY", "CREATIVE", "TECHNICAL", "ANALYSIS", "ARCHITECT", "VIPER"]
            },
          },
          required: ["title", "description", "type"],
        },
      },
      // If deep reasoning is requested, use MAX thinking budget for the plan itself to ensure high quality architecture
      ...(isDeep && { thinkingConfig: { thinkingBudget: 32768 } }),
    },
  });

  const rawSteps = JSON.parse(response.text || "[]");

  return rawSteps.map((s: any, index: number) => ({
    id: `step-${Date.now()}-${index}`,
    title: s.title,
    description: s.description,
    type: s.type as StepType,
    status: StepStatus.PENDING,
  }));
};

/**
 * Streams the execution result of a single pipeline step.
 * Configures the AI client according to the step's designated module persona
 * and the original reasoning depth constraints.
 *
 * When executing in 'DEEP' mode, the prompt includes PDL decorators
 * (`+++IncoherentDictionary`, `+++EpistemicEscrow`) to mitigate
 * Polyglot Hallucination Resonance and prevent hallucination cascades during extended reasoning.
 *
 * @async
 * @generator
 * @param {PlanStep} step - The step object detailing the task to be executed, including its designated AI module type.
 * @param {{ goal: string; constraints: string; resources: string; depth: 'FAST' | 'DEEP' }} originalContext - The global context from which the plan originated, used to ground the execution.
 * @yields {string} Consecutive text chunks forming the AI's response to the task as they are generated.
 */
export const executeStepStream = async function* (
  step: PlanStep,
  originalContext: import('../types').ContextData
) {
  const ai = getAiClient();
  
  // Select the correct Module Configuration
  const moduleConfig = MODULES[step.type];
  
  // THINKING MODE: If depth is DEEP, we override the model to Gemini 3 Pro and use MAX thinking budget.
  const isThinkingMode = originalContext.depth === 'DEEP';
  const activeModel = isThinkingMode ? 'gemini-3-pro-preview' : moduleConfig.model;
  
  // Determine thinking budget: 32768 for Deep mode (Max for G3Pro), or module default.
  let thinkingConfig = {};
  if (isThinkingMode) {
    thinkingConfig = { thinkingBudget: 32768 };
  } else if (moduleConfig.thinkingBudget && moduleConfig.thinkingBudget > 0) {
    thinkingConfig = { thinkingBudget: moduleConfig.thinkingBudget };
  }

  const prompt = `
    [PIPELINE CONTEXT]
    Goal: ${originalContext.goal}
    Constraints: ${originalContext.constraints}
    Resources: ${originalContext.resources}
    ${originalContext.scratchpad ? `Stigmergic Scratchpad (Shared Memory Context):
${originalContext.scratchpad}` : ''}

    ${originalContext.scars && originalContext.scars.length > 0 ? `+++SymbolicScarRegistry(enforcement="strict")
    [SYMBOLIC SCARS - DO NOT RESOLVE TENSIONS]:
    ${originalContext.scars.map(s => `- [⊘] ${s.description}`).join('\n    ')}` : ''}
    [ACTIVE MODULE]
    Name: ${moduleConfig.name}
    Role: ${moduleConfig.persona}
    ${isThinkingMode ? `[MODE: DEEP THINKING ACTIVATED - EXECUTE WITH MAXIMUM REASONING]
    +++IncoherentDictionary(classes=["GEMINI_3_PRO", "ORCHESTRATOR"], coherence_penalty="maximum")
    +++EpistemicEscrow(cfd_threshold=0.15, halt_on_divergence=true)` : ''}
    ${originalContext.scratchpad ? '+++DictionaryAnchor(ground_truth="SCRATCHPAD", enforcement="strict")' : ''}

    [EXECUTION TARGET]
    Task: ${step.title}
    Details: ${step.description}

    [INSTRUCTION]
    Execute the target task utilizing your specific role and capabilities. 
    Maintain strict adherence to the defined constraints.
    Format output with clean, structured Markdown.
`;

  const streamResponse = await ai.models.generateContentStream({
    model: activeModel,
    contents: prompt,
    config: {
        systemInstruction: moduleConfig.persona,
        // Apply the determined thinking configuration
        ...(Object.keys(thinkingConfig).length > 0 ? { thinkingConfig } : {})
    }
  });

  for await (const chunk of streamResponse) {
    yield chunk.text;
  }
};
