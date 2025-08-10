import logger from '@adonisjs/core/services/logger'
import OpenAIService, { type ChatMessage } from '#services/openai_service'
import fs from 'node:fs/promises'
import path from 'node:path'

export interface N5QuizChoice {
  key: 'A' | 'B' | 'C' | 'D'
  text: string
}

export interface N5QuizQuestion {
  id: string
  type: 'grammar' | 'vocabulary' | 'kana' | 'reading'
  prompt: string
  choices: N5QuizChoice[]
  answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

// Expected number of questions from the model
const EXPECTED_COUNT = 10

const SYSTEM_PROMPT = `You are a JLPT N5 quiz generator.

Strict output rules:
- Return ONLY a single JSON object. No preface, no explanations, no markdown fences, no extra text.
- Do NOT wrap JSON in code fences or backticks.
- All values must be valid JSON strings. Escape quotes if needed. No trailing commas.
- The explanation must be in Vietnamese, but still inside the JSON as a string.

Task:
Generate exactly 10 JLPT N5 questions. Each question must have:
- id: unique identifier (q1, q2, ...)
- type: one of "grammar", "vocabulary", "kana", "reading"
- prompt: the question text
- choices: array of exactly 4 options with keys A, B, C, D
- answer: the correct key (A, B, C, or D)
- explanation: brief Vietnamese explanation for the correct answer

Output JSON schema example (use as a template; fill with your own 10 questions):
{
  "questions": [
    {
      "id": "q1",
      "type": "grammar",
      "prompt": "Chọn trợ từ đúng: わたし__がくせいです。",
      "choices": [
        {"key": "A", "text": "は"},
        {"key": "B", "text": "を"},
        {"key": "C", "text": "に"},
        {"key": "D", "text": "が"}
      ],
      "answer": "A",
      "explanation": "は là trợ từ chỉ chủ đề của câu."
    }
  ]
}`

const demoQuestions: N5QuizQuestion[] = [
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
  {
    id: 'demo4',
    type: 'grammar',
    prompt: 'Chọn từ đúng: きょう__あついです。',
    choices: [
      { key: 'A', text: 'は' },
      { key: 'B', text: 'が' },
      { key: 'C', text: 'を' },
      { key: 'D', text: 'に' },
    ],
    answer: 'A',
    explanation: 'Chủ đề thời tiết dùng は: きょうは～です。',
  },
  {
    id: 'demo5',
    type: 'vocabulary',
    prompt: 'Từ nào nghĩa là "nước"?',
    choices: [
      { key: 'A', text: 'みず' },
      { key: 'B', text: 'おちゃ' },
      { key: 'C', text: 'コーヒー' },
      { key: 'D', text: 'ジュース' },
    ],
    answer: 'A',
    explanation: 'みず (mizu) nghĩa là nước.',
  },
  {
    id: 'demo6',
    type: 'reading',
    prompt: 'Cách đọc của 今日 là gì?',
    choices: [
      { key: 'A', text: 'きょう' },
      { key: 'B', text: 'あした' },
      { key: 'C', text: 'きのう' },
      { key: 'D', text: 'まいにち' },
    ],
    answer: 'A',
    explanation: '今日 đọc là きょう (kyou) nghĩa là hôm nay.',
  },
  {
    id: 'demo7',
    type: 'grammar',
    prompt: 'Chọn động từ đúng: わたしは パン__たべます。',
    choices: [
      { key: 'A', text: 'を' },
      { key: 'B', text: 'は' },
      { key: 'C', text: 'が' },
      { key: 'D', text: 'に' },
    ],
    answer: 'A',
    explanation: 'Tân ngữ trực tiếp dùng を: パンを食べます。',
  },
  {
    id: 'demo8',
    type: 'vocabulary',
    prompt: 'Từ nào nghĩa là "trường học"?',
    choices: [
      { key: 'A', text: 'いえ' },
      { key: 'B', text: 'がっこう' },
      { key: 'C', text: 'びょういん' },
      { key: 'D', text: 'ぎんこう' },
    ],
    answer: 'B',
    explanation: 'がっこう (gakkou) nghĩa là trường học.',
  },
  {
    id: 'demo9',
    type: 'kana',
    prompt: 'Chữ ス thuộc bảng chữ nào?',
    choices: [
      { key: 'A', text: 'Hiragana' },
      { key: 'B', text: 'Katakana' },
      { key: 'C', text: 'Kanji' },
      { key: 'D', text: 'Romaji' },
    ],
    answer: 'B',
    explanation: 'ス là chữ Katakana.',
  },
  {
    id: 'demo10',
    type: 'grammar',
    prompt: 'Chọn từ đúng: わたしは 7じ__おきます。',
    choices: [
      { key: 'A', text: 'に' },
      { key: 'B', text: 'で' },
      { key: 'C', text: 'を' },
      { key: 'D', text: 'は' },
    ],
    answer: 'A',
    explanation: 'Thời gian cụ thể dùng に: 7時に起きます。',
  },
  {
    id: 'demo11',
    type: 'vocabulary',
    prompt: 'Từ nào nghĩa là "ăn"?',
    choices: [
      { key: 'A', text: 'のむ' },
      { key: 'B', text: 'たべる' },
      { key: 'C', text: 'みる' },
      { key: 'D', text: 'きく' },
    ],
    answer: 'B',
    explanation: 'たべる (taberu) nghĩa là ăn.',
  },
  {
    id: 'demo12',
    type: 'reading',
    prompt: 'Cách đọc của 学生 là gì?',
    choices: [
      { key: 'A', text: 'がくせい' },
      { key: 'B', text: 'せんせい' },
      { key: 'C', text: 'がくしゃ' },
      { key: 'D', text: 'せいと' },
    ],
    answer: 'A',
    explanation: '学生 đọc là がくせい (gakusei) nghĩa là học sinh.',
  },
  {
    id: 'demo13',
    type: 'grammar',
    prompt: 'Chọn từ đúng: これ__わたしの ほんです。',
    choices: [
      { key: 'A', text: 'は' },
      { key: 'B', text: 'が' },
      { key: 'C', text: 'を' },
      { key: 'D', text: 'に' },
    ],
    answer: 'A',
    explanation: 'Chủ đề câu dùng は: これは～です。',
  },
  {
    id: 'demo14',
    type: 'vocabulary',
    prompt: 'Từ nào nghĩa là "lớn"?',
    choices: [
      { key: 'A', text: 'ちいさい' },
      { key: 'B', text: 'おおきい' },
      { key: 'C', text: 'たかい' },
      { key: 'D', text: 'やすい' },
    ],
    answer: 'B',
    explanation: 'おおきい (ookii) nghĩa là lớn.',
  },
  {
    id: 'demo15',
    type: 'kana',
    prompt: 'Chữ ひ đọc như thế nào?',
    choices: [
      { key: 'A', text: 'hi' },
      { key: 'B', text: 'he' },
      { key: 'C', text: 'ha' },
      { key: 'D', text: 'ho' },
    ],
    answer: 'A',
    explanation: 'ひ đọc là hi.',
  },
  {
    id: 'demo16',
    type: 'grammar',
    prompt: 'Chọn từ đúng: あした とうきょう__いきます。',
    choices: [
      { key: 'A', text: 'に' },
      { key: 'B', text: 'で' },
      { key: 'C', text: 'を' },
      { key: 'D', text: 'は' },
    ],
    answer: 'A',
    explanation: 'Điểm đến dùng に: 東京に行きます。',
  },
  {
    id: 'demo17',
    type: 'vocabulary',
    prompt: 'Từ nào nghĩa là "mua"?',
    choices: [
      { key: 'A', text: 'うる' },
      { key: 'B', text: 'かう' },
      { key: 'C', text: 'つくる' },
      { key: 'D', text: 'もらう' },
    ],
    answer: 'B',
    explanation: 'かう (kau) nghĩa là mua.',
  },
  {
    id: 'demo18',
    type: 'reading',
    prompt: 'Cách đọc của 先生 là gì?',
    choices: [
      { key: 'A', text: 'せんせい' },
      { key: 'B', text: 'がくせい' },
      { key: 'C', text: 'せんぱい' },
      { key: 'D', text: 'こうはい' },
    ],
    answer: 'A',
    explanation: '先生 đọc là せんせい (sensei) nghĩa là giáo viên.',
  },
  {
    id: 'demo19',
    type: 'grammar',
    prompt: 'Chọn từ đúng: でんしゃ__がっこうに いきます。',
    choices: [
      { key: 'A', text: 'で' },
      { key: 'B', text: 'に' },
      { key: 'C', text: 'を' },
      { key: 'D', text: 'は' },
    ],
    answer: 'A',
    explanation: 'Phương tiện di chuyển dùng で: 電車で行きます。',
  },
  {
    id: 'demo20',
    type: 'vocabulary',
    prompt: 'Từ nào nghĩa là "đẹp"?',
    choices: [
      { key: 'A', text: 'きれい' },
      { key: 'B', text: 'きたない' },
      { key: 'C', text: 'あたらしい' },
      { key: 'D', text: 'ふるい' },
    ],
    answer: 'A',
    explanation: 'きれい (kirei) nghĩa là đẹp.',
  },
]

function isValidQuestion(question: any): question is N5QuizQuestion {
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

function validateQuestions(data: any): N5QuizQuestion[] | null {
  if (!data || !Array.isArray(data.questions) || data.questions.length !== EXPECTED_COUNT) {
    return null
  }
  const list: N5QuizQuestion[] = []
  for (const q of data.questions) {
    if (!isValidQuestion(q)) return null
    list.push(q)
  }
  return list
}

// Clean potential model output into a JSON string
function stripCodeFences(s: string): string {
  let out = s.trim()
  if (out.startsWith('```json')) {
    out = out.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '')
  } else if (out.startsWith('```')) {
    out = out.replace(/^```\s*/i, '').replace(/\s*```\s*$/i, '')
  }
  return out.trim()
}

function extractFirstBalancedJson(s: string): string | null {
  const text = s
  const start = text.indexOf('{')
  if (start === -1) return null
  let depth = 0
  let inString = false
  let prevChar = ''
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"' && prevChar !== '\\') inString = !inString
    if (!inString) {
      if (ch === '{') depth++
      else if (ch === '}') {
        depth--
        if (depth === 0) return text.slice(start, i + 1)
      }
    }
    prevChar = ch
  }
  return null
}

function sanitizeJsonString(s: string): string {
  let out = s
  // Normalize Unicode quotes
  out = out.replace(/[\u2018\u2019]/g, "'")
  out = out.replace(/[\u201C\u201D]/g, '"')
  // Remove trailing commas before } or ]
  out = out.replace(/,(\s*[}\]])/g, '$1')
  // Remove BOM if present
  if (out.charCodeAt(0) === 0xfeff) out = out.slice(1)
  return out
}

export function tryParseModelJson(raw: string): any | null {
  // Step 1: strip code fences
  let cleaned = stripCodeFences(raw)
  // Step 2: extract balanced JSON object if extra prose exists
  const balanced = extractFirstBalancedJson(cleaned)
  if (balanced) cleaned = balanced
  // Step 3: sanitize common issues
  cleaned = sanitizeJsonString(cleaned)
  try {
    return JSON.parse(cleaned)
  } catch (e) {
    logger.warn('JSON parse failed. Sample (first 200 chars): %s', cleaned.slice(0, 200))
    return null
  }
}

function salvageQuestions(data: any): N5QuizQuestion[] {
  const list: N5QuizQuestion[] = []
  if (!data || !Array.isArray(data.questions)) return list
  for (const q of data.questions) {
    if (isValidQuestion(q)) list.push(q)
    if (list.length === EXPECTED_COUNT) break
  }
  // If partially valid (>=EXPECTED_COUNT/2), top up with demo to reach EXPECTED_COUNT
  if (list.length >= Math.ceil(EXPECTED_COUNT / 2) && list.length < EXPECTED_COUNT) {
    const used = new Set(list.map((q) => q.id))
    for (const dq of demoQuestions) {
      const id = used.has(dq.id) ? `${dq.id}_${Math.random().toString(36).slice(2, 6)}` : dq.id
      list.push({ ...dq, id })
      if (list.length === EXPECTED_COUNT) break
    }
  }
  return list
}

async function writeAiLog(logData: {
  enabled: boolean
  raw: string
  parsedOk: boolean
  error?: string
  questionsCount?: number
  finalQuestions?: N5QuizQuestion[] | null
  requestMeta: {
    messages: ChatMessage[]
  }
}): Promise<void> {
  logger.info(
    'writeAiLog called - enabled: %s, N5_AI_LOG env: %s',
    logData.enabled,
    process.env.N5_AI_LOG
  )
  if (!logData.enabled) return
  try {
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `ai_logs/n5_quiz_${ts}.json`
    const fullPath = path.join(process.cwd(), fileName)
    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    const payload = {
      timestamp: new Date().toISOString(),
      request: {
        messages: logData.requestMeta.messages,
      },
      response: {
        raw: logData.raw,
      },
      parsedOk: logData.parsedOk,
      error: logData.error || null,
      questionsCount: logData.questionsCount ?? null,
      finalQuestions: logData.finalQuestions ?? null,
    }
    await fs.writeFile(fullPath, JSON.stringify(payload, null, 2), 'utf8')
    logger.info('AI log written successfully to: %s', fullPath)
  } catch (e: any) {
    logger.warn('Failed to write AI log file: %s', e?.message || String(e))
  }
}

export default class N5QuizService {
  /** Generate quiz using AI, fallback to demo questions on failure */
  static async generateQuiz(): Promise<{ questions: N5QuizQuestion[] }> {
    logger.info('N5QuizService.generateQuiz called')
    logger.info('N5_AI_LOG environment variable: %s', process.env.N5_AI_LOG)
    const openai = OpenAIService.getInstance()
    if (!openai.configured) {
      logger.info('OpenAI not configured, using demo questions')
      return { questions: demoQuestions }
    }

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: 'Return ONLY the JSON object described. No markdown, no extra text.',
        },
      ]

      const aiResponse = await openai.generateChatCompletion(messages)
      const raw = aiResponse.content || ''
      logger.info('AI raw length: %d, head: %s', raw.length, raw.slice(0, 120))

      // Write AI log before parsing
      await writeAiLog({
        enabled: process.env.N5_AI_LOG === 'true',
        raw,
        parsedOk: false,
        finalQuestions: null,
        requestMeta: { messages },
      })

      const parsed = tryParseModelJson(raw)

      if (parsed) {
        const questions = validateQuestions(parsed)
        if (questions) {
          logger.info('Successfully parsed %d N5 questions from AI', questions.length)

          // Update log with success and question count
          await writeAiLog({
            enabled: process.env.N5_AI_LOG === 'true',
            raw,
            parsedOk: true,
            questionsCount: questions.length,
            finalQuestions: questions,
            requestMeta: { messages },
          })

          return { questions }
        }
        // Try to salvage partially valid questions
        const salvaged = salvageQuestions(parsed)
        if (salvaged.length === 20) {
          logger.info('Salvaged 20 N5 questions from AI output')

          await writeAiLog({
            enabled: process.env.N5_AI_LOG === 'true',
            raw,
            parsedOk: true,
            questionsCount: salvaged.length,
            finalQuestions: salvaged,
            requestMeta: { messages },
          })

          return { questions: salvaged }
        }
        if (salvaged.length >= 10) {
          logger.info(
            'Partially salvaged %d questions, topping up with demo to 20',
            salvaged.length
          )

          await writeAiLog({
            enabled: process.env.N5_AI_LOG === 'true',
            raw,
            parsedOk: true,
            questionsCount: salvaged.length,
            finalQuestions: salvaged,
            requestMeta: { messages },
          })

          return { questions: salvaged }
        }
      }

      logger.warn('AI output invalid or insufficient; falling back to demo questions')

      await writeAiLog({
        enabled: process.env.N5_AI_LOG === 'true',
        raw,
        parsedOk: false,
        error: 'Invalid or insufficient AI output',
        finalQuestions: null,
        requestMeta: { messages },
      })
    } catch (error) {
      logger.error('generateQuiz failed: %s', error)
    }

    return { questions: demoQuestions }
  }

  /** Ask AI for explanation of incorrect answer */
  static async explain(
    question: N5QuizQuestion,
    selected: string
  ): Promise<{ correct: string; explanation: string }> {
    const openai = OpenAIService.getInstance()
    if (!openai.configured) {
      return { correct: question.answer, explanation: question.explanation }
    }

    try {
      const explainPrompt = `Explain why the correct answer for this JLPT N5 question is "${question.answer}" and not "${selected}".

Question: ${question.prompt}
Selected: ${selected}
Correct: ${question.answer}

Return ONLY valid JSON in this format:
{
  "correct": "${question.answer}",
  "explanation": "Brief explanation in Vietnamese"
}`

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: 'You are a JLPT N5 tutor. Provide brief explanations in Vietnamese.',
        },
        { role: 'user', content: explainPrompt },
      ]

      const aiResponse = await openai.generateChatCompletion(messages)

      const parsed = tryParseModelJson(aiResponse.content || '')
      if (parsed && typeof parsed.correct === 'string' && typeof parsed.explanation === 'string') {
        return parsed
      }
    } catch (error) {
      logger.error('explain failed: %s', error)
    }

    return { correct: question.answer, explanation: question.explanation }
  }
}
