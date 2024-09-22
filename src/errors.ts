export class UnauthorisedError extends Error {
  public code: string = "unauthorised";

  constructor(
    message: string = "The user does not have the required permissions.",
  ) {
    super(message);
    this.name = "UnauthorisedError";
  }
}

export class UnauthenticatedError extends Error {
  public code: string = "unauthenticated";

  constructor(message: string = "The user credentials could not be verified.") {
    super(message);
    this.name = "UnauthenticatedError";
  }
}
