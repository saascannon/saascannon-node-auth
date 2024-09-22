import { describe, expect, it } from "@jest/globals";
import { AuthenticatedUserDetails } from "./lib";

describe("AuthenticatedUserDetails.userHasPermissions", () => {
  it("should return true if user has all required permissions", () => {
    const user = new AuthenticatedUserDetails({
      permissions: ["read", "write", "delete"],
    });

    const requiredPermissions = ["read", "write"];

    const result = user.userHasPermissions(requiredPermissions);

    expect(result).toBe(true);
  });

  it("should return false if user does not have all required permissions", () => {
    const user = new AuthenticatedUserDetails({
      permissions: ["read", "write"],
    });

    const requiredPermissions = ["read", "write", "delete"];

    const result = user.userHasPermissions(requiredPermissions);

    expect(result).toBe(false);
  });

  it("should return true if user has all required permissions together", () => {
    const user = new AuthenticatedUserDetails({
      permissions: ["read", "write", "delete"],
    });

    const requiredPermissions = [["read", "write"]];

    const result = user.userHasPermissions(requiredPermissions);

    expect(result).toBe(true);
  });

  it("should return false if user does not have all required permissions together", () => {
    const user = new AuthenticatedUserDetails({
      permissions: ["read", "write"],
    });

    const requiredPermissions = [["read", "write", "delete"]];

    const result = user.userHasPermissions(requiredPermissions);

    expect(result).toBe(false);
  });

  it("should return true if user has any of all required permissions together", () => {
    const user = new AuthenticatedUserDetails({
      permissions: ["delete"],
    });

    const requiredPermissions = [["read", "write"], ["delete"]];

    const result = user.userHasPermissions(requiredPermissions);

    expect(result).toBe(true);
  });

  it("should return false if user does not have any of all required permissions together", () => {
    const user = new AuthenticatedUserDetails({
      permissions: ["read"],
    });

    const requiredPermissions = [
      ["write", "delete"],
      ["read", "write"],
    ];

    const result = user.userHasPermissions(requiredPermissions);

    expect(result).toBe(false);
  });
});
