"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@repo/ui/dialog";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import OnboardingFlow from "@/features/onboarding-flow";
import { useHNStore } from "@/features/store";
import { useHNRecommendations } from "@/features/use-hn-stories";

interface HNNavBarProps {
  children: React.ReactNode;
}

export default function HNNavBar({ children }: HNNavBarProps) {
  const {
    profileText,
    showOnboarding,
    setShowOnboarding,
    setCurrentHnPageSource,
    setIsLoadingRecommendations,
    isLoadingRecommendations
  } = useHNStore();
  const router = useRouter();
  const pathname = usePathname();

  // Helper to determine active navigation item
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  // Set current story type based on pathname
  const getCurrentHnPageSource = () => {
    if (pathname === "/") return "top";
    if (pathname === "/new") return "new";
    if (pathname === "/ask") return "ask";
    if (pathname === "/show") return "show";
    return "top";
  };

  const { refetch: refetchRecommendations } = useHNRecommendations({
    hnPageSource: getCurrentHnPageSource(),
    limit: 30,
    profileText
  });

  const handleRefresh = async () => {
    const hnPageSource = getCurrentHnPageSource();
    setCurrentHnPageSource(hnPageSource as "top" | "new" | "ask" | "show");

    // Set loading state to true before refresh
    setIsLoadingRecommendations(true);

    try {
      await refetchRecommendations();
    } finally {
      // Ensure loading state is set to false when complete
      setIsLoadingRecommendations(false);
    }
  };

  const handleEditProfile = () => {
    router.push("/settings");
  };

  return (
    <>
      <Dialog onOpenChange={setShowOnboarding} open={showOnboarding}>
        <DialogContent className="max-w-3xl p-0 bg-hn-50">
          <DialogHeader>
            <DialogTitle className="sr-only">My HN Preferences</DialogTitle>
          </DialogHeader>
          <OnboardingFlow />
        </DialogContent>
      </Dialog>
      <div className="h-screen max-w-5xl mx-auto">
        <div className="md:px-4 md:py-2">
          {/* HN-style header */}

          {/* Mobile header layout */}
          <div className="flex md:hidden w-full bg-hn-600 border-0 px-1 py-1 items-center text-sm text-white">
            <div className="outline-1 outline-white w-5 h-5 flex items-center justify-center mr-2">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <div className="flex flex-col w-full">
              <div className="flex w-full">
                <Link
                  className={`font-bold ${isActive("/") ? "underline" : ""}`}
                  href="/"
                >
                  HomeBrew HN
                </Link>

                <div className="ml-auto">
                  {actionButtons({
                    handleEditProfile,
                    handleRefresh,
                    isActive,
                    isLoadingRecommendations,
                    setShowOnboarding
                  })}
                </div>
              </div>

              <div className="mr-auto">{pageNav(isActive)}</div>
            </div>
          </div>

          {/* Desktop header layout */}
          <div className="hidden md:flex bg-hn-600 border-0 px-1 py-1  text-sm text-white gap-x-1">
            <div className="outline-1 outline-white w-5 h-5 flex items-center justify-center mr-2">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <Link
              className={`font-bold ${isActive("/") ? "underline" : ""}`}
              href="/"
            >
              HomeBrew HN
            </Link>
            <span>|</span>
            <div className="mr-auto">{pageNav(isActive)}</div>
            <div>
              {actionButtons({
                handleEditProfile,
                handleRefresh,
                isActive,
                isLoadingRecommendations,
                setShowOnboarding
              })}
            </div>
          </div>

          {/* Main content */}
          {children}

          {/* Add a nice footer */}
          <div className="bg-hn-50 border-t-3 border-hn-600 p-4 text-center">
            <p className="text-[hsl(223,20%,55%)] text-xs font-medium">
              Made in London, because we love HN, by{" "}
              <a
                className="text-hn-600 underline underline-offset-4"
                href="https://www.linkedin.com/in/leobrowning/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Leo
              </a>
              ,{" "}
              <a
                className="text-hn-600 underline underline-offset-4"
                href="https://www.linkedin.com/in/lewis-deane/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Lewis
              </a>
              , and{" "}
              <a
                className="text-hn-600 underline underline-offset-4"
                href="https://www.linkedin.com/in/steffansafey/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Steffan
              </a>
              .{" "}
              <a
                className="text-hn-600 underline underline-offset-4"
                href="https://form.typeform.com/to/clLb1JVI"
                rel="noopener noreferrer"
                target="_blank"
              >
                Give us feedback
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function pageNav(isActive: (path: string) => boolean) {
  return (
    <div className="flex items-center space-x-1 text-white">
      <Link className={`${isActive("/new") ? "underline" : ""}`} href="/new">
        new
      </Link>
      <span>|</span>
      <Link className={`${isActive("/ask") ? "underline" : ""}`} href="/ask">
        ask
      </Link>
      <span>|</span>
      <Link className={`${isActive("/show") ? "underline" : ""}`} href="/show">
        show
      </Link>
    </div>
  );
}

function actionButtons({
  handleRefresh,
  handleEditProfile,
  setShowOnboarding,
  isLoadingRecommendations,
  isActive
}: {
  handleRefresh: () => void;
  handleEditProfile: () => void;
  setShowOnboarding: (show: boolean) => void;
  isLoadingRecommendations: boolean;
  isActive: (path: string) => boolean;
}) {
  return (
    <div className="space-x-1">
      <button
        className={`bg-transparent border-0 p-0 text-white text-sm hover:underline ${isLoadingRecommendations ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
        disabled={isLoadingRecommendations}
        onClick={handleRefresh}
        type="button"
      >
        {isLoadingRecommendations ? (
          <div className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            refreshing...
          </div>
        ) : (
          "refresh recs"
        )}
      </button>
      <span>|</span>
      <button
        className={`bg-transparent border-0 p-0 text-white text-sm cursor-pointer hover:underline ${isActive("/settings") ? "underline" : ""}`}
        onClick={handleEditProfile}
        type="button"
      >
        settings
      </button>
      <span>|</span>
      <button
        className="bg-transparent border-0 p-0 text-white text-sm cursor-pointer hover:underline"
        onClick={() => setShowOnboarding(true)}
        type="button"
      >
        redo profile
      </button>
    </div>
  );
}
