# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hacker News (HN) application built with Next.js that provides personalized content recommendations based on user preferences. The app analyzes Hacker News posts and categorizes them as "dive", "skim", or "skip" based on the user's profile and interests.

## Repository Structure

- `/src/app`: Next.js App Router structure with pages and API routes
  - `/api`: API endpoints for HN data fetching and processing
  - `/api/recommend`: API route for getting personalized recommendations
  - `/api/hn`: API route for fetching HN stories
  - `/api/compress`: API route for compressing user preference text
- `/src/features`: Core feature modules
  - `store.ts`: Zustand store for state management
  - `use-hn-stories.ts`: React Query hooks for data fetching
  - `localStorage.ts`: Utility for storing user preferences locally
  - `tracking.ts`: Analytics tracking
  - `preference-analysis.ts`: Logic for analyzing user preferences

## Key Technologies

- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **State Management**: Zustand with structured actions and state
- **Data Fetching**: React Query for API requests and caching
- **API Integration**: Hacker News API via Firebase
- **AI Integration**: Uses models like Gemini for content analysis
- **Styling**: Tailwind CSS
- **Code Quality**: Biome for linting and formatting







****
## Development Commands

```bash
# Install dependencies
make install
# or directly
npm install

# Start development server with turbopack (port 3002)
make run
# or directly
npm run dev

# Build for production
make build
# or directly
npm run build

# Run linting
make lint
# or directly
npm run lint

# Format code with Biome
make format
# or directly
npm run format

# Type checking
npm run check-types
```

## Key Workflows

### Content Recommendation Flow

1. User creates a profile with their preferences (via onboarding or manual input)
2. Profile is stored in localStorage using `localStorage.ts` utilities
3. When visiting the main page, `use-hn-stories.ts` hooks fetch HN stories
4. The `/api/hn/recommend` endpoint uses AI to analyze stories based on user preferences
5. Results are sorted by recommendation priority in the UI (dive > skim > skip)

### Preference Management

- User preferences are captured through an onboarding flow (`onboarding-flow.tsx`)
- Preferences are analyzed in `preference-analysis.ts` to extract key interests
- The resulting preference profile is stored in localStorage
- This profile is used to generate recommendations through the AI recommendation system

## Important Implementation Details

- The application uses a Zustand store (`store.ts`) for centralized state management
- AI recommendations are generated using models provided via ModelName in the shared lib package
- The app supports different HN post types: top, new, ask, and show
- User context preferences are compressed using the `/api/hn/compress` endpoint to optimize storage and processing

## Monorepo context

This hn_app exists within a larger monorepo structure containing multiple applications and shared packages.

### Shared Packages

The monorepo includes several shared packages that can be leveraged most importantly:

- **@repo/ui**: A comprehensive UI component library with:
  - Basic components: Button, Input, Textarea, Checkbox, Select, etc.
  - Layout components: Card, Dialog, Accordion, Tabs, etc.
  - Data visualization: BarChart, LineChart, DonutChart
  - Navigation: Sidebar, Dropdown, Command menu
  - All components follow consistent styling with Tailwind CSS

- **@repo/lib**: Shared utilities and hooks:
  - Hooks: useDebounce, useIsAllowedApp, useIsSuperuser, etc.
  - Utils: time helpers, unique ID generation, etc.

- **@repo/typescript-config**: Shared TypeScript configurations

### Other Apps in Monorepo

For reference and inspiration, check the following apps:

- **esg-assessments**: A Next.js app for ESG (Environmental, Social, Governance) assessments:
  - Uses shared UI components from @repo/ui
  - Features AI-powered document analysis
  - Document processing workflows
  - State management patterns with React Query
  - Professional reporting features

### Integration Notes

When adding new features to the HN app:
- Leverage existing UI components from @repo/ui when possible
- Use shared hooks and utilities from @repo/lib
- Reference patterns in other apps for similar features
- Follow monorepo code standards and patterns