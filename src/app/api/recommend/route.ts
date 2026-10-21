import { NextResponse } from "next/server";
import { batchRecRequestSchema } from "@/app/api/schemas";
import { analyzeStory } from "./utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { stories, context, hnPageSource } =
      batchRecRequestSchema.parse(body);

    // Filter out stories without URLs and set default URLs for stories without them
    const validStories = stories.map((story) => ({
      ...story,
      url: story.url || `https://news.ycombinator.com/item?id=${story.id}`
    }));

    // If no context provided, return all stories as 'skim'
    if (!context?.trim()) {
      const defaultRecommendations = validStories.map((story) => ({
        by: story.by,
        descendants: story.descendants,
        id: story.id,
        recommendation: null,
        relevanceReasoning: "No user profile provided",
        score: story.score,
        time: story.time,
        title: story.title,
        url: story.url
      }));

      return NextResponse.json({
        data: {
          filteredCount: validStories.length,
          recommendations: defaultRecommendations,
          totalStories: validStories.length
        },
        meta: {
          totalAnalyzed: validStories.length,
          userContext: false
        },
        success: true
      });
    }

    // Analyze each story individually with concurrent AI calls
    const analysisPromises = validStories.map((story, index) =>
      analyzeStory(story, context, hnPageSource, index)
    );

    const recommendations = await Promise.all(analysisPromises);

    return NextResponse.json({
      data: {
        filteredCount: recommendations.length,
        recommendations,
        totalStories: validStories.length
      },
      meta: {
        totalAnalyzed: validStories.length,
        userContext: !!context?.trim()
      },
      success: true
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
