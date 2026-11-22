import dotenv from "dotenv";
import type { ZodType } from "zod";

export type ConfigOptions<T> = {
    schema: ZodType<T>;
    path?: string;
    override?: boolean;
};

export const loadConfig = <T>(options: ConfigOptions<T>): T => {
    if (options.path) {
        dotenv.config({ path: options.path, override: options.override ?? false });
    } else {
        dotenv.config({ override: options.override ?? false });
    }
    return options.schema.parse(process.env);
};

export const parseConfig = <T>(source: Record<string, unknown>, schema: ZodType<T>): T =>
    schema.parse(source);