import {
  BatchSpanProcessor,
  type SpanProcessor
} from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import * as Sentry from "@sentry/nextjs";
import { registerOTel } from "@vercel/otel";
import { LangfuseExporter } from "langfuse-vercel";

function buildLangfuseExporter(): LangfuseExporter | undefined {
  if (
    process.env.LANGFUSE_BASEURL &&
    process.env.LANGFUSE_PUBLIC_KEY &&
    process.env.LANGFUSE_SECRET_KEY
  ) {
    return new LangfuseExporter({
      baseUrl: process.env.LANGFUSE_BASEURL,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      secretKey: process.env.LANGFUSE_SECRET_KEY
    });
  }
  return undefined;
}

export async function register() {
  // Build langfuse exporter if environment variables are set
  const langfuseExporter = buildLangfuseExporter();
  const shouldEnableSentry = process.env.NODE_ENV === "production";

  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (shouldEnableSentry) {
      // configure Sentry and OpenTelemetry providers
      const {
        baseSentrySpanProcessor,
        sentryPropagator,
        sentrySampler,
        sentryContextManager
      } = await import("../sentry.server.config");

      const spanProcessors: SpanProcessor[] = [baseSentrySpanProcessor];
      if (langfuseExporter) {
        spanProcessors.push(new BatchSpanProcessor(langfuseExporter));
      }
      const provider = new NodeTracerProvider({
        sampler: sentrySampler,
        spanProcessors
      });

      provider.register({
        contextManager: sentryContextManager,
        propagator: sentryPropagator
      });

      Sentry.validateOpenTelemetrySetup();
    }
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }

  // Register OpenTelemetry with Vercel
  registerOTel({
    serviceName: "homebrew-hn",
    // If sentry is enabled, we'll have registered the langfuse exporter in the NodeTracerProvider
    // so we don't need to enable it here
    traceExporter: shouldEnableSentry ? undefined : langfuseExporter
  });
}

export const onRequestError = Sentry.captureRequestError;
