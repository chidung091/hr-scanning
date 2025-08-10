import OpenAI from 'openai'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

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
  private static instance: OpenAIService | null = null
  private client?: OpenAI
  private config: OpenAIConfig
  public configured: boolean

  private constructor() {
    this.config = {
      apiKey: env.get('OPENAI_API_KEY', ''),
      model: env.get('OPENAI_MODEL', 'gpt-4o-mini'),
      maxTokens: Number(env.get('OPENAI_MAX_TOKENS', '10000')),
      temperature: Number(env.get('OPENAI_TEMPERATURE', '0.7')),
    }

    this.configured = !!this.config.apiKey

    if (this.configured) {
      this.client = new OpenAI({
        apiKey: this.config.apiKey,
      })
    }
  }

  static getInstance(): OpenAIService {
    if (!this.instance) {
      this.instance = new OpenAIService()
    }
    return this.instance
  }

  /**
   * Generate a chat completion using OpenAI
   */
  async generateChatCompletion(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
    if (!this.configured || !this.client) {
      throw new Error('OpenAI service is not configured')
    }
    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages: messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      })
      logger.info('completion: %s', this.config.maxTokens)
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
   * Japanese Teacher - Explain Japanese words/grammar for Vietnamese learners
   */
  async explainJapaneseForVietnamese(input: string): Promise<string> {
    // Detect if input is a single word/phrase or a complete sentence
    const isCompleteSentence = this.isCompleteSentence(input.trim())

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.getSystemPromptForJapaneseTeacher(isCompleteSentence),
      },
      {
        role: 'user',
        content: input,
      },
    ]

    const response = await this.generateChatCompletion(messages)
    logger.info('response from openAI', response)
    return response.content
  }

  /**
   * Detect if the input is a complete sentence or just a word/phrase
   */
  private isCompleteSentence(input: string): boolean {
    // Check for sentence-ending particles and punctuation
    const sentenceEnders = ['。', '！', '？', '.', '!', '?']
    const hasEnding = sentenceEnders.some((ender) => input.endsWith(ender))

    // Check for common sentence patterns (verb forms, particles, etc.)
    const sentencePatterns = [
      /です$/,
      /である$/,
      /だ$/,
      /である。$/,
      /です。$/,
      /ます$/,
      /ました$/,
      /ません$/,
      /ませんでした$/,
      /た$/,
      /だった$/,
      /ない$/,
      /なかった$/,
      /よ$/,
      /ね$/,
      /か$/,
      /の$/,
      /わ$/,
      /ている$/,
      /ていた$/,
      /ていない$/,
      /ていなかった$/,
    ]

    const hasVerbForm = sentencePatterns.some((pattern) => pattern.test(input))

    // Check length - longer inputs are more likely to be sentences
    const isLongEnough = input.length > 8

    // Check for multiple words (spaces or multiple kanji/hiragana groups)
    const hasMultipleComponents =
      input.includes(' ') ||
      (input.match(/[\u4e00-\u9faf]+/g) || []).length > 1 ||
      (input.match(/[\u3040-\u309f]+/g) || []).length > 2

    return hasEnding || (hasVerbForm && (isLongEnough || hasMultipleComponents))
  }

  /**
   * Get appropriate system prompt based on input type
   */
  private getSystemPromptForJapaneseTeacher(isCompleteSentence: boolean): string {
    if (isCompleteSentence) {
      return `You are a Japanese language teacher helping Vietnamese learners understand complete Japanese sentences. When given a Japanese sentence, provide a comprehensive explanation in the following JSON format. All explanations should be in simple Vietnamese.

Return your answer in valid JSON with this exact structure:
{
  "input": "[Complete Japanese sentence]",
  "romaji": "[Complete romaji reading of the entire sentence]",
  "furigana": "[Furigana reading for the entire sentence, showing readings above kanji]",
  "meaning_vietnamese": "[Complete Vietnamese translation and detailed explanation of the sentence meaning, including context and nuance]",
  "pronunciation_guide": "[Detailed Vietnamese pronunciation guide for the entire sentence, breaking down difficult sounds and rhythm]",
  "example_japanese": "[A similar example sentence in Japanese that uses similar grammar or vocabulary]",
  "example_vietnamese": "[Vietnamese translation of the example sentence]",
  "note": "[Detailed grammar analysis, including: sentence structure, key grammar points, verb forms, particles used, politeness level, cultural context, and any important linguistic notes for Vietnamese learners]"
}

Focus on explaining the ENTIRE SENTENCE as a complete unit, not individual words. Provide comprehensive grammar analysis and cultural context. Do not explain outside the JSON, just return the JSON only.`
    } else {
      return `You are a Japanese language teacher helping Vietnamese learners understand Japanese vocabulary and grammar. When given a Japanese word or grammar pattern, respond in the following JSON format. All explanations should be in simple Vietnamese. Use romaji and furigana for Japanese words.

Return your answer in valid JSON with this exact structure:
{
  "input": "[Japanese word or grammar]",
  "romaji": "[romaji reading]",
  "furigana": "[furigana reading]",
  "meaning_vietnamese": "[Vietnamese explanation]",
  "pronunciation_guide": "[Vietnamese pronunciation tips and phonetic guidance to help Vietnamese learners pronounce the Japanese word correctly]",
  "example_japanese": "[example sentence in Japanese]",
  "example_vietnamese": "[meaning of the example sentence in Vietnamese]",
  "note": "[any extra notes about nuance, politeness, usage, or alternatives]"
}

Do not explain outside the JSON, just return the JSON only.`
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this.configured
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
