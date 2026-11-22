import { Novora, cors, helmet, compress, rateLimit, z, validate } from "novora";

const app = new Novora({ logger: true });

await app.register(cors, { origin: true });
await app.register(helmet);
await app.register(compress);
await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });

app.health();

app.get("/", async () => ({
    name: "Novora",
    version: "1.0.0",
    runtime: process.versions.bun ? "bun" : "node"
}));

app.group("/api/v1", router => {
    router.get("/users/:id", async request => ({
        id: request.params.id
    }));
});

app.route({
    method: "POST",
    url: "/api/v1/users",
    preHandler: validate({
        body: z.object({
            name: z.string().min(1),
            email: z.string().email()
        })
    }),
    handler: async request => ({
        created: true,
        user: request.body
    })
});

await app.listen(Number(process.env.PORT ?? 3000));