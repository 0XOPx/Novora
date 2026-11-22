import type { FastifyReply, FastifyRequest } from "fastify";
import type { ZodType } from "zod";

export type ValidationSchemas = Partial<{
    body: ZodType;
    params: ZodType;
    query: ZodType;
    headers: ZodType;
}>;

export type ValidationFailure = {
    error: "VALIDATION_ERROR";
    message: string;
    issues: unknown[];
};

export const validate = (schemas: ValidationSchemas) => async (
    request: FastifyRequest,
    reply: FastifyReply
): Promise<unknown> => {
    for (const key of ["body", "params", "query", "headers"] as const) {
        const schema = schemas[key];
        if (!schema) continue;
        const result = schema.safeParse(request[key]);
        if (!result.success) {
            const failure: ValidationFailure = {
                error: "VALIDATION_ERROR",
                message: `Invalid request ${key}`,
                issues: result.error.issues
            };
            return reply.code(400).send(failure);
        }
        Object.assign(request, { [key]: result.data });
    }
};

export const validateWith = validate;