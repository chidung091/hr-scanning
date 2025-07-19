import OpenAI from 'openai'
import env from '#start/env'

export interface OpenAIConfig {
  apiKey: string
  model: string
  maxTokens: number
  temperature: number
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export default class OpenAIService {
  private client: OpenAI
  private config: OpenAIConfig

  constructor() {
    this.config = {
      apiKey: env.get('OPENAI_API_KEY', ''),
      model: env.get('OPENAI_MODEL', 'gpt-4o-mini'),
      maxTokens: Number(env.get('OPENAI_MAX_TOKENS', '1000')),
      temperature: Number(env.get('OPENAI_TEMPERATURE', '0.7')),
    }

    if (!this.config.apiKey) {
      throw new Error('OpenAI API key is required. Please set OPENAI_API_KEY environment variable.')
    }

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
    })
  }

  /**
   * Generate a chat completion using OpenAI
   */
  async generateChatCompletion(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages: messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      })

      const choice = completion.choices[0]
      if (!choice?.message?.content) {
        throw new Error('No content received from OpenAI')
      }

      return {
        content: choice.message.content,
        usage: completion.usage
          ? {
              prompt_tokens: completion.usage.prompt_tokens,
              completion_tokens: completion.usage.completion_tokens,
              total_tokens: completion.usage.total_tokens,
            }
          : undefined,
      }
    } catch (error) {
      console.error('OpenAI API Error:', error)
      throw new Error(
        `OpenAI service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Generate Japanese learning content using AI
   */
  async generateJapaneseLearningContent(prompt: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a Japanese language learning assistant. You help students learn Hiragana, Katakana, and basic Japanese. 
        Provide clear, educational, and encouraging responses. Focus on accuracy and helpful explanations.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ]

    const response = await this.generateChatCompletion(messages)
    return response.content
  }

  /**
   * Generate quiz questions for Japanese characters
   */
  async generateQuizQuestions(
    characterType: 'hiragana' | 'katakana',
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
    count: number = 10
  ): Promise<string> {
    const prompt = `Generate ${count} multiple-choice quiz questions for ${characterType} characters at ${difficulty} level. 
    Format each question as:
    Question: [Character]
    A) [option1]
    B) [option2] 
    C) [option3]
    D) [option4]
    Correct Answer: [letter]
    
    Make sure to include a good mix of characters and plausible incorrect answers.`

    return await this.generateJapaneseLearningContent(prompt)
  }

  /**
   * Explain Japanese character meanings and usage
   */
  async explainCharacter(character: string): Promise<string> {
    const prompt = `Explain the Japanese character "${character}". Include:
    1. Its romanization/pronunciation
    2. Whether it's Hiragana or Katakana
    3. Common usage examples
    4. Any helpful memory tips for learning it
    
    Keep the explanation beginner-friendly and encouraging.`

    return await this.generateJapaneseLearningContent(prompt)
  }

  /**
   * Generate study tips for Japanese learning
   */
  async generateStudyTips(topic: string): Promise<string> {
    const prompt = `Provide helpful study tips for learning ${topic} in Japanese. 
    Include practical advice, memory techniques, and encouragement for beginners.`

    return await this.generateJapaneseLearningContent(prompt)
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!this.config.apiKey
  }

  /**
   * Get current configuration (without exposing API key)
   */
  getConfig(): Omit<OpenAIConfig, 'apiKey'> {
    return {
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
    }
  }
}
