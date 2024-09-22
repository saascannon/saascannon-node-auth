import jose from "jose";
import { UnauthenticatedError } from "./errors";

export class AuthenticatedUserDetails {
  private jwtPayload: Record<string, any>;

  constructor(jwtPayload: Record<string, any>) {
    this.jwtPayload = jwtPayload;
  }

  public get userId() {
    return this.jwtPayload.sub;
  }

  public get email() {
    return this.jwtPayload.email;
  }

  public get permissions() {
    return this.jwtPayload.permissions;
  }

  public userHasPermissions(
    requiredPermissions: string | string[] | string[][],
  ): boolean {
    // Convert required permissions into a 2D array if it's a string or a 1D array
    const required: string[][] =
      typeof requiredPermissions === "string"
        ? ([[requiredPermissions]] as string[][])
        : Array.isArray(requiredPermissions) &&
            (requiredPermissions as unknown[]).every(
              (rp: unknown) => typeof rp === "string",
            )
          ? ([requiredPermissions] as string[][])
          : (requiredPermissions as string[][]);

    // Check if the user has all the required permissions
    return required.some((requiredTogether: string[]) =>
      requiredTogether.every((perm) => this.permissions.includes(perm)),
    );
  }
}

export class SaascannonAuth {
  private jwks: ReturnType<typeof jose.createRemoteJWKSet>;
  private domain: string;

  constructor(domain: string) {
    this.domain = domain;
    this.jwks = jose.createRemoteJWKSet(new URL(domain));
  }

  public async verifyUserToken(token: string) {
    try {
      const { payload } = await jose.jwtVerify(token, this.jwks, {
        issuer: this.domain,
      });

      return new AuthenticatedUserDetails(payload);
    } catch (error) {
      throw new UnauthenticatedError();
    }
  }
}
