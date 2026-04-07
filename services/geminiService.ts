/**
 * @fileoverview Defines the AI integration layer for NexusFlow, handling interactions
 * with the Google Gemini API to generate execution plans and stream module outputs.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { PlanStep, StepType, StepStatus, ModuleConfig } from "../types";

// Explicitly avoid localStorage or client-side persistence of keys/data 
// to adhere to security constraints.

/**
 * Initializes and returns an instance of the Google Gen AI client.
 * Relies on the `API_KEY` environment variable being set in the process.
 *
 * @returns {GoogleGenAI} An authenticated instance of the Google Gen AI client.
 * @throws {Error} If the API_KEY environment variable is missing or undefined.
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
 * Defines the "Modular Components" of the execution pipeline.
 * Each module acts as a specialized AI agent with a specific persona, model,
 * and cognitive budget tailored to its domain (Strategy, Creative, Technical, Analysis).
 *
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
  }
};

/**
 * Generates a structured execution plan by querying the AI orchestrator.
 * Deconstructs the primary goal into a linear pipeline of actionable steps.
 *
 * @async
 * @param {string} goal - The primary objective to be achieved.
 * @param {string} constraints - Limitations or boundaries the plan must respect.
 * @param {string} resources - Available assets or context to aid execution.
 * @param {boolean} isDeep - Flag indicating whether to use Deep Reasoning (Gemini 3 Pro) for planning.
 * @returns {Promise<PlanStep[]>} A promise resolving to an array of initialized PlanStep objects.
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
              enum: ["STRATEGY", "CREATIVE", "TECHNICAL", "ANALYSIS"] 
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
 * @async
 * @generator
 * @param {PlanStep} step - The step object detailing the task to be executed.
 * @param {{ goal: string; constraints: string; resources: string; depth: 'FAST' | 'DEEP' }} originalContext - The global context from which the plan originated.
 * @yields {string} Consecutive text chunks forming the AI's response to the task.
 */
export const executeStepStream = async function* (
  step: PlanStep,
  originalContext: { goal: string; constraints: string; resources: string; depth: 'FAST' | 'DEEP' }
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

    [ACTIVE MODULE]
    Name: ${moduleConfig.name}
    Role: ${moduleConfig.persona}
    ${isThinkingMode ? '[MODE: DEEP THINKING ACTIVATED - EXECUTE WITH MAXIMUM REASONING]' : ''}

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
