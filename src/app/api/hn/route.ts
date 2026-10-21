import { NextResponse } from "next/server";
import type { HNStoryType } from "@/app/api/schemas";

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const hnPageSource = searchParams.get("hnPageSource") || "top";
    const limitParam = Number(searchParams.get("limit")) || 30;

    // Determine which endpoint to use based on hnPageSource
    const hnPageSourceEndpoints: Record<string, string> = {
      ask: "askstories",
      new: "newstories",
      show: "showstories",
      top: "topstories"
    };

    const endpoint = hnPageSourceEndpoints[hnPageSource] || "topstories";

    // Fetch stories from HN API based on hnPageSource
    const storiesResponse = await fetch(
      `https://hacker-news.firebaseio.com/v0/${endpoint}.json`
    );
    const storyIds: number[] = await storiesResponse.json();

    // Fetch the first `limit` stories
    const storyPromises = storyIds.slice(0, limitParam).map(async (id) => {
      const response = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`
      );
      return response.json() as Promise<HNStoryType>;
    });

    const stories = await Promise.all(storyPromises);

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Error scraping HN:", error);
    return NextResponse.json({ error: "Failed to scrape HN" }, { status: 500 });
  }
}
