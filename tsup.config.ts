import { defineConfig } from "tsup";

export default defineConfig({
  // Configuration for the build without dependencies (Node.js or server-side)
  entry: ["src/lib.ts", "src/errors.ts", "src/express.ts"], // Entry points for the build
  outDir: "dist", // Output for the non-browser build
  format: ["esm", "cjs"], // Use the appropriate format for server build
  target: "node16", // Target node environment
  platform: "node",
  sourcemap: false,
  dts: true, // Generate .d.ts files
});
