import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import { GoogleGenAI } from "@google/genai";
import { readJSON, writeJSON } from "../services/db.js";

const router = express.Router();

const getAiInstance = async () => {
    let apiKey = process.env.GEMINI_API_KEY;
    const settings = (await readJSON("settings.json")) || {};
    if (settings?.ai?.apiKey) {
      apiKey = settings.ai.apiKey;
    }
    
    if (!apiKey) return null;
    
    try {
        return new GoogleGenAI({ apiKey });
    } catch (e) {
        return null;
    }
};

router.get("/key", requireAdmin, async (req, res) => {
    try {
        const settings = (await readJSON("settings.json")) || {};
        const hasKey = !!(settings?.ai?.apiKey || process.env.GEMINI_API_KEY);
        res.json({ hasKey });
    } catch (e) {
        res.status(500).json({ error: "Failed to get key status" });
    }
});

router.post("/key", requireAdmin, async (req, res) => {
    try {
        const { apiKey } = req.body;
        if (!apiKey) {
            return res.status(400).json({ error: "API key is required" });
        }
        
        // Verify key
        try {
            const ai = new GoogleGenAI({ apiKey });
            await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: "ping",
            });
        } catch (error: any) {
             console.error("verify error", error);
             return res.status(400).json({ error: "Invalid API key" });
        }

        const settings = (await readJSON("settings.json")) || {};
        settings.ai = settings.ai || {};
        settings.ai.apiKey = apiKey;
        await writeJSON("settings.json", settings);
        
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Failed to save key" });
    }
});

router.delete("/key", requireAdmin, async (req, res) => {
    try {
        const settings = (await readJSON("settings.json")) || {};
        if (settings?.ai?.apiKey) {
             delete settings.ai.apiKey;
             await writeJSON("settings.json", settings);
        }
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Failed to delete key" });
    }
});

router.post("/execute", requireAdmin, async (req, res) => {
  const ai = await getAiInstance();
  if (!ai) {
     return res.status(500).json({ error: "Gemini API key is not configured on the server." });
  }
  try {
    const { action, prompt } = req.body;
    let systemInstruction = "";
    
    if (action === 'fix_bug') {
        systemInstruction = "You are an AI diagnostic agent. The user is reporting a bug in their control panel, or requesting an auto fix. Analyze the description and output a JSON response with {'status': 'fixed', 'details': '...your analysis and mock fix...', 'themeChanges': null}. Keep it concise.";
    } else {
        systemInstruction = "You are an AI assistant for a server control panel. The user wants to improve the panel processes or GUI, or change the background. Respond with JSON: {'status': 'success', 'details': '...what you did...', 'themeChanges': {'bg': 'tailwind-color-class'}} where bg could be e.g. 'bg-indigo-950', 'bg-slate-900', 'bg-emerald-950', or null to reset.";
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt || "Analyze system",
        config: {
            systemInstruction,
            responseMimeType: "application/json",
        }
    });

    try {
        const result = JSON.parse(response.text() || "{}");
        res.json(result);
    } catch(e) {
        res.json({ status: 'error', details: response.text() });
    }
  } catch (error: any) {
    console.error("AI Error:", error);
    if (error?.status === 401 || error?.message?.includes('invalid authentication')) {
        return res.status(500).json({ error: "The Gemini API key currently configured is invalid. Please ensure the environment has a valid key." });
    }
    res.status(500).json({ error: "Failed to execute AI task - check API key validity." });
  }
});

export default router;
