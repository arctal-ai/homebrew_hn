"use client";

import { Coffee } from "lucide-react";
import type {
  RecommendationType as Recommendation,
  RecommendationResponseType as RecommendationResponse
} from "@/app/api/schemas";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { ChoiceDisplayText, extractDomain } from "@/features/onboarding-flow";
import { track } from "@/features/tracking";

interface StoryListingProps {
  isLoadingRecommendations: boolean;
  recommendationsData: RecommendationResponse | null;
  formatTimestamp: (timestamp: number) => string;
}

export default function PostListing({
  isLoadingRecommendations,
  recommendationsData,
  formatTimestamp
}: StoryListingProps) {
  return (
    <TooltipProvider>
      <div className="border-0 pb-4 bg-hn-50">
        <Table className="w-full">
          <TableBody className="bg-hn-50">
            <TableRow className="border-0 hover:bg-transparent">
              <TableCell className="border-0 p-1" colSpan={1} />
            </TableRow>
            {isLoadingRecommendations ? (
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell
                  className="px-2 py-4 text-center text-[hsl(223,20%,55%)] border-0"
                  colSpan={1}
                >
                  <div className="flex items-center justify-center gap-2">
                    Brewing up a fresh batch of posts...
                    <Coffee className="h-4 w-4 text-[hsl(223,20%,55%)]" />
                  </div>
                </TableCell>
              </TableRow>
            ) : recommendationsData?.recommendations &&
              recommendationsData.recommendations.length > 0 ? (
              recommendationsData.recommendations.map(
                (rec: Recommendation, index: number) => (
                  <TableRow
                    className="border-0 hover:bg-transparent"
                    key={rec.id}
                  >
                    <TableCell className="px-2 py-1 text-sm border-0 align-top">
                      <div className="flex items-start">
                        <p className="text-[hsl(223,20%,55%)] text-xs mt-0.5 min-w-[20px] align-top">
                          {index + 1}.
                        </p>
                        <div>
                          {rec.recommendation && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className={`font-medium font-mono px-1.5 py-0.4 text-xs capitalize border align-middle mr-2 ${
                                    rec.recommendation ===
                                    ChoiceDisplayText.DIVE_API
                                      ? "bg-hn-600 text-white border-hn-600"
                                      : rec.recommendation ===
                                          ChoiceDisplayText.SKIM_API
                                        ? "bg-hn-100 text-hn-600 border-hn-700"
                                        : "bg-[hsl(0,0%,94%)] text-[hsl(0,0%,40%)] border-[hsl(0,0%,80%)]"
                                  }`}
                                >
                                  {rec.recommendation}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p>{rec.relevanceReasoning}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <a
                            className="text-[hsl(223,20%,15%)] hover:underline font-medium text-[13px] leading-tight align-middle mr-2"
                            href={rec.url}
                            onClick={() =>
                              track("view_hn_post", {
                                hn_url: `https://news.ycombinator.com/item?id=${rec.id}`,
                                rec: rec.recommendation || "",
                                source_url: rec.url || "",
                                title: rec.title || ""
                              })
                            }
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {rec.title}
                          </a>
                          {rec.url && (
                            <span className="text-[10px] text-[hsl(223,20%,55%)] align-middle">
                              ({extractDomain(rec.url)})
                            </span>
                          )}
                          <br />
                          <span className="text-[11px] text-[hsl(223,20%,50%)] leading-tight mr-2">
                            {rec.score} points by {rec.by}{" "}
                            {formatTimestamp(rec.time)} |{" "}
                            <a
                              className="text-[hsl(0,0%,10%)] hover:underline leading-tight"
                              href={`https://news.ycombinator.com/item?id=${rec.id}`}
                              onClick={() =>
                                track("view_hn_comments", {
                                  hn_url: `https://news.ycombinator.com/item?id=${rec.id}`,
                                  rec: rec.recommendation || "",
                                  source_url: rec.url || "",
                                  title: rec.title || ""
                                })
                              }
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              {rec.descendants || 0} comments
                            </a>
                          </span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )
            ) : (
              <TableRow className="border-0">
                <TableCell
                  className="px-2 py-4 text-center text-[hsl(223,20%,55%)] border-0"
                  colSpan={1}
                >
                  {recommendationsData
                    ? "No recommendations found. Try adjusting your preferences."
                    : "Click 'refresh posts' to see personalized HN posts!"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
