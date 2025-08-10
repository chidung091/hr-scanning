export interface Question {
  character: string
  options: string[]
  correctAnswer: string
}

export interface QuizSession {
  sessionId: string
  quizType: 'hiragana' | 'katakana' | 'n5'
  totalQuestions: number
  currentQuestion: Question | N5QuizQuestion
  score: number
  questionNumber: number
  hearts: number
  maxHearts: number
  isGameOver: boolean
  completed: boolean
  finalScore?: number
  heartsRemaining?: number
  gameOverReason?: 'no_hearts' | 'completed'
}

export interface QuizStartResponse {
  sessionId: string
  totalQuestions: number
  currentQuestion: Question | N5QuizQuestion
  hearts: number
  maxHearts: number
  isGameOver: boolean
}

export interface AnswerResponse {
  isCorrect: boolean
  correctAnswer: string
  score: number
  questionNumber: number
  hearts: number
  isGameOver: boolean
  completed: boolean
  gameOverReason?: 'no_hearts' | 'completed'
  finalScore?: number
  heartsRemaining?: number
}

export interface QuestionResponse {
  question?: Question | N5QuizQuestion
  completed: boolean
  isGameOver: boolean
  gameOverReason?: 'no_hearts' | 'completed'
  hearts: number
  finalScore?: number
  heartsRemaining?: number
}

export interface JapaneseExplanation {
  input: string
  romaji: string
  furigana: string
  pronunciation_guide: string
  meaning_vietnamese: string
  example_japanese: string
  example_vietnamese: string
  note: string
}

export interface ProgressStats {
  quizzesTaken: number
  totalQuestions: number
  totalCorrect: number
  bestScore: number
  accuracy: number
}

export interface AppState {
  quiz?: {
    sessionId: string | null
    quizType: 'hiragana' | 'katakana' | 'n5' | null
    score: number
    questionNumber: number
    hearts: number
    isGameOver: boolean
  }
  isMobile: boolean
  isMobileViewport: boolean
  orientation: string
  timestamp: string
}

export type QuizType = 'hiragana' | 'katakana' | 'n5'
export type Orientation = 'portrait' | 'landscape'

export interface MobileEnhancementOptions {
  preventDoubleTab?: boolean
  enableHapticFeedback?: boolean
  hapticSelectors?: string[]
}

export interface AnimationConfig {
  duration?: number
  easing?: string
  delay?: number
}

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
