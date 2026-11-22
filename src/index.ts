import Fastify, {
    type FastifyInstance,
    type FastifyServerOptions,
    type RouteHandlerMethod,
    type RouteOptions,
    type FastifyListenOptions,
    type FastifyPluginCallback,
    type FastifyPluginAsync
} from "fastify";

export type NovoraOptions = FastifyServerOptions;
export type NovoraPlugin = FastifyPluginCallback<any> | FastifyPluginAsync<any>;

export class Novora {
    readonly server: FastifyInstance;

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

    optionsRoute(path: string, handler: RouteHandlerMethod): this {
        this.server.options(path, handler);
        return this;
    }

    head(path: string, handler: RouteHandlerMethod): this {
        this.server.head(path, handler);
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

    register(plugin: NovoraPlugin, options: Record<string, unknown> = {}): this {
        this.server.register(plugin, options);
        return this;
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
        this.server.setErrorHandler(handler);
        return this;
    }

    setNotFoundHandler(handler: RouteHandlerMethod): this {
        this.server.setNotFoundHandler(handler);
        return this;
    }

    async listen(options: FastifyListenOptions = { port: 3000, host: "127.0.0.1" }): Promise<string> {
        return this.server.listen(options);
    }

    async ready(): Promise<this> {
        await this.server.ready();
        return this;
    }

    async close(): Promise<void> {
        await this.server.close();
    }

    printRoutes(): string {
        return this.server.printRoutes();
    }

    get instance(): FastifyInstance {
        return this.server;
    }
}

export const createNovora = (options: NovoraOptions = {}): Novora => new Novora(options);

export {
    Fastify,
    type FastifyInstance,
    type FastifyListenOptions,
    type FastifyPluginAsync,
    type FastifyPluginCallback,
    type FastifyServerOptions,
    type RouteHandlerMethod,
    type RouteOptions
};

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