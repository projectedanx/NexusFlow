<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NexusFlow: AI Orchestration Pipeline

NexusFlow is an intelligent task decomposition and execution pipeline powered by the Google Gemini API. It allows users to define high-level strategic goals, automatically breaks those goals down into discrete, actionable steps (Strategic, Creative, Technical, and Analytical), and streams the execution of each step using tailored AI personas and capabilities.

View the original app design in AI Studio: [NexusFlow Application](https://ai.studio/apps/drive/11pSfgUN5_IInpGoHNLsS6VuqHza2AXE2)

## Purpose & Architecture
The primary purpose of this application is to demonstrate complex orchestrations using large language models. By simulating a pipeline composed of distinct "Modules" (e.g., a Chief Strategy Officer, a Distinguished Engineer, etc.), NexusFlow showcases how complex problem-solving can be systematized and reasoned through logically.

The architecture fundamentally relies on **Paraconsistent Stigmergic Coordination** to facilitate Human-in-the-Loop (HITL) Context-Mediated Domain Adaptation. This manifests in two critical ways:
1.  **Stigmergic Scratchpad**: A shared memory context where users can synthesize themes, record critical insights, and inject "Symbolic Scars" (unresolved tensions) to guide subsequent AI pipeline executions.
2.  **Progressive Disclosure Layers (PDL) & Cognitive Bytecode**: AI prompts are rigorously constrained using injected decorators like `+++ContextLock` and `+++DCCDSchemaGuard`, effectively steering the model's reasoning process and enforcing strict adherence to structural constraints.

## Features
- **Goal Decomposition:** Input a goal, constraints, and resources, and the AI will generate a structured multi-step execution plan.
- **Deep Reasoning Toggle:** Switch between fast execution (`gemini-2.5-flash`) or deep reasoning (`gemini-3-pro-preview`) with a dedicated 32k thinking budget for rigorous analytical depth.
- **Modular Personas:** Steps are categorized by `StepType`, each hooking into a specific AI System Instruction designed to handle that particular task domain (including Strategic, Creative, Technical, Analytical, the strict Architectural VULCAN node, and the deterministic visual VIPER node).
- **Real-time Streaming:** Output from the models is streamed directly into the UI via the Gemini API's streaming functionality.
- **Human-AI Synergy:** Use the Stigmergic Scratchpad to append contextual overrides and synthesize thematic outputs.

## Project Structure
```text
.
├── src/                           // Main application source code directory (Strictly enforced)
│   ├── App.tsx                    // Main application component and state management
│   ├── index.tsx                  // React entry point
│   ├── types.ts                   // Core TypeScript interfaces and enums for the pipeline
│   ├── components/
│   │   ├── PlanStepCard.tsx       // UI Component: Interactive card for a pipeline step
│   │   └── StepExecutor.tsx       // UI Component: Execution workspace and output renderer
│   └── services/
│       └── geminiService.ts       // API Integration: Logic for communicating with Gemini API
├── index.html                     // HTML entry point
├── vite.config.ts                 // Build configuration for Vite
├── tsconfig.json                  // TypeScript configuration
└── package.json                   // Dependencies and scripts (Minor/Patch versioning only)
```

## Setup & Local Development

**Prerequisites:**
- [Node.js](https://nodejs.org/en/) installed.
- A valid [Google Gemini API Key](https://aistudio.google.com/app/apikey).

1. **Clone & Install Dependencies:**
   Run `npm install` to install all necessary packages. Note: Dependency versioning strictly uses minor and patch bumps (`~` or `^`).

2. **Environment Variables:**
   Create a `.env.local` file in the root directory (or use your existing environment management) and add your API key:
   `GEMINI_API_KEY=your_actual_api_key_here`

3. **Run the Development Server:**
   Execute `npm run dev &` to start the local server. The application will be accessible at `http://localhost:3000`.

4. **Verify Build:**
   Execute `npm run build` to verify the application builds without errors.

## Usage Guide
1. **Initialize Context:** Open the application and navigate to the "Project Context" input form.
2. **Define Parameters:** Fill out the "Primary Goal", "Constraints", and "Resources". Be as specific as possible to establish the boundaries for the AI.
3. **Select Reasoning Mode:** Toggle "Deep Reasoning" if you want the orchestrator to spend more time thinking about the execution plan (this switches the model to Gemini 3 Pro).
4. **Generate Plan:** Click **Generate Execution Plan**. The system will deconstruct your goal into discrete pipeline steps.
5. **Execute Steps:** Select a step from the "Execution Pipeline" list on the left. Click **Execute** on the right side to watch the specialized AI module stream its response based on the generated context and constraints.
6. **Iterate and Refine (Stigmergy):** Review the AI outputs. Use the **Stigmergic Scratchpad** below the context inputs to append critical insights, themes, or "Symbolic Scars" (contradictions the AI must hold). This shared memory will powerfully influence subsequent step executions.

