import axios from "axios";
import { ENV } from "./env.js";
import ApiError from "../utils/ApiError.js";

const api_key = ENV.mistral_key;
const model = ENV.mistral_model || "mistral-large-latest";
const url = `https://api.mistral.ai/v1/chat/completions`;

export const geminiService = async (incidentPrompt) => {
  if (!api_key) {
    throw new ApiError(500, "Mistral API key is missing");
  }
  const requestedData = {
    model,
    messages: [
      {
        role: "user",
        content: incidentPrompt,
      },
    ],
  };

  const response = await axios.post(url, requestedData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${api_key}`,
    },
    timeout: 15000,
  });

  return response;
};
