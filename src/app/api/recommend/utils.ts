import { ModelName } from "@repo/lib/types";
import { z } from "zod";
import type { HNStoryType, RecommendationType } from "@/app/api/schemas";
import { generateObject } from "../ai-utils";

const individualRecommendationSchema = z.object({
  recommendation: z
    .enum(["skip", "skim", "dive"])
    .describe("Action recommendation based on user preferences"),
  relevanceReasoning: z
    .string()
    .describe(
      "Brief explanation of why this is relevant to the user's interests, or why it is not."
    )
});

const SYSTEM_PROMPT = `
# Hacker News Recommendation System

You are a personalized content curation system for Hacker News. Your job is to analyze a single HN post and provide a recommendation based on user preferences.

## Your Task
1. Review the provided HN post (title, URL, score, comment count)
2. Consider the user's context and preferences
3. Provide a recommendation action: skip, skim, dive,
4. Provide brief reasoning for your recommendation

## Recommendation Categories
- **skip**: Something which the user would not be interested in.
- **skim**: Something which the user would be mildly interested in, they would skim over it.
- **dive**: Something which the user would be interested in, and worth a deep dive.

## Guidelinesπ
- Focus on quality over quantity
- Consider both topic relevance and the user's preferred content style
- Pay attention to technical depth preferences
- Consider the user's professional context and learning goals

## Output Format
Return a JSON object with your reasoning and recommendation.
`;

export async function analyzeStory(
  story: HNStoryType,
  context: string,
  hnPageSource: "top" | "new" | "ask" | "show",
  _index: number,
  additionalContent?: string
): Promise<RecommendationType> {
  try {
    const storyUrl =
      story.url || `https://news.ycombinator.com/item?id=${story.id}`;
    const date = new Date(story.time * 1000).toLocaleDateString();

    let prompt = SYSTEM_PROMPT;

    if (context?.trim()) {
      prompt += `

## User Context & Preferences
${context.trim()}
`;
    }

    prompt += `

## HN Post to Analyze
from the ${hnPageSource} page.
**${story.title}** (${storyUrl})
Score: ${story.score} | Comments: ${story.descendants || 0} | By: ${story.by} | Date: ${date}`;

    if (additionalContent?.trim()) {
      prompt += `

## Additional Content from URL
${additionalContent.trim()}`;
    }

    prompt += `

Please analyze this post and provide your recommendation. Note that new page posts always have lower comments and points`;

    // Add 10-second timeout to the AI analysis
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("Analysis timeout after 10 seconds")),
        10000
      );
    });

    const recommendation = await Promise.race([
      generateObject(
        ModelName.GEMINI_2_5_FLASH,
        prompt,
        individualRecommendationSchema
      ),
      timeoutPromise
    ]);

    return {
      by: story.by,
      descendants: story.descendants,
      id: story.id,
      recommendation: recommendation.recommendation,
      relevanceReasoning: recommendation.relevanceReasoning,
      score: story.score,
      time: story.time,
      title: story.title,
      url: storyUrl
    };
  } catch (error) {
    console.error(`Error analyzing story ${story.id}:`, error);
    // Return a default recommendation on error
    return {
      by: story.by,
      descendants: story.descendants,
      id: story.id,
      recommendation: "skim",
      relevanceReasoning: "Unable to analyze due to error",
      score: story.score,
      time: story.time,
      title: story.title,
      url: story.url || `https://news.ycombinator.com/item?id=${story.id}`
    };
  }
}
