import { AiAdapter, AiAnalysisResult, AiConfig, AiLogger } from './types'
import { OpenAiAdapter } from './openai.adapter'
import { GeminiAdapter } from './gemini.adapter'

/**
 * Defines the available AI providers.
 */
export type AiProvider = 'openai' | 'gemini' | 'mock'

/**
 * A mock AI adapter for testing and development purposes.
 */
class MockAdapter implements AiAdapter {
    /**
     * Creates an instance of MockAdapter.
     * @param logger - The logger instance.
     */
    constructor(private logger: AiLogger) { }

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
        this.logger.info('ai_mock_analysis_used')
        const text = (title + description).toLowerCase()
        return {
            sentiment: 5,
            urgency: text.includes('urgent')
                ? 'HIGH'
                : text.includes('error')
                    ? 'MEDIUM'
                    : 'LOW',
            category: text.includes('bug')
                ? 'TECHNICAL'
                : text.includes('bill')
                    ? 'BILLING'
                    : 'FEATURE_REQUEST',
            draft: `Thank you for reaching out regarding "${title}". We have logged your request.`,
        }
    }
}

/**
 * Factory class for creating AI adapters based on provider.
 */
export class AiFactory {
    /**
     * Creates an AI adapter for the specified provider.
     * @param provider - The AI provider name (openai, gemini, mock).
     * @param config - Provider configuration (apiKey, model, etc).
     * @param logger - Logger instance for the adapter.
     * @returns An instance of AiAdapter.
     */
    static createAdapter(
        provider: AiProvider,
        config: AiConfig,
        logger: AiLogger
    ): AiAdapter {
        switch (provider) {
            case 'openai':
                return new OpenAiAdapter(config, logger)
            case 'gemini':
                return new GeminiAdapter(config, logger)
            case 'mock':
            default:
                return new MockAdapter(logger)
        }
    }
}
