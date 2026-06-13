import path from "node:path";
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use session-mode pooler (port 5432) for migrations/schema push
    // Runtime uses DATABASE_URL (port 6543 transaction pooler) via schema.prisma
    url: process.env["DIRECT_URL"],
  },
});
