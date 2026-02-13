// api/analyze.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  maxDuration: 30, // Gemini can take a few seconds
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle the browser's "pre-check" request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Pull the key from Vercel's environment variables
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "Server configuration missing API Key" });
  }

  try {
    const { base64Data, isPro } = req.body; // Receive pro status from app

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" },
    });

    const base64Content = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
    const imagePart = { inlineData: { data: base64Content, mimeType: "image/jpeg" } };

    const prompt = `
    1. Identify the exact product name from the image.
    2. Analyze ingredients for: Food Safety and Skin Health.
    ${isPro ? `3. ALSO Analyze: Makeup Safety (comedogenic, parabens, fragrances), Veg, Vegan, Halal, Alcohol-Free.` : `3. SKIP analysis for Makeup, Veg, Vegan, Halal, and Alcohol.`}
    4. For analyzed categories, assign status (SAFE, CAUTION, UNSAFE) and a brief summary.
    5. RECOMMENDATIONS:
       - The FIRST item in the list must be the 'Identified Product Name'.
       - Follow it with NINE (9) alternatives available on Amazon.
       - IMPORTANT: Sort these 9 alternatives by similarity to the original product (closest matches first).

    Return ONLY this JSON structure:
    {
      "identifiedProduct": "string",
      "food": {"status": "string", "summary": "string"},
      "skin": {"status": "string", "summary": "string"},
      "makeup": ${isPro ? `{"status": "string", "summary": "string"}` : `{"status": "WAITING", "summary": "Premium Feature"}`},
      "veg": ${isPro ? `{"status": "string", "summary": "string"}` : `{"status": "WAITING", "summary": "Premium Feature"}`},
      "vegan": ${isPro ? `{"status": "string", "summary": "string"}` : `{"status": "WAITING", "summary": "Premium Feature"}`},
      "halal": ${isPro ? `{"status": "string", "summary": "string"}` : `{"status": "WAITING", "summary": "Premium Feature"}`},
      "alcohol": ${isPro ? `{"status": "string", "summary": "string"}` : `{"status": "WAITING", "summary": "Premium Feature"}`},
      "recommendations": ["Identified Product", "Closest Match 1", "Closest Match 2", "Match 3", "Match 4", "Match 5", "Match 6", "Match 7", "Match 8", "Match 9"]
    }
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return res.status(200).json(JSON.parse(response.text()));

  } catch (error: any) {
    console.error("Vercel Backend Error:", error);
    return res.status(500).json({ error: error.message });
  }
}