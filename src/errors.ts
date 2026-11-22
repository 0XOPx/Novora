export class NovoraError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown;

    constructor(message: string, statusCode = 500, code = "NOVORA_ERROR", details?: unknown) {
        super(message);
        this.name = "NovoraError";
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}

export const createError = (
    statusCode: number,
    message: string,
    code = "NOVORA_ERROR",
    details?: unknown
): NovoraError => new NovoraError(message, statusCode, code, details);

export const badRequest = (message = "Bad Request", details?: unknown): NovoraError =>
    createError(400, message, "BAD_REQUEST", details);

export const unauthorized = (message = "Unauthorized"): NovoraError =>
    createError(401, message, "UNAUTHORIZED");

export const forbidden = (message = "Forbidden"): NovoraError =>
    createError(403, message, "FORBIDDEN");

export const notFound = (message = "Not Found"): NovoraError =>
    createError(404, message, "NOT_FOUND");

export const conflict = (message = "Conflict", details?: unknown): NovoraError =>
    createError(409, message, "CONFLICT", details);

export const tooManyRequests = (message = "Too Many Requests"): NovoraError =>
    createError(429, message, "TOO_MANY_REQUESTS");

export const internalServerError = (message = "Internal Server Error"): NovoraError =>
    createError(500, message, "INTERNAL_SERVER_ERROR");