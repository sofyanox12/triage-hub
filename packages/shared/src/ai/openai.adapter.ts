import { OpenAI } from 'openai'
import { AiAdapter, AiAnalysisResult, analysisSchema, AiConfig, AiLogger } from './types'

/**
 * AI adapter implementation for OpenAI.
 */
export class OpenAiAdapter implements AiAdapter {
    private client: OpenAI

    constructor(
        private config: AiConfig,
        private logger: AiLogger
    ) {
        if (!config.apiKey) {
            throw new Error('AI_API_KEY is required for OpenAI provider')
        }

        this.client = new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseUrl,
            timeout: config.timeoutMs,
        })
    }

    private static readonly SYSTEM_PROMPT =
        'You are a helpful support triage assistant. Analyze the incoming ticket and output the results.'

    private static readonly JSON_SCHEMA = {
        name: 'ticket_analysis',
        strict: true,
        schema: {
            type: 'object',
            properties: {
                sentiment: {
                    type: 'number',
                    description:
                        'Sentiment score from 1-10 (1=negative, 10=positive)',
                },
                urgency: {
                    type: 'string',
                    enum: ['LOW', 'MEDIUM', 'HIGH'],
                },
                category: {
                    type: 'string',
                    enum: ['BILLING', 'TECHNICAL', 'FEATURE_REQUEST'],
                },
                draft: {
                    type: 'string',
                    description:
                        'A polite and concise response draft to the customer',
                },
            },
            required: ['sentiment', 'urgency', 'category', 'draft'],
            additionalProperties: false,
        },
    }

    /**
     * Analyzes a ticket using OpenAI's JSON schema (structured output).
     * @param title - Ticket title.
     * @param description - Ticket description.
     * @returns AI analysis result.
     */
    async analyzeTicket(
        title: string,
        description: string
    ): Promise<AiAnalysisResult> {
        try {
            const response = await this.client.chat.completions.create({
                model: this.config.model,
                messages: [
                    {
                        role: 'system',
                        content: OpenAiAdapter.SYSTEM_PROMPT,
                    },
                    {
                        role: 'user',
                        content: `Ticket Title: ${title}\nTicket Description: ${description}`,
                    },
                ],
                response_format: {
                    type: 'json_schema',
                    json_schema: OpenAiAdapter.JSON_SCHEMA,
                },
                temperature: 0,
            })

            const content = response.choices[0].message.content
            if (!content) throw new Error('No content received from AI')

            return analysisSchema.parse(JSON.parse(content))
        } catch (error) {
            this.logger.error({ error }, 'openai_analysis_failed')
            throw error
        }
    }
}
