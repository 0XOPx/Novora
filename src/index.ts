import Fastify, {
    type FastifyInstance,
    type FastifyServerOptions,
    type RouteHandlerMethod,
    type RouteOptions,
    type FastifyListenOptions,
    type FastifyPluginCallback,
    type FastifyPluginAsync,
    type InjectOptions,
    type InjectResponse
} from "fastify";
import { TTLCache } from "./cache.js";
import { validate, type ValidationSchemas } from "./validation.js";
import { NovoraError, createError } from "./errors.js";

export type NovoraOptions = FastifyServerOptions;
export type NovoraPlugin = FastifyPluginCallback<any> | FastifyPluginAsync<any>;

const joinPath = (prefix: string, path: string): string => {
    const left = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
    const right = path.startsWith("/") ? path : `/${path}`;
    return `${left}${right}` || "/";
};

export class Router {
    readonly prefix: string;
    private readonly routes: RouteOptions[] = [];

    constructor(prefix = "") {
        this.prefix = prefix;
    }

    route(options: RouteOptions): this {
        this.routes.push({ ...options, url: joinPath(this.prefix, options.url) });
        return this;
    }

    get(path: string, handler: RouteHandlerMethod): this {
        return this.route({ method: "GET", url: path, handler });
    }

    post(path: string, handler: RouteHandlerMethod): this {
        return this.route({ method: "POST", url: path, handler });
    }

    put(path: string, handler: RouteHandlerMethod): this {
        return this.route({ method: "PUT", url: path, handler });
    }

    patch(path: string, handler: RouteHandlerMethod): this {
        return this.route({ method: "PATCH", url: path, handler });
    }

    delete(path: string, handler: RouteHandlerMethod): this {
        return this.route({ method: "DELETE", url: path, handler });
    }

    head(path: string, handler: RouteHandlerMethod): this {
        return this.route({ method: "HEAD", url: path, handler });
    }

    options(path: string, handler: RouteHandlerMethod): this {
        return this.route({ method: "OPTIONS", url: path, handler });
    }

    all(path: string, handler: RouteHandlerMethod): this {
        return this.route({ method: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"], url: path, handler });
    }

    mount(router: Router): this {
        for (const route of router.routes) {
            this.routes.push({ ...route, url: joinPath(this.prefix, route.url) });
        }
        return this;
    }

    get definitions(): readonly RouteOptions[] {
        return this.routes;
    }
}

export class Novora {
    readonly server: FastifyInstance;
    readonly cache = new TTLCache();

    constructor(options: NovoraOptions = {}) {
        this.server = Fastify(options);
    }

    get(path: string, handler: RouteHandlerMethod): this {
        this.server.get(path, handler);
        return this;
    }

    post(path: string, handler: RouteHandlerMethod): this {
        this.server.post(path, handler);
        return this;
    }

    put(path: string, handler: RouteHandlerMethod): this {
        this.server.put(path, handler);
        return this;
    }

    patch(path: string, handler: RouteHandlerMethod): this {
        this.server.patch(path, handler);
        return this;
    }

    delete(path: string, handler: RouteHandlerMethod): this {
        this.server.delete(path, handler);
        return this;
    }

    head(path: string, handler: RouteHandlerMethod): this {
        this.server.head(path, handler);
        return this;
    }

    options(path: string, handler: RouteHandlerMethod): this {
        this.server.options(path, handler);
        return this;
    }

    all(path: string, handler: RouteHandlerMethod): this {
        this.server.all(path, handler);
        return this;
    }

    route(options: RouteOptions): this {
        this.server.route(options);
        return this;
    }

    mount(router: Router): this {
        for (const route of router.definitions) {
            this.server.route(route);
        }
        return this;
    }

    group(prefix: string, configure: (router: Router) => void): this {
        const router = new Router(prefix);
        configure(router);
        return this.mount(router);
    }

    register(plugin: NovoraPlugin, options: Record<string, unknown> = {}): this {
        this.server.register(plugin, options);
        return this;
    }

    use(plugin: NovoraPlugin, options: Record<string, unknown> = {}): this {
        return this.register(plugin, options);
    }

    addHook(name: any, hook: any): this {
        this.server.addHook(name, hook);
        return this;
    }

    decorate(name: string, value: unknown): this {
        this.server.decorate(name, value);
        return this;
    }

    setErrorHandler(handler: (error: Error, request: any, reply: any) => unknown): this {
        this.server.setErrorHandler((error, request, reply) => {
            if (error instanceof NovoraError) {
                return reply.code(error.statusCode).send({
                    error: error.code,
                    message: error.message,
                    details: error.details
                });
            }
            return handler(error, request, reply);
        });
        return this;
    }

    setNotFoundHandler(handler: RouteHandlerMethod): this {
        this.server.setNotFoundHandler(handler);
        return this;
    }

    validate(schemas: ValidationSchemas): ReturnType<typeof validate> {
        return validate(schemas);
    }

    health(path = "/health"): this {
        this.get(path, async () => ({
            status: "ok",
            runtime: process.versions.bun ? "bun" : "node",
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        }));
        return this;
    }

    async listen(options?: FastifyListenOptions | number): Promise<string> {
        const listenOptions = typeof options === "number"
            ? { port: options, host: "0.0.0.0" }
            : options ?? { port: 3000, host: "127.0.0.1" };
        return this.server.listen(listenOptions);
    }

    async ready(): Promise<this> {
        await this.server.ready();
        return this;
    }

    async close(): Promise<void> {
        await this.server.close();
    }

    async inject(options: string | InjectOptions): Promise<InjectResponse> {
        return this.server.inject(options);
    }

    printRoutes(): string {
        return this.server.printRoutes();
    }

    get instance(): FastifyInstance {
        return this.server;
    }
}

export const createNovora = (options: NovoraOptions = {}): Novora => new Novora(options);
export const createRouter = (prefix = ""): Router => new Router(prefix);
export { TTLCache, validate, NovoraError, createError };
export type { ValidationSchemas };
export type { FastifyInstance, FastifyListenOptions, FastifyPluginAsync, FastifyPluginCallback, FastifyServerOptions, RouteHandlerMethod, RouteOptions, InjectOptions, InjectResponse };
export { Fastify };
export { default as cors } from "@fastify/cors";
export { default as helmet } from "@fastify/helmet";
export { default as compress } from "@fastify/compress";
export { default as cookie } from "@fastify/cookie";
export { default as multipart } from "@fastify/multipart";
export { default as rateLimit } from "@fastify/rate-limit";
export { default as staticFiles } from "@fastify/static";
export { default as jwt } from "@fastify/jwt";
export { default as websocket } from "@fastify/websocket";
export { default as swagger } from "@fastify/swagger";
export { default as swaggerUI } from "@fastify/swagger-ui";
export { z } from "zod";
export { default as bcrypt } from "bcryptjs";
export { default as cron } from "node-cron";
export { default as Handlebars } from "handlebars";
export { default as Redis } from "ioredis";
export { default as jwtLibrary } from "jsonwebtoken";
export { default as nodemailer } from "nodemailer";
export { Server as SocketIOServer } from "socket.io";
export { default as sharp } from "sharp";
export { default as dotenv } from "dotenv";
export { default as pino } from "pino";
export { graphql, buildSchema, parse, validate as validateGraphQL, execute } from "graphql";