/**
 * Server configuration and environment validation
 */

import { DEFAULT_PORT, DEFAULT_MODEL } from "@shared/constants";

/**
 * Validates and returns server configuration from environment variables
 */
export function getServerConfig() {
  const port = parseInt(process.env.PORT || String(DEFAULT_PORT), 10);
  const nodeEnv = process.env.NODE_ENV || "development";
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const openaiModel = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  return {
    port: isNaN(port) ? DEFAULT_PORT : port,
    nodeEnv: nodeEnv as "development" | "production" | "test",
    openai: {
      apiKey: openaiApiKey,
      model: openaiModel,
      enabled: !!openaiApiKey,
    },
  };
}

