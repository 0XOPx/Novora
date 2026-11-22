import { describe, expect, it } from "vitest";
import { Novora } from "../src/index.js";

describe("Novora", () => {
    it("creates an application instance", () => {
        const app = new Novora({ logger: false });
        expect(app.server).toBeDefined();
        expect(app.instance).toBe(app.server);
    });

    it("registers routes", async () => {
        const app = new Novora({ logger: false });
        app.get("/health", async () => ({ status: "ok" }));
        await app.ready();
        const response = await app.server.inject({ method: "GET", url: "/health" });
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ status: "ok" });
        await app.close();
    });
});