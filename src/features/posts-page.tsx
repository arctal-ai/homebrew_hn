"use client";

import { useEffect } from "react";
import HNNavBar from "@/features/hn-nav-bar";
import PostListing from "@/features/post-listing";
import { useHNStore } from "@/features/store";
import { useHNRecommendations } from "@/features/use-hn-stories";

interface HNPostPageProps {
  hnPageSource: "top" | "new" | "ask" | "show";
}

export default function HNPostPage({ hnPageSource }: HNPostPageProps) {
  const {
    profileText,
    recommendationsData,
    isLoadingRecommendations,
    setShowOnboarding,
    handleGetRecommendations,
    setCurrentHnPageSource,
    setIsLoadingRecommendations
  } = useHNStore();
  const { data, isLoading } = useHNRecommendations({
    hnPageSource,
    limit: 30,
    profileText
  });

  // On mount, if no context, show onboarding; if context, fetch recommendations
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Set the current story type
    setCurrentHnPageSource(hnPageSource);

    if (!profileText) {
      setShowOnboarding(true);
    }
  }, [hnPageSource, profileText, setShowOnboarding, setCurrentHnPageSource]);

  // Update store when data changes
  useEffect(() => {
    if (data?.success && data.data) {
      // The store's handleGetRecommendations function handles sorting
      // We need to call it with the data we have
      const mockGetRecommendations = async () => ({
        data: data.data,
        success: true
      });
      handleGetRecommendations(mockGetRecommendations, profileText);
    }

    // Update loading state based on query loading state
    if (isLoading !== undefined) {
      setIsLoadingRecommendations(isLoading);
    }
  }, [
    data,
    profileText,
    handleGetRecommendations,
    isLoading,
    setIsLoadingRecommendations
  ]);

  function formatTimestamp(timestamp: number): string {
    const now = new Date();
    const postTime = new Date(timestamp * 1000);
    const diffMs = now.getTime() - postTime.getTime();

    // Convert to minutes, hours, days
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
    }

    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    }

    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  }

  return (
    <HNNavBar>
      <PostListing
        formatTimestamp={formatTimestamp}
        isLoadingRecommendations={isLoadingRecommendations || isLoading}
        recommendationsData={recommendationsData}
      />
    </HNNavBar>
  );
}
