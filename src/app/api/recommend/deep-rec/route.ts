import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeStory } from "@/app/api/recommend/utils";
import type { RecommendationType } from "@/app/api/schemas";
import { singleRecRequestSchema } from "@/app/api/schemas";

// TODO: Implement proper scrapeUrl from context.app or create shared package
// Scraping function placeholder - should use Firecrawl API in production
async function scrapeUrl(
  url: string
): Promise<{ content: string; url: string; title: string }> {
  // This is a placeholder implementation
  // In production, this should use
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
    const validatedData = singleRecRequestSchema.parse(body);
    const { story, context } = validatedData;

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
    const recommendation: RecommendationType = await analyzeStory(
      story,
      context,
      "top", // Default to top since we don't have this info for single stories
      0,
      scrapedContent
    );

    return NextResponse.json({
      data: recommendation,
      success: true
    });
  } catch (error) {
    console.error("Error generating deep recommendation:", error);

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
      { error: "Failed to generate recommendation" },
      { status: 500 }
    );
  }
}
