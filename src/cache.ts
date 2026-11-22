export type CacheOptions = {
    defaultTtl?: number;
    maxEntries?: number;
};

type CacheEntry<T> = {
    value: T;
    expiresAt: number;
};

export class TTLCache<T = unknown> {
    private readonly entries = new Map<string, CacheEntry<T>>();
    private readonly defaultTtl: number;
    private readonly maxEntries: number;

    constructor(options: CacheOptions = {}) {
        this.defaultTtl = options.defaultTtl ?? 60_000;
        this.maxEntries = options.maxEntries ?? 10_000;
    }

    set(key: string, value: T, ttl = this.defaultTtl): this {
        if (!Number.isFinite(ttl) || ttl < 0) {
            throw new RangeError("TTL must be a non-negative finite number");
        }
        this.deleteExpired();
        if (!this.entries.has(key) && this.entries.size >= this.maxEntries) {
            const oldest = this.entries.keys().next().value;
            if (oldest !== undefined) this.entries.delete(oldest);
        }
        this.entries.set(key, { value, expiresAt: ttl === 0 ? Number.POSITIVE_INFINITY : Date.now() + ttl });
        return this;
    }

    get(key: string): T | undefined {
        const entry = this.entries.get(key);
        if (!entry) return undefined;
        if (entry.expiresAt <= Date.now()) {
            this.entries.delete(key);
            return undefined;
        }
        return entry.value;
    }

    has(key: string): boolean {
        return this.get(key) !== undefined;
    }

    delete(key: string): boolean {
        return this.entries.delete(key);
    }

    clear(): void {
        this.entries.clear();
    }

    clearPrefix(prefix: string): number {
        let removed = 0;
        for (const key of this.entries.keys()) {
            if (key.startsWith(prefix)) {
                this.entries.delete(key);
                removed++;
            }
        }
        return removed;
    }

    get size(): number {
        this.deleteExpired();
        return this.entries.size;
    }

    getOrSet(key: string, factory: () => T, ttl = this.defaultTtl): T {
        const existing = this.get(key);
        if (existing !== undefined) return existing;
        const value = factory();
        this.set(key, value, ttl);
        return value;
    }

    private deleteExpired(): void {
        const now = Date.now();
        for (const [key, entry] of this.entries) {
            if (entry.expiresAt <= now) this.entries.delete(key);
        }
    }
}

export const createCache = <T = unknown>(options: CacheOptions = {}): TTLCache<T> => new TTLCache<T>(options);