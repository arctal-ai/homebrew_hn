import { ModelName } from "@repo/lib/types";
import { generateText } from "ai";
import { COMPRESS_SYSTEM_PROMPT } from "@/app/prompts";
import { createModel, getProviderOptions } from "../models";

// Allow streaming responses up to 5 minutes.
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    // Get authenticated user

    const { text } = await req.json();

    if (!text) {
      return Response.json(
        { error: "Missing required text field" },
        { status: 400 }
      );
    }

    // Generate the compressed summary
    const summary = await compressText(text);

    if (!summary) {
      return Response.json(
        { error: "Failed to generate summary" },
        { status: 500 }
      );
    }

    // Return the compressed text
    return Response.json({ summary });
  } catch (error) {
    console.error("Error compressing text:", error);
    return Response.json({ error: "Failed to compress text" }, { status: 500 });
  }
}

async function compressText(text: string) {
  const modelName = ModelName.GEMINI_2_5_FLASH;
  const model = createModel(modelName);
  const providerOptions = getProviderOptions(modelName);
  try {
    const result = await generateText({
      experimental_telemetry: {
        functionId: "compress-text",
        isEnabled: true
      },
      maxRetries: 3,
      maxSteps: 3,
      model,
      prompt: text,
      providerOptions,
      system: COMPRESS_SYSTEM_PROMPT,
      temperature: 0.1
    });

    return result.text;
  } catch {
    return null;
  }
}
