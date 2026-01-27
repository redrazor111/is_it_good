import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCbd7emGCABna_-JRAnDBS9ZF31B3bAkG0";
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeImageWithGemini = async (base64Data: string) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      // Force structured output to eliminate parsing errors
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const base64Content = base64Data.includes(",")
      ? base64Data.split(",")[1]
      : base64Data;

    const imagePart = {
      inlineData: { data: base64Content, mimeType: "image/jpeg" },
    };

    const prompt = `
      Analyze the ingredients in the provided image for the following categories:
      1. General Food Safety, 2. Skin Safety, 3. Vegetarian, 4. Vegan, 5. Halal, 6. Alcohol-Free.

      Identify all legible ingredients. For EACH category, assign a status: "SAFE", "CAUTION", or "UNSAFE" and a one-sentence summary.

      Return ONLY a JSON object with this exact structure:
      {
        "food": {"status": "string", "summary": "string"},
        "skin": {"status": "string", "summary": "string"},
        "veg": {"status": "string", "summary": "string"},
        "vegan": {"status": "string", "summary": "string"},
        "halal": {"status": "string", "summary": "string"},
        "alcohol": {"status": "string", "summary": "string"}
      }
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Return a structured error so your JSON.parse doesn't crash the app
    return JSON.stringify({
      food: { status: "UNSAFE", summary: `Error: ${error.message}` },
      skin: { status: "UNSAFE", summary: `Error: ${error.message}` },
      veg: { status: "UNSAFE", summary: `Error: ${error.message}` },
      vegan: { status: "UNSAFE", summary: `Error: ${error.message}` },
      halal: { status: "UNSAFE", summary: `Error: ${error.message}` },
      alcohol: { status: "UNSAFE", summary: `Error: ${error.message}` },
    });
  }
};