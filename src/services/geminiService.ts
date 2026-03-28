import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

const SYSTEM_INSTRUCTION = `
  You are FedCausalFresh Net (FCFN), a world-class AI system for smart fridges in Tamil Nadu.
  Your goal is to reduce food waste and pesticide exposure.
  Always consider local context: high humidity, street vendors, and common Indian produce.
  Be precise, scientific (causal inference), and helpful.
`;

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Retrying Gemini API call... (${retries} left)`);
      await new Promise(r => setTimeout(r, 1000));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}

export interface FridgeItem {
  id: number;
  name: string;
  category: string;
  vendor_type: 'street' | 'supermarket';
  added_at: string;
  expiry_at: string;
  zone: string;
  status: string;
}

export const geminiService = {
  async identifyFood(base64Image: string) {
    return withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
              { text: "Identify all food items in this fridge image. For each item, provide: name, category, estimated freshness (1-10), and recommended zone (front, middle, back). Return as JSON array." }
            ]
          }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                freshness: { type: Type.NUMBER },
                recommendedZone: { type: Type.STRING }
              },
              required: ["name", "category", "freshness", "recommendedZone"]
            }
          }
        }
      });

      return JSON.parse(response.text || "[]");
    });
  },

  async getCausalInsight(item: FridgeItem, targetZone: string) {
    // Try to get hard causal data from Python backend first
    let causalData = null;
    try {
      const res = await fetch(`/api/predict/${item.id}?target_zone=${targetZone}`);
      if (res.ok) {
        causalData = await res.json();
      }
    } catch (e) {
      console.warn("Python backend not reachable for causal analysis, falling back to Gemini only.");
    }

    return withRetry(async () => {
      const prompt = `
        Context: A smart fridge in Tamil Nadu (high humidity).
        Item: ${item.name} (${item.category})
        Current Zone: ${item.zone}
        Target Zone: ${targetZone}
        Vendor: ${item.vendor_type} vendor produce.
        ${causalData ? `Python Causal Engine Data: ${JSON.stringify(causalData)}` : ""}
        
        Perform a causal inference analysis:
        1. What is the causal effect of moving this item to the ${targetZone} zone?
        2. How does the humidity in Tamil Nadu interact with this specific item?
        3. Provide a 'What-If' prediction for shelf life extension.
        4. Give specific cleaning advice if it's from a ${item.vendor_type} vendor.
        
        ${causalData ? "Base your report on the Python Causal Engine Data provided above." : ""}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        }
      });

      return response.text;
    });
  },

  async voiceAssistant(query: string, inventory: FridgeItem[]) {
    return withRetry(async () => {
      const prompt = `
        Current Inventory: ${JSON.stringify(inventory)}
        User Query: "${query}"
        
        Rules:
        - Be helpful, concise, and use a friendly tone.
        - Mention specific Tamil Nadu context if relevant (e.g., high humidity in Chennai, street vendors in Trichy).
        - Provide specific pesticide cleaning advice:
          * Street vendor produce (Greens, Tomatoes, Brinjal): 10 min soak in water + 1 tsp baking soda.
          * Supermarket produce: Standard cold water rinse.
        - If asked about expiry, look at the inventory.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        }
      });

      return response.text;
    });
  },

  async generateRecipes(inventory: FridgeItem[]) {
    return withRetry(async () => {
      const expiringSoon = inventory.filter(i => {
        const days = (new Date(i.expiry_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return days <= 2;
      });

      const prompt = `
        Current Inventory: ${JSON.stringify(inventory)}
        Expiring Soon: ${JSON.stringify(expiringSoon)}
        
        Task: Suggest 3 Tamil Nadu-style recipes (e.g., Sambar, Poriyal, Kootu, Rasam) that prioritize the expiring items.
        For each recipe, include:
        1. Name
        2. Ingredients used from the fridge
        3. A "Causal Twist" explaining how much waste is reduced by cooking this today.
        4. Brief instructions.
        
        Format as Markdown.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { systemInstruction: SYSTEM_INSTRUCTION }
      });

      return response.text;
    });
  },

  async getPesticideEducation() {
    return withRetry(async () => {
      const prompt = `
        Provide a detailed educational guide on pesticide risks in street-vendor produce in Tamil Nadu.
        Include:
        1. Why street vendors often have higher pesticide residues (lack of regulation, direct sourcing).
        2. The science of the baking soda (sodium bicarbonate) soak: how it neutralizes specific pesticides.
        3. A step-by-step cleaning protocol for different categories (Greens vs Hard vegetables).
        4. A reassuring note on food safety.
        
        Format as Markdown with clear headings.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { systemInstruction: SYSTEM_INSTRUCTION }
      });

      return response.text;
    });
  }
};
