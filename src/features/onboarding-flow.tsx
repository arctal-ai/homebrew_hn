"use client";

import {
  IconAlertCircle,
  IconArrowBackUp,
  IconBolt,
  IconCircleMinus,
  IconCirclePlus,
  IconLoader,
  IconStar
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Button } from "@/components/ui/button";
import { useHNStore } from "@/features/store";
import { track } from "@/features/tracking";
import { useCompressText, useFixedHNStories } from "@/features/use-hn-stories";

export const extractDomain = (url: string) => {
  try {
    if (!url) return "";
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};
export interface UserPreference {
  id: number;
  title: string;
  url: string;
  interested: boolean;
  superInterested?: boolean;
  points?: number;
  comments?: number;
}

enum ChoiceType {
  SKIP = "SKIP",
  SKIM = "SKIM",
  DEEP_DIVE = "DEEP_DIVE"
}

// Enum for choice display text to centralize all UI text
export enum ChoiceDisplayText {
  // Welcome screen descriptions
  DIVE_IN_DESCRIPTION = "🔥 Hell yeah!",
  SKIM_DESCRIPTION = "👀 Yes",
  NOPE_DESCRIPTION = "👎 No",

  // API/backend strings (used in other files)
  DIVE_API = "dive",
  SKIM_API = "skim",
  SKIP_API = "skip"
}

// PreferencesSelectionMode component - handles the preferences selection flow
function PreferencesSelectionMode() {
  const { data: stories = [], error } = useFixedHNStories();

  const { mutateAsync: compressText } = useCompressText();
  const { handleOnboardingComplete, profileText } = useHNStore();
  const [currentIndex, setCurrentIndex] = useState(-1); // Start at -1 to show welcome screen
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [swipeAnimation, setSwipeAnimation] = useState<
    "left" | "right" | "up" | null
  >(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => !isAnimating && handleChoice(ChoiceType.SKIP),
    onSwipedRight: () => !isAnimating && handleChoice(ChoiceType.SKIM),
    onSwipedUp: () => !isAnimating && handleChoice(ChoiceType.DEEP_DIVE),
    preventScrollOnSwipe: true,
    swipeDuration: 500,
    touchEventOptions: { passive: true },
    trackMouse: false
  });

  const handleOnboardingCompleteWrapper = useCallback(
    async (prefs: UserPreference[]) => {
      setCurrentIndex(stories.length);
      await handleOnboardingComplete(prefs, compressText);
    },
    [handleOnboardingComplete, compressText, stories]
  );

  const handleSkipRemaining = useCallback(() => {
    // Track the skip remaining action
    track("preferences_skip_remaining", {
      current_index: currentIndex,
      existing_profile_text: !!profileText,
      preferences_collected: preferences.length,
      total_stories: stories.length
    });

    // Complete onboarding with current preferences
    handleOnboardingCompleteWrapper(preferences);
  }, [
    currentIndex,
    stories.length,
    preferences,
    profileText,
    handleOnboardingCompleteWrapper
  ]);

  const handleBack = useCallback(() => {
    // Prevent going back while animation is in progress
    if (isAnimating) return;

    // Prevent going back beyond the first story
    if (currentIndex <= 0) return;

    // Remove the last preference
    const updatedPreferences = preferences.slice(0, -1);
    setPreferences(updatedPreferences);

    // Go back to the previous story
    setCurrentIndex(currentIndex - 1);
  }, [currentIndex, preferences, isAnimating]);

  const handleChoice = useCallback(
    (choiceType: ChoiceType) => {
      // Prevent new selections while animation is in progress
      if (isAnimating) return;

      if (currentIndex >= stories.length) return;
      if (currentIndex === 0) {
        track("preferences_selection_start", {
          existing_profile_text: !!profileText
        });
      }
      if (currentIndex === stories.length - 1) {
        track("preferences_selection_complete", {
          existing_profile_text: !!profileText
        });
      }

      const currentStory = stories[currentIndex];

      let interested: boolean;
      let superInterested: boolean;
      let animationDirection: "left" | "right" | "up";

      switch (choiceType) {
        case ChoiceType.SKIP:
          interested = false;
          superInterested = false;
          animationDirection = "left";
          break;
        case ChoiceType.SKIM:
          interested = true;
          superInterested = false;
          animationDirection = "right";
          break;
        case ChoiceType.DEEP_DIVE:
          interested = true;
          superInterested = true;
          animationDirection = "up";
          break;
      }

      const newPreference: UserPreference = {
        comments: currentStory.descendants,
        id: currentStory.id,
        interested,
        points: currentStory.score,
        superInterested,
        title: currentStory.title,
        url: currentStory.url || ""
      };

      const updatedPreferences = [...preferences, newPreference];
      setPreferences(updatedPreferences);

      // Start animation and prevent further input
      setIsAnimating(true);
      setSwipeAnimation(animationDirection);
      // Wait for animation to complete before proceeding
      setTimeout(() => {
        setSwipeAnimation(null);
        setIsAnimating(false);
        if (currentIndex + 1 >= stories.length) {
          // Finished all stories - context will be auto-saved by the store
          handleOnboardingCompleteWrapper(updatedPreferences);
        } else {
          setCurrentIndex(currentIndex + 1);
        }
      }, 300);
    },
    [
      currentIndex,
      stories,
      preferences,
      handleOnboardingCompleteWrapper,
      isAnimating,
      profileText
    ]
  );

  // Handle keyboard events
  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      // Prevent keyboard input while animation is in progress
      if (isAnimating) return;

      if (event.key === "ArrowLeft") {
        handleChoice(ChoiceType.SKIP);
      } else if (event.key === "ArrowRight") {
        handleChoice(ChoiceType.SKIM);
      } else if (event.key === "ArrowUp") {
        handleChoice(ChoiceType.DEEP_DIVE);
      }
    }

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleChoice, isAnimating]);

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-hn-50">
        <div className="text-center">
          <div className="mb-4">
            <IconAlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-500 text-sm sm:text-base">
              Error: {error instanceof Error ? error.message : error}
            </p>
          </div>
          <Button
            className="flex items-center gap-2 border-hn-700 text-hn-950 hover:bg-hn-100"
            onClick={handleSkipRemaining}
            size="lg"
            variant="outline"
          >
            <IconAlertCircle className="h-4 w-4" />
            <span className="text-sm sm:text-base">Skip Onboarding</span>
          </Button>
        </div>
      </div>
    );
  }

  if (currentIndex === -1) {
    return (
      <div className="flex flex-col p-3 sm:p-4 justify-center min-h-[30vh] max-h-[80vh] bg-hn-50">
        <div className="flex flex-col items-center text-center justify-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(223,20%,15%)] mb-3 sm:mb-4">
            Welcome to HomeBrew HN
          </h2>
          <p className="text-base sm:text-lg text-[hsl(223,20%,15%)] mb-4 sm:mb-6">
            <span className="text-sm sm:text-lg">
              Take 10s to rate 10 past Hacker News headlines
            </span>
            <br />
            <span className="text-xs sm:text-sm italic">
              We will generate a profile, and use it to rerank your HackerNews.
            </span>
          </p>
        </div>
        <div className="flex flex-col bg-hn-100 border border-hn-700 p-3 sm:p-2 rounded-md mb-6 sm:mb-8">
          <p className="text-sm sm:text-base text-[hsl(223,20%,55%)] mb-4 sm:mb-6">
            For quick rating:
          </p>
          <ul className="text-[hsl(223,20%,15%)] space-y-2 text-sm sm:text-base pl-4">
            <li className="flex items-center">
              <IconStar className="h-4 w-4 mr-2 flex-shrink-0 text-hn-600" />
              <span>
                Select <strong>{ChoiceDisplayText.DIVE_IN_DESCRIPTION}</strong>{" "}
                if you are super interested
              </span>
            </li>
            <li className="flex items-center">
              <IconCirclePlus className="h-4 w-4 mr-2 flex-shrink-0 text-hn-600" />
              <span>
                Select <strong>{ChoiceDisplayText.SKIM_DESCRIPTION}</strong> if
                you'd take a quick look
              </span>
            </li>
            <li className="flex items-center">
              <IconCircleMinus className="h-4 w-4 mr-2 flex-shrink-0 text-hn-600" />
              <span>
                Select <strong>{ChoiceDisplayText.NOPE_DESCRIPTION}</strong> if
                the topic is not for you
              </span>
            </li>
          </ul>
          <p className="text-sm sm:text-base text-[hsl(223,20%,55%)] mb-4 sm:mb-6" />
        </div>

        <Button
          className="self-center mt-2 sm:mt-4 px-6 py-2 text-base font-semibold bg-hn-600 hover:bg-hn-700 text-white"
          data-testid="start-ranking-btn"
          onClick={() => setCurrentIndex(0)}
          size="lg"
        >
          Start Ranking
        </Button>
      </div>
    );
  }

  if (!stories.length) {
    return (
      <div className="flex items-center justify-center min-h-[30vh] max-h-[80vh] bg-hn-50">
        <div className="text-center">
          <p className="text-sm sm:text-base text-[hsl(223,20%,55%)]">
            Loading some headlines...
          </p>
        </div>
      </div>
    );
  }

  // Completion state
  if (currentIndex >= stories.length) {
    console.log("Onboarding complete current index", currentIndex);
    return (
      <div className="flex items-center justify-center min-h-[30vh] max-h-[80vh] bg-hn-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[hsl(223,20%,15%)] mb-4">
            Onboarding Complete!
          </h2>
          <div className="flex items-center justify-center gap-2">
            <IconLoader className="h-4 w-4 animate-spin" />
            <p className="text-[hsl(223,20%,55%)]">
              Generating your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Story selection view
  const currentStory = stories[currentIndex];

  // Display story selection screen
  return (
    <div className="flex flex-col h-full max-h-[80vh] bg-hn-50 w-full max-w-full rounded-none sm:rounded-lg p-3 ">
      {/* Onboarding Progress */}
      <div className="p-3 sm:p-6 border-b border-hn-100 w-full">
        <div className="flex items-center gap-3 sm:gap-4 w-full">
          {/* Continuous progress indicator */}
          <Button
            aria-label="Undo"
            className="p-1 h-auto text-[hsl(223,20%,55%)] hover:text-[hsl(223,20%,15%)]"
            disabled={currentIndex === 0}
            onClick={handleBack}
            size="icon"
            variant="ghost"
          >
            <IconArrowBackUp className="h-4 w-4" />
          </Button>
          <div className="flex-1 bg-hn-100 rounded-full h-1.5 sm:h-2 overflow-hidden ">
            <div
              className="h-full bg-hn-600 transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${(currentIndex / stories.length) * 100}%`
              }}
            />
          </div>
          <span className="text-xs sm:text-sm font-medium text-[hsl(223,20%,55%)]">
            {currentIndex} / {stories.length}
          </span>
          {/* Skip Remaining button - only show if we have some preferences */}

          <Button
            className={`flex items-center gap-1 px-2 py-1 h-auto ${
              currentIndex < 3
                ? "text-red-300 hover:text-red-500"
                : currentIndex < 8
                  ? "text-orange-300 hover:text-orange-500"
                  : "text-[hsl(223,20%,55%)] hover:text-[hsl(223,20%,15%)]"
            }`}
            disabled={preferences.length === 0}
            onClick={handleSkipRemaining}
            size="sm"
            variant="ghost"
          >
            <IconBolt className="h-3 w-3" />
            <span className="text-xs">
              Skip ({stories.length - currentIndex})
            </span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 overflow-hidden">
        <div className="flex justify-center text-[hsl(223,20%,55%)] mt-1 w-full max-w-full mb-4">
          <p className="hidden sm:block text-xs sm:text-sm text-center">
            Select how interested you are in the headline
          </p>
          <p className="sm:hidden text-xs sm:text-sm text-center">
            Are you interested? Swipe to rate
          </p>
        </div>
        <div
          className={`w-full max-w-full transition-all duration-200 ${
            swipeAnimation === "left"
              ? "transform -translate-x-full opacity-0"
              : swipeAnimation === "right"
                ? "transform translate-x-full opacity-0"
                : swipeAnimation === "up"
                  ? "transform -translate-y-full opacity-0"
                  : "animate-in fade-in duration-200"
          }`}
          key={currentIndex}
        >
          <div
            {...swipeHandlers}
            className="bg-white rounded-lg shadow-sm border border-hn-100 p-4 sm:p-6 touch-manipulation"
          >
            <div className="flex items-start">
              <div className="ml-2 sm:ml-2">
                <div className="text-sm sm:text-base font-medium">
                  <span className="text-[hsl(223,20%,15%)] visited:text-[hsl(223,20%,35%)] leading-relaxed">
                    {currentStory.title}
                  </span>
                </div>
                <div className="text-xs text-[hsl(223,20%,55%)] mt-1">
                  ({extractDomain(currentStory.url || "")}) |{" "}
                  {currentStory.score} points | {currentStory.descendants || 0}{" "}
                  comments
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Mobile super pared down button layout */}
      <div className="flex sm p-3 sm:p-4 border-t border-hn-100 mt-auto">
        <div className="flex flex-row gap-3 sm:gap-4 w-full">
          <Button
            className="flex items-center gap-2 px-5 flex-1 text-[hsl(223,20%,15%)]"
            onClick={() => handleChoice(ChoiceType.SKIP)}
            size="lg"
            variant="outline"
          >
            <span className="text-sm sm:text-base">
              {ChoiceDisplayText.NOPE_DESCRIPTION}
            </span>
          </Button>
          <Button
            className="flex items-center gap-2 px-5"
            onClick={() => handleChoice(ChoiceType.DEEP_DIVE)}
            size="lg"
            variant="outline"
          >
            <span className="text-sm sm:text-base">
              {ChoiceDisplayText.DIVE_IN_DESCRIPTION}
            </span>
          </Button>

          <Button
            className="flex items-center gap-2 px-5 flex-1 text-[hsl(223,20%,15%)]"
            onClick={() => handleChoice(ChoiceType.SKIM)}
            size="lg"
            variant="outline"
          >
            <span className="text-sm sm:text-base">
              {ChoiceDisplayText.SKIM_DESCRIPTION}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingFlow() {
  return <PreferencesSelectionMode />;
}
