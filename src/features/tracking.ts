import { track as vercelTrack } from "@vercel/analytics/react";
import { localStorageUtils } from "@/features/localStorage";

/**
 * Enhanced tracking function that automatically includes user ID in all analytics events
 * This provides cross-session user identification without requiring login
 */
export const track = (
  eventName: string,
  customData?: Record<string, string | number | boolean | null>
) => {
  try {
    // Get the user ID (this will generate one if it doesn't exist)
    const userId = localStorageUtils.loadOrGenerateUserId();

    // Merge custom data with userId
    const enrichedData = {
      ...customData,
      userId
    };

    // Call the original Vercel track function with enriched data
    vercelTrack(eventName, enrichedData);
  } catch (error) {
    console.error("Failed to track event with user ID:", error);

    // Fallback to tracking without userId if there's an error
    try {
      vercelTrack(eventName, customData);
    } catch (fallbackError) {
      console.error(
        "Failed to track event even without user ID:",
        fallbackError
      );
    }
  }
};
