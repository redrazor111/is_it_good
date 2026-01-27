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

  const genAI = new GoogleGenerativeAI(API_KEY);

  try {
    const { base64Data } = req.body; // App sends the image here

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: { responseMimeType: "application/json" },
    });

    const base64Content = base64Data.includes(",")
      ? base64Data.split(",")[1]
      : base64Data;

    const imagePart = {
      inlineData: { data: base64Content, mimeType: "image/jpeg" },
    };

    const prompt = `
      Analyze ingredients for: Food Safety, Skin, Veg, Vegan, Halal, Alcohol-Free.
      Assign status (SAFE, CAUTION, UNSAFE) and a summary for each.

      ALSO: If any category is UNSAFE or CAUTION, suggest 3 specific, popular,
      and highly-rated product names as safe alternatives available on Amazon UK.

      Return ONLY a JSON object:
      {
        "food": {"status": "string", "summary": "string"},
        "skin": {"status": "string", "summary": "string"},
        "veg": {"status": "string", "summary": "string"},
        "vegan": {"status": "string", "summary": "string"},
        "halal": {"status": "string", "summary": "string"},
        "alcohol": {"status": "string", "summary": "string"},
        "recommendations": ["Product Name 1", "Product Name 2", "Product Name 3"]
      }
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;

    // Return the JSON directly to your app
    return res.status(200).json(JSON.parse(response.text()));

  } catch (error: any) {
    console.error("Vercel Backend Error:", error);
    return res.status(500).json({ error: error.message });
  }
}