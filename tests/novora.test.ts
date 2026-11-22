import { afterEach, describe, expect, it } from "vitest";
import { Novora, Router, TTLCache, createError, validate, z } from "../src/index.js";

describe("Novora application", () => {
    let app: Novora | undefined;

    afterEach(async () => {
        if (app) await app.close();
        app = undefined;
    });

    it("creates an application instance", () => {
        app = new Novora({ logger: false });
        expect(app.server).toBeDefined();
        expect(app.instance).toBe(app.server);
    });

    it("serves routes through injection", async () => {
        app = new Novora({ logger: false });
        app.get("/health", async () => ({ status: "ok" }));
        const response = await app.inject({ method: "GET", url: "/health" });
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ status: "ok" });
    });

    it("supports grouped routes", async () => {
        app = new Novora({ logger: false });
        app.group("/api/v1", router => {
            router.get("/status", async () => ({ status: "ready" }));
        });
        const response = await app.inject("/api/v1/status");
        expect(response.json()).toEqual({ status: "ready" });
    });

    it("supports router mounting", async () => {
        app = new Novora({ logger: false });
        const router = new Router("/items");
        router.get("/", async () => [{ id: 1 }]);
        app.mount(router);
        const response = await app.inject("/items/");
        expect(response.json()).toEqual([{ id: 1 }]);
    });

    it("provides a health endpoint", async () => {
        app = new Novora({ logger: false });
        app.health();
        const response = await app.inject("/health");
        expect(response.statusCode).toBe(200);
        expect(response.json().status).toBe("ok");
    });

    it("supports plugin registration aliases", async () => {
        app = new Novora({ logger: false });
        app.use(async instance => {
            instance.decorate("featureEnabled", true);
        });
        await app.ready();
        expect(app.server.hasDecorator("featureEnabled")).toBe(true);
    });

    it("maps NovoraError responses", async () => {
        app = new Novora({ logger: false });
        app.setErrorHandler(error => {
            throw error;
        });
        app.get("/failure", async () => {
            throw createError(418, "Teapot", "TEAPOT");
        });
        const response = await app.inject("/failure");
        expect(response.statusCode).toBe(418);
        expect(response.json().error).toBe("TEAPOT");
    });
});

describe("TTLCache", () => {
    it("stores, retrieves, and removes values", () => {
        const cache = new TTLCache<string>();
        cache.set("name", "Novora");
        expect(cache.get("name")).toBe("Novora");
        expect(cache.has("name")).toBe(true);
        expect(cache.delete("name")).toBe(true);
        expect(cache.get("name")).toBeUndefined();
    });

    it("supports getOrSet and prefix clearing", () => {
        const cache = new TTLCache<number>();
        expect(cache.getOrSet("api:a", () => 10)).toBe(10);
        expect(cache.getOrSet("api:a", () => 20)).toBe(10);
        cache.set("api:b", 30);
        expect(cache.clearPrefix("api:")).toBe(2);
        expect(cache.size).toBe(0);
    });

    it("expires values", async () => {
        const cache = new TTLCache<string>();
        cache.set("short", "lived", 1);
        await new Promise(resolve => setTimeout(resolve, 5));
        expect(cache.get("short")).toBeUndefined();
    });
});

describe("Validation", () => {
    it("returns validation errors for invalid payloads", async () => {
        const app = new Novora({ logger: false });
        app.route({ method: "POST", url: "/users", preHandler: validate({ body: z.object({ name: z.string() }) }), handler: async () => ({ ok: true }) });
        const response = await app.inject({ method: "POST", url: "/users", payload: { name: 42 } });
        expect(response.statusCode).toBe(400);
        await app.close();
    });
});