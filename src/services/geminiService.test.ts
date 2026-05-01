import { describe, it, expect, vi } from 'vitest';
import { executeStepStream, MODULES } from './geminiService';
import { PlanStep, StepStatus, StepType, ContextData } from '../types';

// Mock the Google Gen AI client correctly
vi.mock('@google/genai', () => {
  const MockGoogleGenAI = vi.fn(function() {
    this.models = {
      generateContentStream: vi.fn().mockResolvedValue(
        (async function* () {
          yield { text: 'Test response' };
        })()
      ),
    };
  });
  return {
    GoogleGenAI: MockGoogleGenAI,
    Type: {
      ARRAY: 'ARRAY',
      OBJECT: 'OBJECT',
      STRING: 'STRING'
    }
  };
});

describe('geminiService', () => {
  describe('executeStepStream', () => {
    it('injects Symbolic Scars into the prompt when present', async () => {
      // Temporarily set API_KEY for the test
      process.env.API_KEY = 'test_key';

      const step: PlanStep = {
        id: 'test-1',
        title: 'Test Step',
        description: 'Test Description',
        type: StepType.STRATEGY,
        status: StepStatus.PENDING,
      };

      const context: ContextData = {
        goal: 'Test Goal',
        constraints: 'None',
        resources: 'None',
        depth: 'DEEP',
        scars: [
          { id: 'scar-1', description: 'User prefers slow but accurate over fast but inaccurate.', timestamp: 123 }
        ]
      };

      const generator = executeStepStream(step, context);
      for await (const _ of generator) {} // Consume the generator to trigger the API call

      const { GoogleGenAI } = await import('@google/genai');
      // The mock constructor itself is called, and the instance properties are setup there.
      // We need to retrieve the mock instance created.
      const mockInstance = vi.mocked(GoogleGenAI).mock.results[0].value;
      const generateContentStreamSpy = mockInstance.models.generateContentStream;

      const callArgs = generateContentStreamSpy.mock.calls[0][0];
      const prompt = callArgs.contents;

      expect(prompt).toContain('+++SymbolicScarRegistry(enforcement="strict")');
      expect(prompt).toContain('User prefers slow but accurate over fast but inaccurate.');
    });
  });
});
