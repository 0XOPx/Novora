# Novora

A feature-rich Node.js and Bun web framework with first-class JavaScript and TypeScript support.

## Runtime support

| Runtime | JavaScript | TypeScript |
| --- | --- | --- |
| Node.js 20+ | Supported | Supported through `tsx` or compiled output |
| Bun 1.2+ | Supported | Supported natively |

## Installation

```bash
npm install novora
```

```bash
bun add novora
```

## Quick start

```js
import { Novora } from "novora";

const app = new Novora({ logger: true });

app.get("/", async (request, reply) => {
    return reply.send({ message: "Hello from Novora!" });
});

await app.listen({ port: 3000, host: "0.0.0.0" });
```

## TypeScript

```ts
import { Novora } from "novora";

const app = new Novora({ logger: true });

app.get<{ Params: { id: string } }>("/users/:id", async (request, reply) => {
    return reply.send({ id: request.params.id });
});

await app.listen({ port: 3000, host: "0.0.0.0" });
```

## Features

- Fastify-powered HTTP server and routing
- JavaScript and TypeScript declarations
- Node.js and Bun runtime targets
- CORS, security headers, compression, cookies, and rate limiting
- Multipart uploads and static file serving
- Zod request validation
- JWT authentication
- WebSocket support
- OpenAPI and Swagger UI
- Structured logging
- Plugin registration
- Vitest test suite
- Cross-runtime GitHub Actions checks

## Development

```bash
npm install
npm run build
npm test
```

With Bun:

```bash
bun install
bun run build
bun test
```

## License

MIT