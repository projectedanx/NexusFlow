<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NexusFlow: AI Orchestration Pipeline

NexusFlow is an intelligent task decomposition and execution pipeline powered by the Google Gemini API. It allows users to define high-level strategic goals, automatically breaks those goals down into discrete, actionable steps (Strategic, Creative, Technical, and Analytical), and streams the execution of each step using tailored AI personas and capabilities.

View the original app design in AI Studio: [NexusFlow Application](https://ai.studio/apps/drive/11pSfgUN5_IInpGoHNLsS6VuqHza2AXE2)

## Purpose
The primary purpose of this application is to demonstrate complex orchestrations using large language models. By simulating a pipeline composed of distinct "Modules" (e.g., a Chief Strategy Officer, a Distinguished Engineer, etc.), NexusFlow showcases how complex problem-solving can be systematized and reasoned through logically.

## Features
- **Goal Decomposition:** Input a goal, constraints, and resources, and the AI will generate a structured multi-step execution plan.
- **Deep Reasoning Toggle:** Switch between fast execution (`gemini-2.5-flash`) or deep reasoning (`gemini-3-pro-preview`) with a dedicated 32k thinking budget.
- **Modular Personas:** Steps are categorized by `StepType`, each hooking into a specific AI System Instruction designed to handle that particular task domain (including Strategic, Creative, Technical, Analytical, the strict Architectural VULCAN node, and the deterministic visual VIPER node).
- **Real-time Streaming:** Output from the models is streamed directly into the UI via the Gemini API's streaming functionality.

## Project Structure
```text
.
├── src/                           // Main source code directory
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
└── package.json                   // Dependencies and scripts
```

## Setup & Local Development

**Prerequisites:**
- [Node.js](https://nodejs.org/en/) installed.
- A valid [Google Gemini API Key](https://aistudio.google.com/app/apikey).

1. **Clone & Install Dependencies:**
   `npm install`

2. **Environment Variables:**
   Create a `.env.local` file in the root directory (or use your existing environment management) and add your API key:
   `GEMINI_API_KEY=your_actual_api_key_here`

3. **Run the Development Server:**
   Run the dev command: `npm run dev &`
   The application will start, usually accessible at `http://localhost:3000`.

## Usage
1. Open the application. You will be presented with the "Project Context" input form.
2. Fill out the "Primary Goal", "Constraints", and "Resources".
3. Toggle "Deep Reasoning" if you want the orchestrator to spend more time thinking about the execution plan (this switches the model to Gemini 3 Pro).
4. Click **Generate Execution Plan**.
5. Once generated, select a step from the "Execution Pipeline" list on the left.
6. Click **Execute** on the right side to watch the specialized AI module stream its response based on the generated context and constraints.
