require("dotenv").config();

const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3001;
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(express.raw({
    type: ["image/jpeg", "image/png"],
    limit: "5mb"
}));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "ECOMER Gemini API fonctionne"
    });
});

app.post("/api/detection", async (req, res) => {
    try {
        if (!req.body || !req.body.length) {
            return res.status(400).json({
                success: false,
                message: "Aucune image reçue"
            });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: [
                {
                    inlineData: {
                        mimeType: req.get("content-type") || "image/jpeg",
                        data: req.body.toString("base64")
                    }
                },
                {
                    text: "Classifie cette image de déchet avec un seul mot parmi PLASTIC, PAPER ou UNKNOWN."
                }
            ]
        });

        const result = (response.text || "").trim().toUpperCase();
        let category = "UNKNOWN";
        if (result.includes("PLASTIC")) {
            category = "PLASTIC";
        } else if (result.includes("PAPER")) {
            category = "PAPER";
        }

        return res.json({ success: true, category });
    } catch (error) {
        console.error("Erreur Gemini :", error);
        return res.status(500).json({
            success: false,
            category: "UNKNOWN",
            message: "Erreur de reconnaissance"
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend démarré sur le port ${PORT}`);
});
