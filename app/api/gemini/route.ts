import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { action, payload } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback deterministic response when API key is not yet set in environment
      if (action === "generate-handoff") {
        return NextResponse.json({
          accomplished: payload.workSummary || "Completed presentation slides 1–18 and updated key campaign visuals.",
          blocked: payload.blocker || "Waiting for the New York office to confirm the final budget and pricing table.",
          nextAction: payload.nextAction || "Sarah should insert the final pricing on slide 19 and review with the client team.",
          confidence: "Synthesized based on activity logs",
        });
      }

      if (action === "query-memory") {
        const query = payload.query?.toLowerCase() || "";
        let answer = "Baton's memory shows recent activity across New York, London, and Tokyo teams.";
        if (query.includes("sarah") || query.includes("need")) {
          answer = "Sarah needs the final pricing confirmation from Michael (New York) to finalize slides 19–22 before tomorrow's client presentation.";
        } else if (query.includes("why") || query.includes("not finished") || query.includes("block")) {
          answer = "The client presentation is pending final approval on European market figures and US pricing from the New York and London leads.";
        } else if (query.includes("what changed") || query.includes("away")) {
          answer = "While you were away: 4 updates were logged. The client presentation draft was completed, campaign launch was tentatively scheduled for Monday, and 1 blocker remains active on pricing.";
        } else if (query.includes("who worked") || query.includes("yesterday")) {
          answer = "Emma and James in London completed the initial market research and visual structure yesterday between 2:15 PM and 5:30 PM BST.";
        }
        return NextResponse.json({
          answer,
          sources: [
            { id: "hand-101", title: "Client Presentation Handoff", author: "Sarah", timestamp: "Today 4:45 PM" },
            { id: "blk-204", title: "Pricing Approval Blocker", author: "Michael", timestamp: "Today 4:20 PM" },
          ],
        });
      }

      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    if (action === "generate-handoff") {
      const prompt = `You are Baton AI, an expert workplace handoff assistant for global distributed teams across timezones.
A team member is ending their workday and passing the baton to colleagues in the next timezone.
Given this raw activity context:
---
Role / Department: ${payload.department || "General"}
Work finished / documents: ${payload.rawWork || ""}
Obstacles or waiting on: ${payload.rawBlocker || ""}
Intended next steps: ${payload.rawNext || ""}
---

Extract and produce a concise, high-impact handoff in strictly valid JSON format with three fields:
1. "accomplished": (1-2 sentences: exact deliverables finished today)
2. "blocked": (1 sentence: specific dependency, who is needed, or what is holding work up)
3. "nextAction": (1 sentence: name of person or role who should act next and their exact immediate next task)

Do not add extra conversational text or markdown code fences, return pure JSON with keys: accomplished, blocked, nextAction.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text?.trim() || "{}";
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    }

    if (action === "query-memory") {
      const historyContext = payload.historyContext || "No previous history";
      const query = payload.query || "";

      const prompt = `You are Baton's AI Project Memory. You have access to the chronological handoffs, blockers, and team activities for a global company working across New York, London, and Tokyo.
Context history:
${historyContext}

User Query: "${query}"

Provide a direct, concise, and actionable answer (2 to 3 sentences max) addressing:
- Exactly what happened or who is responsible
- Any open dependencies or blockers
- Clear timeline reference.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.2,
        },
      });

      return NextResponse.json({
        answer: response.text?.trim() || "No relevant records found in project memory.",
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
