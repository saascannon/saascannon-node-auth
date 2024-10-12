import { NextFunction, Response, Request as ExpressRequest } from "express";
import { AuthenticatedUserDetails, SaascannonAuth } from "./lib";
import { UnauthenticatedError, UnauthorisedError } from "./errors";

type ExpressAuthGuardOptions<AuthKey extends string> = {
  requestUserKey: AuthKey;
};

export type Request<AuthKey extends string = "auth"> = ExpressRequest & {
  [key in AuthKey]: AuthenticatedUserDetails;
};

export function expressAuthGuard<
  R extends Request<AuthKey>,
  AuthKey extends string = "auth",
>(
  options: ExpressAuthGuardOptions<AuthKey> = {
    requestUserKey: "auth" as AuthKey,
  },
) {
  const verifyUserCredential = (scAuth: SaascannonAuth) => {
    return async (req: R, _res: Response, next: NextFunction) => {
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

      const exxtractedToken = userAccessToken.slice(7);

      try {
        const jwtPayload = await scAuth.verifyUserToken(exxtractedToken);
        req[options.requestUserKey] = jwtPayload as R[AuthKey];
        next();
      } catch (error) {
        return next(new UnauthenticatedError());
      }
    };
  };

  const verifyUserPermissions = (
    requiredPermissions: string | string[] | string[][],
    errorMessage?: string, // Optionally set a specific error message for this permissions check
  ) => {
    return (req: R, _res: Response, next: NextFunction) => {
      const user = req[options.requestUserKey];

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
