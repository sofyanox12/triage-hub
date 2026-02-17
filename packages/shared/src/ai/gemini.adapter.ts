import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai'
import { AiAdapter, AiAnalysisResult, analysisSchema, AiConfig, AiLogger } from './types'

/**
 * AI adapter implementation for Google Gemini.
 */
export class GeminiAdapter implements AiAdapter {
    private client: GoogleGenerativeAI

    constructor(
        private config: AiConfig,
        private logger: AiLogger
    ) {
        if (!config.apiKey) {
            throw new Error('AI_API_KEY is required for Gemini provider')
        }
        this.client = new GoogleGenerativeAI(config.apiKey)
    }

    private static readonly SCHEMA: Schema = {
        type: SchemaType.OBJECT,
        properties: {
            sentiment: {
                type: SchemaType.NUMBER,
                description:
                    'Sentiment score from 1-10 (1=negative, 10=positive)',
            },
            urgency: {
                type: SchemaType.STRING,
                enum: ['LOW', 'MEDIUM', 'HIGH'],
                format: 'enum',
            },
            category: {
                type: SchemaType.STRING,
                enum: ['BILLING', 'TECHNICAL', 'FEATURE_REQUEST'],
                format: 'enum',
            },
            draft: {
                type: SchemaType.STRING,
                description:
                    'A polite and concise response draft to the customer',
            },
        },
        required: ['sentiment', 'urgency', 'category', 'draft'],
    }

    /**
     * Analyzes a ticket using Gemini's structured output.
     * @param title - Ticket title.
     * @param description - Ticket description.
     * @returns AI analysis result.
     */
    async analyzeTicket(
        title: string,
        description: string
    ): Promise<AiAnalysisResult> {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs)

        try {
            const model = this.client.getGenerativeModel({
                model: this.config.model,
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: GeminiAdapter.SCHEMA,
                },
            })

            const prompt = `
                You are a helpful support triage assistant. Analyze the incoming ticket and output the results.

                Ticket Title: ${title}
                Ticket Description: ${description}
            `

            const result = await model.generateContent(
                {
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                },
                { signal: controller.signal }
            )
            const response = result.response
            const text = response.text()

            if (!text) throw new Error('No content received from Gemini')

            const cleanText = text.replace(/```json|```/g, '').trim()
            return analysisSchema.parse(JSON.parse(cleanText))
        } catch (error: unknown) {
            if (error instanceof Error && error.name === 'AbortError') {
                this.logger.error(
                    { timeoutMs: this.config.timeoutMs },
                    'gemini_analysis_timeout'
                )
                throw new Error(
                    `Gemini analysis timed out after ${this.config.timeoutMs}ms`
                )
            }
            this.logger.error({ error }, 'gemini_analysis_failed')
            throw error
        } finally {
            clearTimeout(timeout)
        }
    }
}
