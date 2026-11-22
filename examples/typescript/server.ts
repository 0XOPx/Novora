import { Novora, cors, helmet, compress, rateLimit } from "../../dist/index.js";

const app = new Novora({ logger: true });

await app.register(cors, { origin: true });
await app.register(helmet);
await app.register(compress);
await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });

app.get("/", async (request, reply) => {
    return reply.send({ name: "Novora", runtime: process.release?.name ?? "bun" });
});

app.get<{ Params: { id: string } }>("/users/:id", async (request, reply) => {
    return reply.send({ id: request.params.id });
});

await app.listen({ port: Number(process.env.PORT ?? 3000), host: "0.0.0.0" });