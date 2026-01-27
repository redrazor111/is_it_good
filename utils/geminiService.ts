const VERCEL_API_URL = "https://is-it-good-pearl.vercel.app/api/analyze";

export const analyzeImageWithGemini = async (base64Data: string) => {
  try {
    const response = await fetch(VERCEL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Data }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    // We return a string to match your existing app logic that uses JSON.parse()
    return JSON.stringify(data);

  } catch (error: any) {
    console.error("Frontend Service Error:", error);

    // Return a fallback object so the app doesn't crash
    return JSON.stringify({
      food: { status: "UNSAFE", summary: "Connection to security server failed." },
      skin: { status: "UNSAFE", summary: "Ensure your Vercel URL is correct." },
      veg: { status: "UNSAFE", summary: "Check internet connection." },
      vegan: { status: "UNSAFE", summary: "Check internet connection." },
      halal: { status: "UNSAFE", summary: "Check internet connection." },
      alcohol: { status: "UNSAFE", summary: "Check internet connection." },
    });
  }
};