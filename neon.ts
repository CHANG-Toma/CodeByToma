import { defineConfig } from "@neon/config/v1";

/** Postgres only — app already has its own dashboard auth (JWT). */
export default defineConfig({
  auth: false,
  branch: (branch) => {
    if (branch.isDefault) {
      return {};
    }
    if (!branch.exists) {
      return { ttl: "7d" };
    }
    return {};
  },
});
