import { z } from 'zod'

/**
 * Result of the AI analysis process.
 */
export interface AiAnalysisResult {
    sentiment: number
    urgency: 'LOW' | 'MEDIUM' | 'HIGH'
    category: 'BILLING' | 'TECHNICAL' | 'FEATURE_REQUEST'
    draft: string
}

export const analysisSchema = z.object({
    sentiment: z.number().min(1).max(10),
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    category: z.enum(['BILLING', 'TECHNICAL', 'FEATURE_REQUEST']),
    draft: z.string().min(10),
})

/**
 * Configuration for AI providers.
 */
export interface AiConfig {
    apiKey?: string
    model: string
    baseUrl?: string
    timeoutMs: number
}

/**
 * Logger interface used inside AI adapters.
 */
export interface AiLogger {
    info(obj: object | string, msg?: string): void
    error(obj: object | string, msg?: string): void
}

/**
 * Unified AI Adapter interface.
 */
export interface AiAdapter {
    analyzeTicket(title: string, description: string): Promise<AiAnalysisResult>
}
