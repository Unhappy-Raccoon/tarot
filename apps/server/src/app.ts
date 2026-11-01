import Fastify from "fastify";

export function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
      redact: ["req.headers.authorization", "req.headers.cookie"]
    }
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "personal-cosmic-journal-api"
  }));

  return app;
}
