export class DomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "DomainError";
    this.code = code;
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id?: string) {
    super("NOT_FOUND", id ? `${entity} introuvable (${id})` : `${entity} introuvable`);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super("VALIDATION", message);
    this.name = "ValidationError";
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super("CONFLICT", message);
    this.name = "ConflictError";
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "Non autorisé") {
    super("UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "Accès refusé") {
    super("FORBIDDEN", message);
    this.name = "ForbiddenError";
  }
}
