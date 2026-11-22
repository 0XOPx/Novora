# Novora

Novora is a feature-rich web framework for building APIs and web servers with **Node.js or Bun**, using **JavaScript or TypeScript**.

## Runtime support

| Runtime | JavaScript | TypeScript |
| --- | --- | --- |
| Node.js 20+ | Supported | Supported with tsx or compiled output |
| Bun 1.2+ | Supported | Native execution |

## Installation

Install from the GitHub release source:

```bash
npm install github:0XOPx/Novora
```

```bash
bun add github:0XOPx/Novora
```

## Quick start

```js
import { Novora, cors, helmet, compress, rateLimit } from "novora";

const app = new Novora({ logger: true });

await app.register(cors, { origin: true });
await app.register(helmet);
await app.register(compress);
await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });

app.get("/", async (request, reply) => {
    return reply.send({ message: "Hello from Novora!" });
});

app.health();

await app.listen(3000);
```

## TypeScript

```ts
import { Novora, z, validate } from "novora";

const app = new Novora({ logger: true });

app.post("/users", {
    preHandler: validate({
        body: z.object({
            name: z.string().min(1),
            email: z.string().email()
        })
    })
}, async request => {
    return { created: true, user: request.body };
});

await app.listen({ port: 3000, host: "0.0.0.0" });
```

## Routing

```ts
import { Novora, Router } from "novora";

const app = new Novora();
const api = new Router("/api/v1");

api.get("/status", async () => ({ status: "ok" }));
api.get("/users/:id", async request => ({ id: request.params.id }));

app.mount(api);

app.group("/admin", router => {
    router.get("/dashboard", async () => ({ page: "dashboard" }));
});

await app.listen(3000);
```

Supported methods include `get`, `post`, `put`, `patch`, `delete`, `head`, `options`, `all`, and `route`.

## Built-in utilities

### Validation

Novora exports Zod and a Fastify pre-handler:

```ts
import { z, validate } from "novora";

const userValidation = validate({
    body: z.object({
        username: z.string().min(3),
        age: z.number().int().min(13)
    })
});
```

Invalid requests receive a structured HTTP 400 response.

### Cache

```ts
import { TTLCache } from "novora";

const cache = new TTLCache<string>({ defaultTtl: 30_000, maxEntries: 500 });
cache.set("welcome", "Hello!", 10_000);
const message = cache.get("welcome");
```

### Configuration

```ts
import { loadConfig, z } from "novora";

const config = loadConfig({
    schema: z.object({
        PORT: z.coerce.number().default(3000),
        NODE_ENV: z.enum(["development", "production", "test"]).default("development")
    })
});
```

### Errors

```ts
import { createError, notFound } from "novora";

throw notFound("User does not exist");
throw createError(422, "Invalid data", "INVALID_DATA");
```

Install a Novora-aware error handler with `app.setErrorHandler(handler)` to serialize `NovoraError` instances.

## Included integrations

Novora re-exports commonly used libraries and Fastify plugins:

- **HTTP and routing:** Fastify
- **Security:** Helmet, CORS, cookies, JWT, bcrypt
- **Traffic and performance:** compression, rate limiting, Pino logging
- **Files:** multipart uploads, static files, Sharp image processing
- **Realtime:** WebSocket and Socket.IO
- **API documentation:** OpenAPI and Swagger UI
- **Data and utilities:** Zod, Redis, GraphQL, Handlebars, dotenv
- **Background tasks:** node-cron
- **Email:** Nodemailer

Register Fastify plugins using `app.register(plugin, options)` or `app.use(plugin, options)`.

## Application API

- `new Novora(options)`
- `app.get/post/put/patch/delete/head/options/all(path, handler)`
- `app.route(options)`
- `app.group(prefix, callback)`
- `app.mount(router)`
- `app.register(plugin, options)` and `app.use(plugin, options)`
- `app.addHook(name, hook)`
- `app.decorate(name, value)`
- `app.health(path)`
- `app.validate(schemas)`
- `app.listen(portOrOptions)`
- `app.inject(options)`
- `app.ready()`, `app.close()`, `app.printRoutes()`
- `app.server` and `app.instance` expose the underlying Fastify instance

## Development

Node.js:

```bash
npm install
npm run typecheck
npm run build
npm test
```

Bun:

```bash
bun install
bun run typecheck
bun run build
bun run test
```

## Release

Push a version tag such as `v1.0.0`. GitHub Actions runs type checking, tests, builds the package, creates a tarball, and publishes a GitHub Release.

## License

MIT