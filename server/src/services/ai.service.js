import { geminiService } from "../config/gemini.js";

const allowedTypes = [
  "theft",
  "accident",
  "harassment",
  "damaged-property",
  "suspicious-activity",
  "other",
];

const allowedSeverities = ["low", "medium", "high"];

const extractJsonObject = (rawText) => {
  const cleanedText = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("No JSON object found in Gemini response");
  }

  return jsonMatch[0];
};

const normalizeValue = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export const categorizeIncidentDescription = async (description) => {
  const prompt = `You are an AI assistant for a public safety application. Analyze the following incident description and respond ONLY with a valid JSON object — no markdown, no explanation, no extra text.

The JSON must have exactly these three fields:
- "type": one of [${allowedTypes.join(", ")}]
- "severity": one of [${allowedSeverities.join(", ")}]
- "summary": a concise one-line summary of the incident (max 15 words)

Incident description: "${description}"

If you are unsure, use "other" for type and "low" for severity.

Respond with only the JSON object.`;

  try {
    const response = await geminiService(prompt);
    const rawText = response.data.candidates[0].content.parts[0].text.trim();
    const jsonText = extractJsonObject(rawText);
    const parsed = JSON.parse(jsonText);

    const normalizedType = normalizeValue(parsed.type);
    const normalizedSeverity = normalizeValue(parsed.severity);

    const validType = allowedTypes.includes(normalizedType)
      ? normalizedType
      : "other";
    const validSeverity = allowedSeverities.includes(normalizedSeverity)
      ? normalizedSeverity
      : "low";
    const validSummary =
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : description;

    return { type: validType, severity: validSeverity, summary: validSummary };
  } catch (error) {
    console.error("AI categorization failed, using defaults:", error.message);
    return { type: "other", severity: "low", summary: description };
  }
};
