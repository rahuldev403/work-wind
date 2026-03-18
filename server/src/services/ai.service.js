import { geminiService } from "../config/ai.js";

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

const canonicalizeType = (value) => {
  const normalized = normalizeValue(value)
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");

  const aliasMap = {
    suspicious: "suspicious-activity",
    "suspicious-activity": "suspicious-activity",
    "suspicious-activities": "suspicious-activity",
    "damaged-property": "damaged-property",
    "damage-property": "damaged-property",
    damage: "damaged-property",
    vandalism: "damaged-property",
    theft: "theft",
    robbery: "theft",
    accident: "accident",
    collision: "accident",
    harassment: "harassment",
    assault: "harassment",
    other: "other",
  };

  const canonical = aliasMap[normalized] || normalized;
  return allowedTypes.includes(canonical) ? canonical : "other";
};

const summarizeText = (text, fallback) => {
  const base =
    typeof text === "string" && text.trim()
      ? text.trim().replace(/\s+/g, " ")
      : fallback;

  // Keep the summary compact and consistent for cards/feed UI.
  const words = base.split(" ").filter(Boolean);
  if (words.length <= 15) return base;
  return `${words.slice(0, 15).join(" ")}.`;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableStatus = (status) => status === 429 || status === 503;

const categorizeLocally = (description) => {
  const text = (description || "").toLowerCase();

  const hasAny = (keywords) => keywords.some((word) => text.includes(word));

  let type = "other";
  if (hasAny(["theft", "stolen", "snatched", "robbery", "steal"])) {
    type = "theft";
  } else if (hasAny(["accident", "collision", "crash", "hit", "injured"])) {
    type = "accident";
  } else if (hasAny(["harass", "assault", "abuse", "threat", "stalking"])) {
    type = "harassment";
  } else if (hasAny(["broken", "damage", "vandal", "damaged"])) {
    type = "damaged-property";
  } else if (hasAny(["suspicious", "unknown person", "loitering", "strange"])) {
    type = "suspicious-activity";
  }

  let severity = "low";
  if (
    hasAny([
      "weapon",
      "gun",
      "knife",
      "fire",
      "blood",
      "serious",
      "critical",
      "emergency",
    ])
  ) {
    severity = "high";
  } else if (
    hasAny(["injury", "injured", "fight", "accident", "panic", "crowd"])
  ) {
    severity = "medium";
  }

  return {
    type,
    severity,
    summary: summarizeText(description, "Incident reported by user."),
  };
};

export const categorizeIncidentDescription = async (description) => {
  const prompt = `You are an AI assistant for a public safety application. Analyze the following incident description and respond ONLY with a valid JSON object — no markdown, no explanation, no extra text.

The JSON must have exactly these three fields:
- "type": one of [${allowedTypes.join(", ")}] and MUST match exactly
- "severity": one of [${allowedSeverities.join(", ")}]
- "summary": a concise one-line summary of the incident (max 15 words)

Incident description: "${description}"

If you are unsure, use "other" for type and "low" for severity.

Respond with only the JSON object.`;

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await geminiService(prompt);
      const rawText =
        response?.data?.choices?.[0]?.message?.content?.trim() || "";
      const jsonText = extractJsonObject(rawText);
      const parsed = JSON.parse(jsonText);

      const normalizedType = canonicalizeType(parsed.type);
      const normalizedSeverity = normalizeValue(parsed.severity);

      const validType = allowedTypes.includes(normalizedType)
        ? normalizedType
        : "other";
      const validSeverity = allowedSeverities.includes(normalizedSeverity)
        ? normalizedSeverity
        : "low";
      const validSummary = summarizeText(
        parsed.summary,
        summarizeText(description, "Incident reported by user."),
      );

      return {
        type: validType,
        severity: validSeverity,
        summary: validSummary,
      };
    } catch (error) {
      const status = error?.response?.status;
      const shouldRetry = isRetryableStatus(status) && attempt < maxAttempts;

      if (shouldRetry) {
        const backoffMs = 500 * 2 ** (attempt - 1);
        await sleep(backoffMs);
        continue;
      }

      if (status === 429) {
        console.warn("AI categorization rate-limited; using local fallback.");
      } else {
        console.error(
          "AI categorization failed, using local fallback:",
          error.message,
        );
      }

      return categorizeLocally(description);
    }
  }

  return categorizeLocally(description);
};
