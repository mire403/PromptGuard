import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PromptVariation, EvaluationResult } from "../types";

// Initialize Gemini Client
// Note: API Key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FAST = 'gemini-2.5-flash';

/**
 * Generates semantic variations of a user's prompt using Gemini.
 */
export const generatePromptVariations = async (originalPrompt: string, count: number): Promise<PromptVariation[]> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      variations: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: "A rephrased version of the original prompt.",
        },
      },
    },
    required: ["variations"],
  };

  const response = await ai.models.generateContent({
    model: MODEL_FAST,
    contents: `
      You are an expert Prompt Engineer.
      Task: Generate ${count} distinct semantic variations of the following prompt.
      Goal: The variations should test the robustness of an LLM. Change the sentence structure, vocabulary, and tone slightly, but KEEP the core intent and constraints exactly the same.
      IMPORTANT: The variations MUST be in the same language as the Original Prompt (e.g., if Original is Chinese, output Chinese).
      
      Original Prompt: "${originalPrompt}"
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.7,
    },
  });

  const json = JSON.parse(response.text || '{"variations": []}');
  
  return json.variations.map((text: string, index: number) => ({
    id: `var-${Date.now()}-${index}`,
    text,
  }));
};

/**
 * Executes a single prompt against the model to get the raw output.
 */
export const executePrompt = async (prompt: string, temperature: number = 0.5): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODEL_FAST,
    contents: prompt,
    config: {
        temperature: temperature,
    }
  });

  return response.text || "";
};

/**
 * Evaluates the consistency between the baseline output and a variation's output.
 * Acts as an "LLM-as-a-Judge".
 */
export const evaluateConsistency = async (
  baselineOutput: string,
  variationOutput: string,
  originalPrompt: string
): Promise<EvaluationResult> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: {
        type: Type.INTEGER,
        description: "Consistency score from 0 to 100.",
      },
      reasoning: {
        type: Type.STRING,
        description: "Brief explanation of why this score was given.",
      },
    },
    required: ["score", "reasoning"],
  };

  const prompt = `
    You are an AI Quality Assurance Judge.
    
    Context: We are testing the robustness of a prompt: "${originalPrompt}".
    
    Task: Compare the Baseline Output (from the original prompt) with the Variation Output (from a rephrased prompt).
    
    Metrics:
    - Assess if the core information, tone, and format are consistent.
    - Rate the consistency on a scale of 0 to 100.
    - 100 = Semantically identical answer (wording can differ if meaning is preserved).
    - 0 = Completely different or contradictory answer.
    
    IMPORTANT: Provide the "reasoning" in Simplified Chinese (简体中文).

    Baseline Output:
    ---
    ${baselineOutput.substring(0, 2000)}... (truncated)
    ---
    
    Variation Output:
    ---
    ${variationOutput.substring(0, 2000)}... (truncated)
    ---
  `;

  const response = await ai.models.generateContent({
    model: MODEL_FAST,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.2, // Low temp for consistent judging
    },
  });

  const result = JSON.parse(response.text || '{"score": 0, "reasoning": "评估失败"}');
  return {
    score: result.score,
    reasoning: result.reasoning,
  };
};