import logger from '@adonisjs/core/services/logger'
import OpenAIService, { type ChatMessage } from '#services/openai_service'

export interface QuizChoice {
  key: 'A' | 'B' | 'C' | 'D'
  text: string
}

export interface QuizQuestion {
  id: string
  type: 'grammar' | 'vocabulary' | 'kana' | 'reading'
  prompt: string
  choices: QuizChoice[]
  answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

const SYSTEM_PROMPT = `Bạn là Trợ lý luyện thi JLPT N5. Nhiệm vụ của bạn:\n1) Sinh bộ 20 câu hỏi N5 (mỗi câu 4 phương án A/B/C/D, chỉ 1 đáp án đúng).\n2) Giữ độ khó đúng JLPT N5 (từ vựng/kana/kanji căn bản, trợ từ, mẫu ngữ pháp cơ bản, chào hỏi, thời gian…).\n3) Khi người học chọn sai, giải thích ngắn gọn, chỉ ra đáp án đúng và lý do.\n4) Khi người học chọn đúng, chuyển sang câu kế tiếp mà KHÔNG giải thích dài dòng.`

const demoQuestions: QuizQuestion[] = [
  {
    id: 'demo1',
    type: 'grammar',
    prompt: 'Chọn trợ từ đúng: わたし__がくせいです。',
    choices: [
      { key: 'A', text: 'は' },
      { key: 'B', text: 'を' },
      { key: 'C', text: 'に' },
      { key: 'D', text: 'が' },
    ],
    answer: 'A',
    explanation: 'Chủ đề câu dùng は: わたしは～です。',
  },
  {
    id: 'demo2',
    type: 'vocabulary',
    prompt: 'Từ nào nghĩa là "sách"?',
    choices: [
      { key: 'A', text: 'くるま' },
      { key: 'B', text: 'ほん' },
      { key: 'C', text: 'いぬ' },
      { key: 'D', text: 'ねこ' },
    ],
    answer: 'B',
    explanation: 'ほん (hon) nghĩa là sách.',
  },
  {
    id: 'demo3',
    type: 'kana',
    prompt: 'Chữ き thuộc bảng chữ nào?',
    choices: [
      { key: 'A', text: 'Hiragana' },
      { key: 'B', text: 'Katakana' },
      { key: 'C', text: 'Kanji' },
      { key: 'D', text: 'Romaji' },
    ],
    answer: 'A',
    explanation: 'き là chữ Hiragana.',
  },
]

function isValidQuestion(question: any): question is QuizQuestion {
  if (!question || typeof question !== 'object') return false
  const keys = ['A', 'B', 'C', 'D']
  const { id, type, prompt, choices, answer, explanation } = question
  if (
    typeof id !== 'string' ||
    typeof prompt !== 'string' ||
    typeof explanation !== 'string' ||
    !['grammar', 'vocabulary', 'kana', 'reading'].includes(type)
  ) {
    return false
  }
  if (!Array.isArray(choices) || choices.length !== 4) return false
  const textSet = new Set()
  for (const choice of choices) {
    if (!choice || typeof choice.text !== 'string' || !keys.includes(choice.key)) {
      return false
    }
    if (textSet.has(choice.text)) return false
    textSet.add(choice.text)
  }
  if (!keys.includes(answer)) return false
  return true
}

function validateQuestions(data: any): QuizQuestion[] | null {
  if (!data || !Array.isArray(data.questions) || data.questions.length !== 20) {
    return null
  }
  const list: QuizQuestion[] = []
  for (const q of data.questions) {
    if (!isValidQuestion(q)) return null
    list.push(q)
  }
  return list
}

export default class QuizService {
  /** Generate quiz using AI, fallback to demo questions on failure */
  static async generateQuiz(): Promise<{ questions: QuizQuestion[] }> {
    const openai = OpenAIService.getInstance()
    if (!openai.configured) {
      return { questions: demoQuestions }
    }

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: 'tạo đề' },
      ]
      const aiResponse = await openai.generateChatCompletion(messages)
      const parsed = JSON.parse(aiResponse.content)
      const questions = validateQuestions(parsed)
      if (questions) {
        return { questions }
      }
    } catch (error) {
      logger.error('generateQuiz failed: %s', error)
    }

    return { questions: demoQuestions }
  }

  /** Ask AI for explanation of incorrect answer */
  static async explain(
    question: QuizQuestion,
    selected: string
  ): Promise<{ correct: string; explanation: string }> {
    const openai = OpenAIService.getInstance()
    if (!openai.configured) {
      return { correct: question.answer, explanation: question.explanation }
    }

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({ action: 'explain', question, selected }),
        },
      ]
      const aiResponse = await openai.generateChatCompletion(messages)
      const parsed = JSON.parse(aiResponse.content)
      if (parsed && typeof parsed.correct === 'string' && typeof parsed.explanation === 'string') {
        return parsed
      }
    } catch (error) {
      logger.error('explain failed: %s', error)
    }

    return { correct: question.answer, explanation: question.explanation }
  }
}
