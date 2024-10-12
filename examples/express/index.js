import express from "express";
import dotenv from "dotenv";
import { SaascannonAuth } from "../../dist/lib.js";
import { expressAuthGuard } from "../../dist/express.js";

dotenv.config();

const app = express();

const port = 3030;

// set the view engine to ejs
app.set("view engine", "ejs");

/**
 * Single page application (only actually one page for login example)
 */
app.get("/", (_req, res) => {
  res.render("index", {
    config: {
      clientId: process.env["SAASCANNON_CLIENT_ID"] || undefined,
      domain: process.env["SAASCANNON_DOMAIN"] || undefined,
      uiBaseUrl:
        process.env["SAASCANNON_UI_BASE_URL"] || "https://ui.saascannon.com",
    },
  });
});

/**
 * Setup the Saascannon Auth Guard
 */

const saascannonTenantDomain = process.env["SAASCANNON_DOMAIN"];

if (!saascannonTenantDomain) {
  throw new Error("Missing SAASCANNON_DOMAIN environment variable");
}

const scAuth = new SaascannonAuth(saascannonTenantDomain);

const { verifyUserCredential, verifyUserPermissions } = expressAuthGuard();

app.use(verifyUserCredential(scAuth));

app.post(
  "/protected-endpoint-1",
  verifyUserPermissions(
    [["posts:publish"], ["admin"]],
    "This endpoint requires the posts:publish or admin permission",
  ),
  (_req, res) => {
    res.json({ message: "You have the permissions!" });
  },
);

app.post(
  "/protected-endpoint-2",
  verifyUserPermissions(
    [["posts:publish", "posts:read"], ["admin"]],
    "This endpoint requires the posts:publish and posts:read or admin permission",
  ),
  (_req, res) => {
    res.json({ message: "You have the permissions!" });
  },
);

// Handle Errors
app.use((err, _req, res, _next) => {
  // User is not authenticated
  if (err.code === "unauthenticated") {
    return res.status(401).json({ message: err.message });
  }

  // Insufficient permissions
  if (err.code === "unauthorized") {
    return res.status(403).json({ message: err.message });
  }

  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
