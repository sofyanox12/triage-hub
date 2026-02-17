const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:4000'
const thresholdMs = Number(process.env.INGEST_THRESHOLD_MS ?? 100)

const payload = (idx: number) => ({
    title: `Non-blocking check ${idx}`,
    description:
        'Verifying POST /tickets remains fast while worker intentionally delays processing.',
    urgency: 'MEDIUM',
    sentiment: 5,
    category: 'TECHNICAL',
})

const nowMs = () => Number(process.hrtime.bigint() / 1_000_000n)

const run = async () => {
    const requests = Array.from({ length: 5 }, (_, idx) => idx + 1)

    const latencies = await Promise.all(
        requests.map(async (idx) => {
            const started = nowMs()
            const response = await fetch(`${apiBaseUrl}/tickets`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
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
    )

    const max = Math.max(...latencies)
    const avg =
        latencies.reduce((total, current) => total + current, 0) /
        latencies.length

    process.stdout.write(
        `POST /tickets latencies (ms): [${latencies.join(', ')}], avg=${avg.toFixed(2)}, max=${max}\n`
    )

    if (max > thresholdMs) {
        throw new Error(
            `Non-blocking SLA failed: max latency ${max}ms exceeds threshold ${thresholdMs}ms`
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
