import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeStory } from "@/app/api/recommend/utils";
import type { HNStoryType, RecommendationType } from "@/app/api/schemas";
import { batchRecRequestSchema } from "@/app/api/schemas";

// TODO: Implement proper scrapeUrl from context.app or create shared package
// Scraping function placeholder - should use Firecrawl API in production
async function scrapeUrl(
  url: string
): Promise<{ content: string; url: string; title: string }> {
  // This is a placeholder implementation
  // In production, this should use the same Firecrawl implementation as context.app
  // For now, we'll return empty content to avoid cross-app dependencies
  console.log(`Would scrape URL: ${url}`);
  return {
    content: "", // Would contain scraped markdown content
    title: "Content scraping placeholder",
    url
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = batchRecRequestSchema.parse(body);
    const { stories, context } = validatedData;

    // Process stories in parallel with concurrency limit
    const processStory = async (
      story: HNStoryType,
      index: number
    ): Promise<RecommendationType> => {
      let scrapedContent = "";

      // Try to scrape content from the URL
      try {
        if (story.url && !story.url.includes("news.ycombinator.com/item")) {
          const scrapeResult = await scrapeUrl(story.url);
          scrapedContent = scrapeResult.content;
        }
      } catch (error) {
        console.warn(`Failed to scrape URL ${story.url}:`, error);
        // Continue without scraped content if scraping fails
      }

      // Analyze the story with scraped content
      return await analyzeStory(
        story,
        context,
        "top", // Default to top since we don't have this info for batch stories
        index,
        scrapedContent
      );
    };

    // Process all stories in parallel
    const analysisPromises = stories.map((story, index) =>
      processStory(story, index)
    );
    const recommendations = await Promise.all(analysisPromises);

    return NextResponse.json({
      data: {
        recommendations,
        totalProcessed: recommendations.length,
        totalRequested: stories.length
      },
      success: true
    });
  } catch (error) {
    console.error("Error generating batch deep recommendations:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          details: error.errors,
          error: "Invalid request data"
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
