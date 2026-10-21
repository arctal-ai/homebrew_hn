import { NextResponse } from "next/server";
import type { HNStoryType } from "@/app/api/schemas";

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");

    // Default to 30, max 50, min 1
    let limit = 30;
    if (limitParam) {
      const parsedLimit = Number.parseInt(limitParam, 10);
      if (!Number.isNaN(parsedLimit) && parsedLimit > 0) {
        limit = Math.min(parsedLimit, 50);
      }
    }

    // Specific HN item IDs to sample from
    // Old set
    // const itemIds = [
    //   43846487, 43842306, 43840193, 43842683, 43826798, 43840842, 43851099,
    //   43848325, 43842856, 43804561, 43844708, 43849373, 43847432, 43843821,
    //   43851314, 43848398, 43846964, 43850238, 43849271, 43840763, 43842380,
    //   43840861, 43829935, 43846690, 43828423, 43794120, 43824548, 43831792,
    //   43849383, 43846187, 43518866, 43524937, 43517833, 43527001, 43522966,
    //   43527044, 43504514, 43527452, 43519669, 43494894, 43523238, 43481652,
    //   43526763, 43522363, 43523741, 43490290, 43519823, 43520953, 43526396,
    //   43526621, 43498861, 43522059, 43523765, 43524665, 43520428, 43520074,
    //   43526443, 43482468, 43482863, 43520796
    // ];
    // Aleksis AB twenty (alternating, a, b)
    // const itemIds = [
    //   44532527, 44550572, 44554865, 44545949, 44533403, 44540241, 44512350,
    //   44556684, 44557115, 44550157, 44557348, 44552500, 44527739, 44535637,
    //   44550157, 44535637, 44548906, 44512350, 44554865, 44556684
    // ];
    // backup set of 10
    // const itemIds = [
    //   44554865, 44532527, 44540241, 44551652, 44550572, 44557348, 44552414, 44540402, 44556684, 44519470
    // ]
    // Set of "good" articles for onboarding
    const itemIds = [
      44512350, 44545949, 44527739, 44544266, 44551913, 44548610, 44553389,
      44548353, 44550157, 44555836
    ];

    // Randomly shuffle the array and take all items (we'll filter after fetching)
    const shuffledIds = [...itemIds].sort(() => Math.random() - 0.5);

    // Fetch all items in parallel
    const itemPromises = shuffledIds.map(async (id) => {
      try {
        const response = await fetch(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`
        );
        const item = await response.json();
        return item as HNStoryType | null;
      } catch {
        return null; // Skip failed requests
      }
    });

    const items = await Promise.all(itemPromises);

    // Filter for valid stories with URLs
    const stories = items.filter(
      (item): item is HNStoryType =>
        item !== null && Boolean(item.url) && Boolean(item.score)
    );

    // Randomly shuffle stories and take the specified limit
    const randomStories = stories
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    return NextResponse.json(randomStories);
  } catch (error) {
    console.error("Error scraping HN:", error);
    return NextResponse.json({ error: "Failed to scrape HN" }, { status: 500 });
  }
}
