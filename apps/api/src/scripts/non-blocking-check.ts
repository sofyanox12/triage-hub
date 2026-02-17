const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:4000'
const API_URL = `${BASE_URL}/api`
const THRESHOLD_IN_MS = Number(process.env.INGEST_THRESHOLD_MS ?? 100)

/**
 * Payload to check non-blocking ingestion
 * @param idx Index of the payload
 * @returns Payload for non-blocking ingestion check
 */
const payload = (idx: number) => ({
    title: `Non-blocking check ${idx}`,
    description:
        'Verifying POST /api/tickets remains fast while worker intentionally delays processing.',
    urgency: 'MEDIUM',
    sentiment: 5,
    category: 'TECHNICAL',
})

const nowMs = () => Number(process.hrtime.bigint() / 1_000_000n)

/**
 * Run non-blocking ingestion check
 */
const run = async () => {
    if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
        throw new Error('TEST_USER_EMAIL or TEST_USER_PASSWORD is not defined')
    }

    const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            email: process.env.TEST_USER_EMAIL,
            password: process.env.TEST_USER_PASSWORD,
        }),
    })

    if (!loginResponse.ok) {
        throw new Error(`Login failed: ${await loginResponse.text()}`)
    }

    const { data } = (await loginResponse.json()) as {
        data: { accessToken: string }
    }
    const token = data.accessToken

    const requests = Array.from({ length: 5 }, (_, idx) => idx + 1)

    const checkPromises = requests.map(async (idx) => {
        const started = nowMs()
        const response = await fetch(`${API_URL}/tickets`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload(idx)),
        })

        const elapsed = nowMs() - started
        if (!response.ok) {
            const text = await response.text()
            throw new Error(
                `Request ${idx} failed (${response.status}): ${text}`
            )
        }

        return elapsed
    })

    const latencies = await Promise.all(checkPromises)

    const max = Math.max(...latencies)
    const avg =
        latencies.reduce((total, current) => total + current, 0) /
        latencies.length

    process.stdout.write(
        `POST /api/tickets latencies (ms): [${latencies.join(', ')}], avg=${avg.toFixed(2)}, max=${max}\n`
    )

    if (max > THRESHOLD_IN_MS) {
        throw new Error(
            `Non-blocking SLA failed: max latency ${max}ms exceeds threshold ${THRESHOLD_IN_MS}ms`
        )
    }

    process.stdout.write('Non-blocking ingestion check PASSED\n')
}

run().catch((error) => {
    const message =
        error instanceof Error
            ? error.message
            : 'unknown non-blocking check error'
    process.stderr.write(`${message}\n`)
    process.exit(1)
})
