import { Novora, cors, helmet, compress, rateLimit, z, validate, TTLCache } from "novora";

const app = new Novora({ logger: true });
const cache = new TTLCache<unknown>({ defaultTtl: 30_000 });

await app.register(cors, { origin: true });
await app.register(helmet);
await app.register(compress);
await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });

app.health();

app.get("/", async () => ({
    name: "Novora",
    version: "1.0.0",
    runtime: typeof Bun !== "undefined" ? "bun" : "node"
}));

app.group("/api/v1", router => {
    router.get("/users/:id", async request => ({
        id: request.params.id
    }));
});

app.post("/api/v1/users", {
    preHandler: validate({
        body: z.object({
            name: z.string().min(1),
            email: z.string().email()
        })
    })
}, async request => {
    const user = request.body;
    cache.set("last-user", user);
    return { created: true, user };
});

await app.listen({ port: Number(process.env.PORT ?? 3000), host: "0.0.0.0" });