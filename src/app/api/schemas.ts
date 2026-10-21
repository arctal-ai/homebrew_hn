import { z } from "zod/v4";

// ============================================================================
// HN STORY RECOMMENDATION SCHEMAS
// ============================================================================

const hnStorySchema = z.object({
  by: z.string(),
  descendants: z.number().optional(),
  id: z.number(),
  score: z.number(),
  time: z.number(),
  title: z.string(),
  url: z.string().optional()
});

const recommendationSchema = z.object({
  by: z.string(),
  descendants: z.number().optional(),
  id: z.number(),
  recommendation: z.enum(["skip", "skim", "dive"]),
  relevanceReasoning: z.string(),
  score: z.number(),
  time: z.number(),
  title: z.string(),
  url: z.string().optional()
});

const recommendationResponseSchema = z.object({
  filteredCount: z.number(),
  hnPageSource: z.enum(["top", "new", "ask", "show"]),
  recommendations: z.array(recommendationSchema),
  totalStories: z.number()
});

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

export const singleRecRequestSchema = z.object({
  context: z.string().optional().default(""),
  story: hnStorySchema
});

export const batchRecRequestSchema = z.object({
  context: z.string().optional().default(""),
  hnPageSource: z.enum(["top", "new", "ask", "show"]).optional().default("top"),
  stories: z.array(hnStorySchema)
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type HNStoryType = z.infer<typeof hnStorySchema>;
export type RecommendationType = z.infer<typeof recommendationSchema>;
export type RecommendationResponseType = z.infer<
  typeof recommendationResponseSchema
>;
