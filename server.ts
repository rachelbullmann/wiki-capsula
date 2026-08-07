import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini AI Client lazily or safely
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Endpoint: AI Text Review & Editing (Google Docs style AI helper)
  app.post("/api/ai/review", async (req, res) => {
    try {
      const { selectedText, action, customInstruction, fullContext } = req.body;

      if (!selectedText || typeof selectedText !== "string") {
        return res.status(400).json({ error: "O texto selecionado é obrigatório." });
      }

      const ai = getAiClient();

      let promptInstruction = "";
      switch (action) {
        case "grammar":
          promptInstruction = "Corrija erros gramaticais, ortográficos e de pontuação no texto a seguir, mantendo os termos técnicos e comandos intactos. Retorne apenas o texto corrigido em Português.";
          break;
        case "clarity":
          promptInstruction = "Melhore a clareza, concisão e fluidez do texto técnico a seguir, mantendo exatamente o mesmo significado e preservando blocos de código e comandos intactos. Retorne o texto melhorado.";
          break;
        case "explain":
          promptInstruction = "Explique detalhadamente o conceito técnico ou comando apresentado no texto a seguir, como um especialista em segurança cibernética e redes. Retorne uma explicação clara e formatada em Markdown.";
          break;
        case "summarize":
          promptInstruction = "Resuma os pontos principais do texto selecionado em tópicos curtos e objetivos em Markdown.";
          break;
        case "translate_en":
          promptInstruction = "Traduza o texto a seguir para Inglês técnico mantendo termos cibernéticos e comandos intactos.";
          break;
        case "translate_pt":
          promptInstruction = "Traduza o texto a seguir para Português técnico mantendo comandos e termos em inglês consagrados (ex: reverse shell, kerberoasting).";
          break;
        case "expand":
          promptInstruction = "Expanda o texto fornecido adicionando mais contexto técnico relevante, exemplos ou casos de uso práticos de cibersegurança.";
          break;
        case "custom":
          promptInstruction = customInstruction || "Revise e aprimore o texto selecionado a seguir conforme as melhores práticas de documentação técnica.";
          break;
        default:
          promptInstruction = "Aprimore e revise o texto a seguir para uma wiki técnica de qualidade.";
      }

      const systemInstruction = `Você é um assistente de IA especialista em documentação técnica de tecnologia, segurança cibernética e sistemas (estilo Google Docs AI Assistant).
Responda de forma direta e objetiva, mantendo a formatação Markdown quando relevante. Não inclua saudações desnecessárias. Preserve comandos de terminal, sintaxes e termos técnicos.`;

      const prompt = `${promptInstruction}\n\nTexto Selecionado:\n"""\n${selectedText}\n"""${
        fullContext ? `\n\nContexto Geral da Nota:\n"""\n${fullContext.substring(0, 1000)}\n"""` : ""
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      const resultText = response.text || "";
      return res.json({ resultText });
    } catch (error: any) {
      console.error("Erro na API do Gemini AI Review:", error);
      return res.status(500).json({
        error: error.message || "Ocorreu um erro ao processar a revisão com a IA.",
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware in dev mode / Static serving in prod mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
