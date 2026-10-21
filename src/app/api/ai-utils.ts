import type { ModelNameType } from "@repo/lib/types";
import { generateObject as vercelGenerateObject } from "ai";
import type { z } from "zod";
import { createModel, getProviderOptions } from "./models";

// #region Generate object
export async function generateObject(
  modelName: ModelNameType,
  prompt: string,
  schema: z.ZodSchema
): Promise<z.infer<typeof schema>> {
  const model = createModel(modelName);
  const providerOptions = getProviderOptions(modelName);
  const result = await vercelGenerateObject({
    experimental_telemetry: {
      functionId: "generate-object",
      isEnabled: true
    },
    model,
    prompt,
    providerOptions,
    schema,
    temperature: 0
  });
  return result.object;
}
// #endregion
