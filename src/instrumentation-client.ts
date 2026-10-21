// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
    dsn: "https://11b09d72da5ce27da3a7ff5585265d18@o4507260493561856.ingest.de.sentry.io/4509603953115216",

    // Add optional integrations for additional features
    integrations: [
      Sentry.captureConsoleIntegration({
        levels: ["error", "warn"]
      })
    ],

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1
  });
}

export const onRouterTransitionStart =
  process.env.NODE_ENV === "production"
    ? Sentry.captureRouterTransitionStart
    : () => {};
