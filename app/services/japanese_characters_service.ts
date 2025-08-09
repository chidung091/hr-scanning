import { readFileSync } from 'node:fs'

export interface JapaneseCharacter {
  character: string
  romanization: string
  type: 'hiragana' | 'katakana'
}

export interface QuizQuestion {
  character: string
  correctAnswer: string
  options: string[]
  type: 'hiragana' | 'katakana'
}

export default class JapaneseCharactersService {
  private static hiraganaCharacters: JapaneseCharacter[] | null = null
  private static katakanaCharacters: JapaneseCharacter[] | null = null

  private static loadCharacters(type: 'hiragana' | 'katakana'): JapaneseCharacter[] {
    if (type === 'hiragana') {
      if (!this.hiraganaCharacters) {
        const data = readFileSync(new URL('../data/hiragana.json', import.meta.url), 'utf-8')
        this.hiraganaCharacters = JSON.parse(data) as JapaneseCharacter[]
      }
      return this.hiraganaCharacters
    } else {
      if (!this.katakanaCharacters) {
        const data = readFileSync(new URL('../data/katakana.json', import.meta.url), 'utf-8')
        this.katakanaCharacters = JSON.parse(data) as JapaneseCharacter[]
      }
      return this.katakanaCharacters
    }
  }

  static getCharacters(type: 'hiragana' | 'katakana'): JapaneseCharacter[] {
    return this.loadCharacters(type)
  }

  static getAllCharacters(): JapaneseCharacter[] {
    const hiragana = this.loadCharacters('hiragana')
    const katakana = this.loadCharacters('katakana')
    return [...hiragana, ...katakana]
  }

  static generateQuizQuestions(type: 'hiragana' | 'katakana', count: number = 20): QuizQuestion[] {
    const characters = this.getCharacters(type)
    const shuffled = this.shuffleArray([...characters])
    const selectedCharacters = shuffled.slice(0, count)

    return selectedCharacters.map((char) => this.createQuizQuestion(char, characters))
  }

  private static createQuizQuestion(
    character: JapaneseCharacter,
    allCharacters: JapaneseCharacter[]
  ): QuizQuestion {
    const correctAnswer = character.romanization
    const incorrectAnswers = this.generateIncorrectAnswers(correctAnswer, allCharacters)
    const options = this.shuffleArray([correctAnswer, ...incorrectAnswers])

    return {
      character: character.character,
      correctAnswer,
      options,
      type: character.type,
    }
  }

  private static generateIncorrectAnswers(
    correctAnswer: string,
    allCharacters: JapaneseCharacter[]
  ): string[] {
    const otherRomanizations = allCharacters
      .map((char) => char.romanization)
      .filter((rom) => rom !== correctAnswer)

    const shuffled = this.shuffleArray(otherRomanizations)
    return shuffled.slice(0, 3)
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}
