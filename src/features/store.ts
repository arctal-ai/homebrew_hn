import { create } from "zustand";
import type {
  RecommendationType as Recommendation,
  RecommendationResponseType as RecommendationResponse
} from "@/app/api/schemas";
import { localStorageUtils } from "@/features/localStorage";
import type { UserPreference } from "@/features/onboarding-flow";
import { processUserRatings } from "@/features/preference-analysis";
import { track } from "@/features/tracking";

// Sorting utility function
const sortRecommendations = (
  recommendations: Recommendation[]
): Recommendation[] => {
  const priorityMap = {
    dive: 4,
    fun: 3,
    skim: 2,
    skip: 1
  };

  return [...recommendations].sort((a, b) => {
    // First sort by recommendation priority
    const priorityDiff =
      priorityMap[b.recommendation] - priorityMap[a.recommendation];

    return priorityDiff;
  });
};

type State = {
  // Profile tex and preferences
  profileText: string;
  additionalUserContext: string;
  // UI state
  isContextDialogOpen: boolean;
  showOnboarding: boolean;
  isCompressing: boolean;
  // Recommendations data
  recommendationsData: RecommendationResponse | null;
  isLoadingRecommendations: boolean;
  // Current story type
  currentHnPageSource: "top" | "new" | "ask" | "show";
};

type Actions = {
  // Context management
  setProfileText: (context: string) => void;
  setAdditionalUserContext: (context: string) => void;
  // UI state management
  setIsContextDialogOpen: (open: boolean) => void;
  setShowOnboarding: (show: boolean) => void;
  setIsCompressing: (compressing: boolean) => void;
  // Recommendations management
  setRecommendationsData: (data: RecommendationResponse | null) => void;
  setIsLoadingRecommendations: (loading: boolean) => void;
  // Story type management
  setCurrentHnPageSource: (
    hnPageSource: "top" | "new" | "ask" | "show"
  ) => void;
  // Complex actions
  handleGetRecommendations: (
    getRecommendations: (params: {
      context: string;
      limit?: number;
      hnPageSource?: "top" | "new" | "ask" | "show";
    }) => Promise<{
      success: boolean;
      data?: RecommendationResponse;
    }>,
    contextToUse: string
  ) => Promise<void>;
  handleOnboardingComplete: (
    prefs: UserPreference[],
    compressText: (text: string) => Promise<{ summary?: string }>
  ) => Promise<void>;
  handleOnboardingSkip: () => void;
  // Reset function
  reset: () => void;
};

type Store = Actions & State;

const initialState: State = {
  additionalUserContext: localStorageUtils.loadAdditionalUserContext() || "",
  currentHnPageSource: "top",
  isCompressing: false,
  isContextDialogOpen: false,
  isLoadingRecommendations: false,
  profileText: localStorageUtils.loadProfileText() || "",
  recommendationsData: null,
  showOnboarding: false
};

export const useHNStore = create<Store>((set, get) => ({
  ...initialState,

  handleGetRecommendations: async (
    getRecommendations,
    contextToUse: string
  ) => {
    try {
      // Use the context directly since additional context is now included in the main profile
      const result = await getRecommendations({
        context: contextToUse,
        hnPageSource: get().currentHnPageSource,
        limit: 30
      });

      if (result.success && result.data) {
        // Sort the recommendations before setting the state
        const sortedRecommendations = {
          ...result.data,
          recommendations: sortRecommendations(result.data.recommendations)
        };
        set({ recommendationsData: sortedRecommendations });
      }
    } catch (error) {
      console.error("Failed to get recommendations:", error);
    }
  },

  handleOnboardingComplete: async (prefs: UserPreference[], compressText) => {
    // Save user preferences to localStorage
    localStorageUtils.saveUserPreferences(prefs);

    const interestedTitles = prefs.filter(
      (p) => p.interested && !p.superInterested
    );

    const superInterestedTitles = prefs.filter((p) => p.superInterested);

    const notInterestedTitles = prefs.filter((p) => !p.interested);
    console.log("preferences", {
      deep: superInterestedTitles.length,
      skim: interestedTitles.length,
      skip: notInterestedTitles.length
    });

    // Analyze user preferences to generate engagement insights
    const preferenceAnalysis = processUserRatings(prefs);

    let newContext = "";

    // Add preference analysis insights
    if (preferenceAnalysis.llm_description) {
      newContext += `
      <preference_analysis>
      ${preferenceAnalysis.llm_description}
      </preference_analysis>
      `;
    }

    if (superInterestedTitles) {
      if (newContext) {
        newContext += "\n\n";
      }
      newContext += `
      These are examples of articles that I would deep dive into: 
      <deep_dives>
      ${JSON.stringify(superInterestedTitles, null, 2)}
      </deep_dives>
      `;
    }

    if (interestedTitles) {
      if (newContext) {
        newContext += "\n\n";
      }
      newContext += `
      Im mildly interested in and would usually skim these kinds of titles: 
      <skim_interests>
      ${JSON.stringify(interestedTitles, null, 2)}
      </skim_interests>
      `;
    }

    if (notInterestedTitles) {
      if (newContext) {
        newContext += "\n\n";
      }
      newContext += `
      I'm not interested in these articles. I would skip them: 
      <not_interested>
      ${JSON.stringify(notInterestedTitles, null, 2)}
      </not_interested>
      `;
    }

    // Include additional user context if available
    const additionalContext = get().additionalUserContext;
    if (additionalContext?.trim()) {
      if (newContext) {
        newContext += "\n\n";
      }
      newContext += `
      Additional context about my current interests and focus:
      <additional_context>
      ${additionalContext.trim()}
      </additional_context>
      `;
    }

    if (newContext) {
      set({ isCompressing: true });

      try {
        const data = await compressText(newContext);
        const finalContext = data.summary ? data.summary : newContext;
        // Automatically save the context and close onboarding
        get().setProfileText(finalContext);

        set({ showOnboarding: false });
      } catch (error) {
        console.error("Failed to compress text:", error);
        // Fallback to uncompressed and still auto-save
        get().setProfileText(newContext);

        set({ showOnboarding: false });
      } finally {
        set({ isCompressing: false });
      }
    } else {
      // If no context was generated, just close onboarding
      set({ showOnboarding: false });
    }
  },

  handleOnboardingSkip: () => set({ showOnboarding: false }),

  reset: () => set(initialState),

  setAdditionalUserContext: (context: string) => {
    localStorageUtils.saveAdditionalUserContext(context);
    set({ additionalUserContext: context });
    track("additional_user_context_set", {
      context
    });
  },

  setCurrentHnPageSource: (hnPageSource: "top" | "new" | "ask" | "show") =>
    set({ currentHnPageSource: hnPageSource }),

  setIsCompressing: (compressing: boolean) =>
    set({ isCompressing: compressing }),

  setIsContextDialogOpen: (open: boolean) => set({ isContextDialogOpen: open }),

  setIsLoadingRecommendations: (loading: boolean) =>
    set({ isLoadingRecommendations: loading }),

  setProfileText: (context: string) => {
    localStorageUtils.saveProfileText(context);
    set({ profileText: context });
  },

  setRecommendationsData: (data: RecommendationResponse | null) =>
    set({ recommendationsData: data }),

  setShowOnboarding: (show: boolean) => set({ showOnboarding: show })
}));
