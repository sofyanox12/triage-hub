import { AiAnalysisResult, AiFactory, AiProvider } from '@triage/shared'
import { env } from '@/config/env'
import { logger } from '@/lib/logger'

class AiService {
    async analyzeTicket(
        title: string,
        description: string
    ): Promise<AiAnalysisResult> {
        const adapter = AiFactory.createAdapter(
            env.AI_PROVIDER as AiProvider,
            {
                apiKey: env.AI_API_KEY,
                model: env.AI_MODEL,
                baseUrl: env.AI_PROVIDER_URL,
                timeoutMs: env.AI_TIMEOUT_MS,
            },
            logger
        )
        return adapter.analyzeTicket(title, description)
    }
}

export const ai = new AiService()
export type { AiAnalysisResult }
