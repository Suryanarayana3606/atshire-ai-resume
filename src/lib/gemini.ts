import OpenAI from "openai";

export const ai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || "",
  dangerouslyAllowBrowser: true,
});

export const MODELS = {
  text: "deepseek/deepseek-chat",
  pro: "deepseek/deepseek-chat",
};