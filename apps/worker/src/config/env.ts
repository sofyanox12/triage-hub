import { resolve } from 'node:path'
import { config } from 'dotenv'
import { z } from 'zod'

config({ path: resolve(process.cwd(), '.env') })
config({ path: resolve(process.cwd(), '../../.env') })

const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
    DATABASE_URL: z.string(),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    LOG_LEVEL: z
        .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
        .default('info'),

    AI_PROVIDER: z.enum(['openai', 'gemini', 'mock']).default('mock'),
    AI_API_KEY: z.string().optional(),
    AI_MODEL: z.string().default('gpt-4o-mini'),
    AI_PROVIDER_URL: z.string().optional(),

    AI_TIMEOUT_MS: z.coerce.number().default(15000),
    WORKER_PROCESSING_DELAY_MS: z.coerce.number().default(0),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
    process.stderr.write(
        `Invalid Worker environment: ${JSON.stringify(parsed.error.flatten().fieldErrors)}\n`
    )
    process.exit(1)
}

const env = parsed.data

export { env }
