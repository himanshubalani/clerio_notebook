import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: config.openai.apiKey });