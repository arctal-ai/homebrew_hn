"use client";

import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@repo/ui/dialog";
import { Textarea } from "@repo/ui/textarea";
import { IconInfoCircle, IconLoader } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { RECOMMENDATION_SYSTEM_PROMPT } from "@/app/prompts";
import { useHNStore } from "@/features/store";
import { track } from "@/features/tracking";

// Info Dialog Component - shows how recommendations work
function HowItWorksDialog() {
  // System prompt from the recommend endpoint

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="inline-flex items-center group relative">
          <IconInfoCircle color="var(--color-hn-600)" size={40} />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>How we make recs from profiles</DialogTitle>
          <DialogDescription>
            Profile + Post title card text + System prompt -{">"} recommendation
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="bg-hn-100 border border-hn-700 p-4 rounded-md">
            <h3 className="font-semibold text-[hsl(223,20%,15%)] mb-2">
              Simple Recs:
            </h3>
            <p className="text-sm text-[hsl(223,20%,55%)]">
              We pass your profile, along with the visible text from a HN post
              and the recommendation system prompt below to a light weight LLM
              (we use Gemini 2.5 flash). You can see the prompt below, thats all
              there is to it.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[hsl(223,20%,15%)] mb-2">
              Recommendation System Prompt
            </h3>
            <div className="bg-gray-50 border rounded-md p-4">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                {RECOMMENDATION_SYSTEM_PROMPT}
              </pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// HN Context Dialog - moved from standalone component to dialog
function HNContextDialog({
  initialContext,
  isCompressing,
  onSaveContext
}: {
  initialContext: string;
  isCompressing: boolean;
  onSaveContext: (context: string) => void;
}) {
  const [tempContext, setTempContext] = useState(initialContext || "");

  // Sync tempContext with initialContext when it changes
  useEffect(() => {
    if (initialContext !== undefined) {
      setTempContext(initialContext);
    }
  }, [initialContext]);

  const handleSave = () => {
    if (tempContext.trim()) {
      onSaveContext(tempContext);
    } else {
      // If empty, clear the additional context
      onSaveContext("");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" variant="outline">
          <span className="text-sm">Additional Context</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Add HN Context</DialogTitle>
          <DialogDescription>
            This context will be incorporated into generating your profile
            recommendations.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {isCompressing ? (
            <div className="flex items-center justify-center gap-2 p-4">
              <IconLoader className="h-4 w-4 animate-spin" />
              <span className="text-sm text-[hsl(223,20%,55%)]">
                Processing your context...
              </span>
            </div>
          ) : (
            <>
              <Textarea
                className="min-h-[200px] text-sm"
                onChange={(e) => setTempContext(e.target.value)}
                placeholder="Add information about your current interests or projects to help generate a better profile. For example: 'I'm currently researching database optimization techniques. I want to focus on real-world applications rather than academic papers.'"
                value={tempContext}
              />
              <p className="text-sm text-[hsl(223,20%,55%)] text-center">
                You can write your own context, but copying your upvoted
                submissions from your HN profile works well too.
              </p>
              <div className="flex justify-end">
                <Button
                  className="flex items-center gap-2"
                  onClick={handleSave}
                  variant="llm"
                >
                  <span className="text-sm">Save Context</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProfileView({
  initialProfile,
  isCompressing,
  onSaveProfile,
  onRedoPreferences,
  initialContext,
  onSaveContext
}: {
  initialProfile: string;
  isCompressing: boolean;
  onSaveProfile: (profile: string) => void;
  onRedoPreferences: () => void;
  initialContext: string;
  onSaveContext: (context: string) => void;
}) {
  const [tempProfile, setTempProfile] = useState(initialProfile || "");

  useEffect(() => {
    if (initialProfile !== undefined) {
      setTempProfile(initialProfile);
    }
  }, [initialProfile]);

  const handleSave = () => {
    onSaveProfile(tempProfile);
    track("manual_profile_save", {
      profile: tempProfile
    });
  };

  return (
    <div className="flex flex-col bg-hn-50">
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 text-center">
        <div className="w-full max-w-2xl h-full">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(223,20%,15%)]">
                HomeBrew HN Profile <HowItWorksDialog />
              </h2>
            </div>
          </div>
          {isCompressing ? (
            <div className="flex items-center justify-center gap-2 p-4 sm:p-8">
              <IconLoader className="h-4 w-4 animate-spin" />
              <span className="text-sm sm:text-base text-[hsl(223,20%,55%)]">
                Compressing preferences into your profile...
              </span>
            </div>
          ) : (
            <>
              <div />
              <p className="text-base sm:text-base text-[hsl(223,20%,55%)] mb-4 sm:mb-6  text-center">
                This is your personal profile used to generate recommendations.{" "}
                <br />
                You can edit it here, or restart onboarding to generate a new
                profile.
              </p>
              <Textarea
                className="min-h-[200px] sm:min-h-[400px] text-xs sm:text-sm mb-4 sm:mb-6"
                onChange={(e) => setTempProfile(e.target.value)}
                placeholder="Enter your profile here. For example: 'I'm interested in AI development, especially LLMs. Focus on technical details and implementation challenges.'"
                value={tempProfile}
              />

              <div className="flex flex-col sm:flex-row gap-6 sm:gap-4 sm:justify-between items-center">
                <Button
                  className="flex items-center gap-2 w-full sm:w-auto text-red-600"
                  onClick={onRedoPreferences}
                  size="link"
                  variant="link"
                >
                  <span className="text-sm sm:text-base ">
                    Start from scratch
                  </span>
                </Button>

                <HNContextDialog
                  initialContext={initialContext}
                  isCompressing={isCompressing}
                  onSaveContext={onSaveContext}
                />

                <Button
                  className="flex items-center gap-2 w-full sm:w-auto"
                  onClick={handleSave}
                  variant="llm"
                >
                  <span className="text-sm sm:text-base">Save Changes</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Main settings component
export default function ProfileSettings() {
  const {
    profileText,
    additionalUserContext,
    isCompressing,
    setProfileText,
    setAdditionalUserContext,
    setShowOnboarding
  } = useHNStore();

  return (
    <div className="min-h-screen bg-hn-50 pt-4">
      <ProfileView
        initialContext={additionalUserContext || ""}
        initialProfile={profileText || ""}
        isCompressing={isCompressing}
        onRedoPreferences={() => {
          setShowOnboarding(true);
        }}
        onSaveContext={(context) => {
          setAdditionalUserContext(context);
        }}
        onSaveProfile={(profile) => {
          setProfileText(profile);
        }}
      />
    </div>
  );
}
