import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import type { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { createVertex } from "@ai-sdk/google-vertex/edge";
import { openai } from "@ai-sdk/openai";
import type {
  LanguageModelV1,
  LanguageModelV1ProviderMetadata
} from "@ai-sdk/provider";
import { ModelName, type ModelNameType } from "@repo/lib/types";

export function createModel(modelName: ModelNameType): LanguageModelV1 {
  const AWS_REGION = process.env.AWS_REGION;
  if (!AWS_REGION) {
    throw new Error("AWS_REGION is not set");
  }
  switch (modelName) {
    case ModelName.CLAUDE_3_5_HAIKU:
      return createAmazonBedrock()(
        `arn:aws:bedrock:${AWS_REGION}:810524592879:inference-profile/us.anthropic.claude-3-5-haiku-20241022-v1:0`
      );
    case ModelName.CLAUDE_3_7_SONNET:
      return createAmazonBedrock()(
        `arn:aws:bedrock:${AWS_REGION}:810524592879:inference-profile/us.anthropic.claude-3-7-sonnet-20250219-v1:0`
      );
    case ModelName.CLAUDE_4_SONNET:
      return createAmazonBedrock()(
        `arn:aws:bedrock:${AWS_REGION}:810524592879:inference-profile/us.anthropic.claude-sonnet-4-20250514-v1:0`
      );
    case ModelName.GEMINI_2_5_FLASH:
      return createVertex()("gemini-2.5-flash");
    case ModelName.GEMINI_2_5_PRO:
      return createVertex()("gemini-2.5-pro");
    case ModelName.GPT_4_1:
      return openai("gpt-4.1");
  }
}

export function getProviderOptions(
  modelName: ModelNameType
): LanguageModelV1ProviderMetadata | undefined {
  switch (modelName) {
    case ModelName.GEMINI_2_5_FLASH:
      return {
        google: {
          thinkingConfig: {
            thinkingBudget: 0
          }
        } satisfies GoogleGenerativeAIProviderOptions
      };
    default:
      return undefined;
  }
}
