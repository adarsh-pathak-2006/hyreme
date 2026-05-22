import { createServer } from "http";
import mongoose from "mongoose";
import { createApp } from "./app";
import { connectToDatabase } from "./config/db";
import { env } from "./config/env";
import { attachSocketServer } from "./socket";

async function bootstrap() {
  await connectToDatabase();
  const app = createApp();
  const server = createServer(app);
  attachSocketServer(server);

  const shutdown = async (signal: string) => {
    console.log(`${signal} received. Shutting down HYREME recruiter API...`);
    server.close(async () => {
      await mongoose.connection.close().catch(() => undefined);
      process.exit(0);
    });
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  server.listen(env.PORT, () => {
    console.log(`HYREME recruiter API listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
