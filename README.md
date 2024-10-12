# Saascannon Auth

This package provides utility functions for verifying user authentication status and permissions guards for [saascannon](https://saascannon.com) credentials.

## Installation

```zsh
npm i @saascannon/auth
```

## Initialise the package

```ts
import { SaascannonAuth } from "@saascannon/auth";

const scAuth = new SaascannonAuth("https://your-tenant.region.saascannon.app");

// Verify credentials
const userAccessTokenDetails = scAuth.verifyUserToken("user-bearer-token");

// Verify permissions ('posts:publish' OR 'admin')
const userCanPublishPosts = userAccessTokenDetails.hasPermissionTo([
  ["posts:publish"],
  ["admin"],
]);
```

## Express Wrapper

If you are using express, you can use some pre-built wrappers for implementing saascannon auth into your service easily.

```ts
import { SaascannonAuth } from "@saascannon/auth";
import { expressAuthGuard, Request } from "@saascannon/auth/express";
import express, { Response, NextFunction } from "express";

const scAuth = new SaascannonAuth("https://your-tenant.region.saascannon.app");

const app = express();

const { verifyUserCredential, verifyUserPermissions } = expressAuthGuard({
  requestUserKey: "user", // userAccessTokenDetails will be stored in the 'user' key of the request object
});

// Ensure users are authenticated for all routes
app.use(verifyUserCredential(scAuth));

// Route with permissions middleware
app.post(
  "/posts",
  verifyUserPermissions([["posts:publish"], ["admin"]]),
  (req: Request, res: Response) => {
    if (
      req.body.restrictedField &&
      // You can also check permissions within the route
      !req.user.hasPermissionTo("posts:publish-with-rf")
    ) {
      return res.sendStatus(403);
    }

    publishPost(req.body);

    return res.sendStatus(201);
  },
);

// Handle Errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // User is not authenticated
  if (err.code === "unauthenticated") {
    return res.sendStatus(401);
  }

  // Insufficient permissions
  if (err.code === "unauthorized") {
    return res.sendStatus(403);
  }

  res.sendStatus(500);
});
```
