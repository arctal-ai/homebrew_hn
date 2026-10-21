import type { UserPreference } from "./onboarding-flow";

type RatingCategory = "deffo" | "maybe" | "nah";
type EngagementPattern =
  | "sleeper_hit"
  | "controversial"
  | "niche_discussion"
  | "mainstream_hit"
  | "standard";

interface CategorizedArticle {
  title: string;
  points: number;
  comments: number;
  engagement_pattern: EngagementPattern;
}

interface CategoryAverages {
  points: number;
  comments: number;
  count: number;
}

interface EngagementPatternCounts {
  deffo: number;
  maybe: number;
  nah: number;
}

interface PreferenceAnalysis {
  averages: Record<RatingCategory, CategoryAverages>;
  preferred_engagement_patterns: string[];
  categorized_articles: Record<RatingCategory, CategorizedArticle[]>;
}

/**
 * Convert interested/superInterested booleans to rating category
 */
function categorizeRating(
  interested: boolean,
  superInterested: boolean
): RatingCategory {
  if (superInterested && interested) {
    return "deffo";
  }
  if (interested && !superInterested) {
    return "maybe";
  }
  return "nah";
}

/**
 * Categorize engagement pattern based on points and comments
 */
function categorizeEngagement(
  points: number,
  comments: number
): EngagementPattern {
  // Define thresholds
  const lowPoints = 50;
  const highPoints = 200;
  const lowComments = 10;
  const highComments = 100;

  // Define interesting patterns
  if (points >= highPoints && comments < lowComments) {
    return "sleeper_hit";
  }
  if (points >= lowPoints && comments >= highComments) {
    return "controversial";
  }
  if (points < highPoints && comments >= lowComments) {
    return "niche_discussion";
  }
  if (points >= highPoints && comments >= highComments) {
    return "mainstream_hit";
  }
  return "standard";
}

/**
 * Analyze user preferences from rated articles
 */
function analyzeUserPreferences(
  articles: UserPreference[]
): PreferenceAnalysis {
  // Categorize articles by rating
  const categorizedArticles: Record<RatingCategory, CategorizedArticle[]> = {
    deffo: [],
    maybe: [],
    nah: []
  };

  for (const article of articles) {
    const rating = categorizeRating(
      article.interested,
      article.superInterested || false
    );

    const articleData: CategorizedArticle = {
      comments: article.comments || 0,
      engagement_pattern: categorizeEngagement(
        article.points || 0,
        article.comments || 0
      ),
      points: article.points || 0,
      title: article.title
    };

    categorizedArticles[rating].push(articleData);
  }

  // Calculate averages for each category
  const averages: Record<RatingCategory, CategoryAverages> = {
    deffo: { comments: 0, count: 0, points: 0 },
    maybe: { comments: 0, count: 0, points: 0 },
    nah: { comments: 0, count: 0, points: 0 }
  };

  for (const rating of ["deffo", "maybe", "nah"] as RatingCategory[]) {
    const articlesInCategory = categorizedArticles[rating];
    if (articlesInCategory.length > 0) {
      const avgPoints =
        articlesInCategory.reduce((sum, a) => sum + a.points, 0) /
        articlesInCategory.length;
      const avgComments =
        articlesInCategory.reduce((sum, a) => sum + a.comments, 0) /
        articlesInCategory.length;
      averages[rating] = {
        comments: avgComments,
        count: articlesInCategory.length,
        points: avgPoints
      };
    }
  }

  // Analyze engagement patterns
  const engagementPatterns: Record<EngagementPattern, EngagementPatternCounts> =
    {
      controversial: { deffo: 0, maybe: 0, nah: 0 },
      mainstream_hit: { deffo: 0, maybe: 0, nah: 0 },
      niche_discussion: { deffo: 0, maybe: 0, nah: 0 },
      sleeper_hit: { deffo: 0, maybe: 0, nah: 0 },
      standard: { deffo: 0, maybe: 0, nah: 0 }
    };

  for (const [rating, articlesList] of Object.entries(categorizedArticles)) {
    for (const article of articlesList) {
      engagementPatterns[article.engagement_pattern][
        rating as RatingCategory
      ]++;
    }
  }

  // Determine preferred engagement patterns
  const preferredPatterns: string[] = [];
  for (const [pattern, counts] of Object.entries(engagementPatterns)) {
    const total = counts.deffo + counts.maybe + counts.nah;
    if (total >= 2 && counts.deffo / total >= 0.5) {
      preferredPatterns.push(pattern);
    }
  }

  return {
    averages,
    categorized_articles: categorizedArticles,
    preferred_engagement_patterns: preferredPatterns
  };
}

/**
 * Generate human-readable preference description for LLM
 */
function generatePreferenceDescription(analysis: PreferenceAnalysis): string {
  const { averages, preferred_engagement_patterns } = analysis;

  const descriptionParts: string[] = ["User typically reads:"];

  // Analyze score preference
  if (averages.deffo.count > 0) {
    const deffoPoints = averages.deffo.points;

    if (deffoPoints >= 200) {
      descriptionParts.push("- Prefers high-scoring articles (200+ points)");
    } else if (deffoPoints >= 50) {
      descriptionParts.push(
        "- Prefers medium-scoring articles (50-200 points)"
      );
    } else {
      descriptionParts.push("- Reads lower-scoring articles (under 50 points)");
    }

    // Comment preference
    const deffoComments = averages.deffo.comments;
    if (deffoComments >= 100) {
      descriptionParts.push(
        "- Prefers highly-discussed articles (100+ comments)"
      );
    } else if (deffoComments >= 10) {
      descriptionParts.push(
        "- Prefers moderately-discussed articles (10-100 comments)"
      );
    } else {
      descriptionParts.push("- Reads articles regardless of discussion level");
    }
  }

  // Engagement patterns
  if (preferred_engagement_patterns.length > 0) {
    const patternDescriptions: Record<string, string> = {
      controversial: "controversial topics (high engagement)",
      mainstream_hit: "mainstream hits (popular content)",
      niche_discussion: "niche discussions (engaged communities)",
      sleeper_hit: "sleeper hits (high points, quiet discussion)"
    };

    const patternDesc = preferred_engagement_patterns.map(
      (p) => patternDescriptions[p] || p
    );
    descriptionParts.push(`- Prefers: ${patternDesc.join(", ")}`);
  }

  return descriptionParts.join("\n");
}

/**
 * Main function to process user ratings and return analysis
 */
export function processUserRatings(preferences: UserPreference[]): {
  analysis: PreferenceAnalysis;
  llm_description: string;
  summary_stats: {
    total_articles: number;
    deffo_count: number;
    maybe_count: number;
    nah_count: number;
  };
} {
  const analysis = analyzeUserPreferences(preferences);
  const preferenceDescription = generatePreferenceDescription(analysis);

  return {
    analysis,
    llm_description: preferenceDescription,
    summary_stats: {
      deffo_count: analysis.averages.deffo.count,
      maybe_count: analysis.averages.maybe.count,
      nah_count: analysis.averages.nah.count,
      total_articles: preferences.length
    }
  };
}
