import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCbd7emGCABna_-JRAnDBS9ZF31B3bAkG0";
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeImageWithGemini = async (base64Data: string, type: 'food' | 'skin' | 'veg' | 'vegan' | 'halal' | 'alcohol') => {
  try {
    // Note: Use Gemini 3 Flash for speed and high context
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      // Force structured output to eliminate parsing errors
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const imagePart = {
      inlineData: { data: base64Data, mimeType: "image/jpeg" },
    };

    // Use Structured Prompting with XML tags for better reasoning
    let task = "Analyze the ingredients in the provided image for ${type.toUpperCase()} safety."
    if (type.toUpperCase() === 'food') {
      task = "Analyze the ingredients in the provided image to check it is safe to eat and drink."
    } else if (type.toUpperCase() === 'skin') {
      task = "Analyze the ingredients in the provided image to check it is safe to apply to skin."
    } else if (type.toUpperCase() === 'veg') {
      task = "Analyze the ingredients in the provided image to check it is Vegetarian."
    } else if (type.toUpperCase() === 'vegan') {
      task = "Analyze the ingredients in the provided image to check it is Vegan."
    } else if (type.toUpperCase() === 'halal') {
      task = "Analyze the ingredients in the provided image to check it is Halal."
    } else if (type.toUpperCase() === 'alcohol') {
      task = "Analyze the ingredients in the provided image to check it is Alcohol Free."
    }

    const prompt = `
      <task>
        ${task}
      </task>
      <constraints>
        1. Identify all legible ingredients.
        2. Assign a safety status: "SAFE", "CAUTION", or "UNSAFE".
        3. Provide a one-sentence summary explaining the rating.
      </constraints>
      <output_format>
        Return ONLY a JSON object:
        {"status": "SAFE" | "CAUTION" | "UNSAFE", "summary": "string"}
      </output_format>
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    // Now you just JSON.parse(response.text()) in your App.tsx!
    return response.text();
  } catch (error: any) {
    return JSON.stringify({ status: "UNSAFE", summary: `Error: ${error.message}` });
  }
};