import { useMutation, useQuery } from "@tanstack/react-query";
import type { HNStoryType } from "@/app/api/schemas";

async function fetchFixedHNStories(): Promise<HNStoryType[]> {
  const response = await fetch("/api/hn/fixed?limit=30");
  if (!response.ok) {
    throw new Error("Failed to fetch stories");
  }
  const data = await response.json();
  return data.slice(0, 10); // Ensure we only get 10
}

export function useFixedHNStories() {
  return useQuery({
    gcTime: 15 * 60 * 1000,
    queryFn: fetchFixedHNStories,
    queryKey: ["hn-stories"], // 5 minutes
    refetchOnWindowFocus: false, // 15 minutes
    staleTime: 5 * 60 * 1000
  });
}

async function fetchHNStories(
  hnPageSource: "top" | "new" | "ask" | "show",
  limit: number
): Promise<HNStoryType[]> {
  const response = await fetch(
    `/api/hn?hnPageSource=${hnPageSource}&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch stories");
  }
  const data = await response.json();
  return data;
}

function useHNStories(
  hnPageSource: "top" | "new" | "ask" | "show",
  limit: number
) {
  return useQuery({
    gcTime: 15 * 60 * 1000,
    queryFn: () => fetchHNStories(hnPageSource, limit),
    queryKey: ["hn-stories", hnPageSource, limit], // 5 minutes
    refetchOnWindowFocus: false, // 15 minutes
    staleTime: 5 * 60 * 1000
  });
}

export function useHNRecommendations({
  profileText,
  limit = 30,
  hnPageSource = "top"
}: {
  profileText: string;
  limit?: number;
  hnPageSource?: "top" | "new" | "ask" | "show";
}) {
  const { data: stories, isLoading: storiesLoading } = useHNStories(
    hnPageSource,
    limit
  );

  return useQuery({
    enabled: !!stories && !storiesLoading, // Only run when we have stories and they're not loading
    queryFn: () =>
      fetch("/api/recommend", {
        body: JSON.stringify({
          context: profileText,
          stories
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      }).then((res) => res.json()),
    queryKey: ["hn-recommendations", profileText, limit, hnPageSource, stories],
    refetchOnWindowFocus: false,
    staleTime: 15 * 60 * 1000 // 15 minutes stale time
  });
}

export function useCompressText() {
  return useMutation({
    mutationFn: (text: string) =>
      fetch("/api/compress", {
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      }).then((res) => res.json())
  });
}
