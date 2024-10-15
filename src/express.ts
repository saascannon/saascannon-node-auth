import express, { NextFunction, Response, RequestHandler } from "express";
import { AuthenticatedUserDetails, SaascannonAuth } from "./lib";
import { UnauthenticatedError, UnauthorisedError } from "./errors";
import * as jose from "jose";

type ExpressAuthGuardOptions<AuthKey extends string> = {
  requestUserKey: AuthKey;
};

export type Request<AuthKey extends string = "auth"> = express.Request & {
  [key in AuthKey]?: AuthenticatedUserDetails;
};

export function expressAuthGuard<
  AuthKey extends string = "auth",
  R extends Request<AuthKey> = Request<AuthKey>, // Use your custom `Request<AuthKey>` type directly
>(
  options: ExpressAuthGuardOptions<AuthKey> = {
    requestUserKey: "auth" as AuthKey,
  },
) {
  const verifyUserCredential = (
    scAuth: SaascannonAuth,
    jwtVerifyOptions?: jose.JWTVerifyOptions,
  ): RequestHandler => {
    return async (req: express.Request, _res: Response, next: NextFunction) => {
      const userAccessToken = req.headers.authorization;

      if (!userAccessToken) {
        return next(new UnauthenticatedError());
      }

      if (!userAccessToken.startsWith("Bearer ")) {
        return next(
          new UnauthenticatedError(
            "Invalid token format. Expected Bearer token.",
          ),
        );
      }

      const extractedToken = userAccessToken.slice(7);

      try {
        const jwtPayload = await scAuth.verifyUserToken(
          extractedToken,
          jwtVerifyOptions,
        );

        // Explicitly cast `req` to `R` and assign the JWT payload to the `AuthKey` field
        (req as R)[options.requestUserKey] = jwtPayload as R[AuthKey];
        next();
      } catch (error) {
        return next(new UnauthenticatedError());
      }
    };
  };

  const verifyUserPermissions = (
    requiredPermissions: string | string[] | string[][],
    errorMessage?: string,
  ): RequestHandler => {
    return (req: express.Request, _res: Response, next: NextFunction) => {
      // Ensure the `req` object is cast to `R` and access the user through `AuthKey`
      const user = (req as R)[options.requestUserKey];

      if (!user) {
        return next(new UnauthenticatedError());
      }

      if (!user.userHasPermissions(requiredPermissions)) {
        return next(new UnauthorisedError(errorMessage));
      }

      next();
    };
  };

  return {
    verifyUserCredential,
    verifyUserPermissions,
  };
}
