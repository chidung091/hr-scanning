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
  private static hiraganaCharacters: JapaneseCharacter[] = [
    // Basic Hiragana (a-o)
    { character: 'あ', romanization: 'a', type: 'hiragana' },
    { character: 'い', romanization: 'i', type: 'hiragana' },
    { character: 'う', romanization: 'u', type: 'hiragana' },
    { character: 'え', romanization: 'e', type: 'hiragana' },
    { character: 'お', romanization: 'o', type: 'hiragana' },

    // Ka row
    { character: 'か', romanization: 'ka', type: 'hiragana' },
    { character: 'き', romanization: 'ki', type: 'hiragana' },
    { character: 'く', romanization: 'ku', type: 'hiragana' },
    { character: 'け', romanization: 'ke', type: 'hiragana' },
    { character: 'こ', romanization: 'ko', type: 'hiragana' },

    // Sa row
    { character: 'さ', romanization: 'sa', type: 'hiragana' },
    { character: 'し', romanization: 'shi', type: 'hiragana' },
    { character: 'す', romanization: 'su', type: 'hiragana' },
    { character: 'せ', romanization: 'se', type: 'hiragana' },
    { character: 'そ', romanization: 'so', type: 'hiragana' },

    // Ta row
    { character: 'た', romanization: 'ta', type: 'hiragana' },
    { character: 'ち', romanization: 'chi', type: 'hiragana' },
    { character: 'つ', romanization: 'tsu', type: 'hiragana' },
    { character: 'て', romanization: 'te', type: 'hiragana' },
    { character: 'と', romanization: 'to', type: 'hiragana' },

    // Na row
    { character: 'な', romanization: 'na', type: 'hiragana' },
    { character: 'に', romanization: 'ni', type: 'hiragana' },
    { character: 'ぬ', romanization: 'nu', type: 'hiragana' },
    { character: 'ね', romanization: 'ne', type: 'hiragana' },
    { character: 'の', romanization: 'no', type: 'hiragana' },

    // Ha row
    { character: 'は', romanization: 'ha', type: 'hiragana' },
    { character: 'ひ', romanization: 'hi', type: 'hiragana' },
    { character: 'ふ', romanization: 'fu', type: 'hiragana' },
    { character: 'へ', romanization: 'he', type: 'hiragana' },
    { character: 'ほ', romanization: 'ho', type: 'hiragana' },

    // Ma row
    { character: 'ま', romanization: 'ma', type: 'hiragana' },
    { character: 'み', romanization: 'mi', type: 'hiragana' },
    { character: 'む', romanization: 'mu', type: 'hiragana' },
    { character: 'め', romanization: 'me', type: 'hiragana' },
    { character: 'も', romanization: 'mo', type: 'hiragana' },

    // Ya row
    { character: 'や', romanization: 'ya', type: 'hiragana' },
    { character: 'ゆ', romanization: 'yu', type: 'hiragana' },
    { character: 'よ', romanization: 'yo', type: 'hiragana' },

    // Ra row
    { character: 'ら', romanization: 'ra', type: 'hiragana' },
    { character: 'り', romanization: 'ri', type: 'hiragana' },
    { character: 'る', romanization: 'ru', type: 'hiragana' },
    { character: 'れ', romanization: 're', type: 'hiragana' },
    { character: 'ろ', romanization: 'ro', type: 'hiragana' },

    // Wa row
    { character: 'わ', romanization: 'wa', type: 'hiragana' },
    { character: 'を', romanization: 'wo', type: 'hiragana' },
    { character: 'ん', romanization: 'n', type: 'hiragana' },
  ]

  private static katakanaCharacters: JapaneseCharacter[] = [
    // Basic Katakana (a-o)
    { character: 'ア', romanization: 'a', type: 'katakana' },
    { character: 'イ', romanization: 'i', type: 'katakana' },
    { character: 'ウ', romanization: 'u', type: 'katakana' },
    { character: 'エ', romanization: 'e', type: 'katakana' },
    { character: 'オ', romanization: 'o', type: 'katakana' },

    // Ka row
    { character: 'カ', romanization: 'ka', type: 'katakana' },
    { character: 'キ', romanization: 'ki', type: 'katakana' },
    { character: 'ク', romanization: 'ku', type: 'katakana' },
    { character: 'ケ', romanization: 'ke', type: 'katakana' },
    { character: 'コ', romanization: 'ko', type: 'katakana' },

    // Sa row
    { character: 'サ', romanization: 'sa', type: 'katakana' },
    { character: 'シ', romanization: 'shi', type: 'katakana' },
    { character: 'ス', romanization: 'su', type: 'katakana' },
    { character: 'セ', romanization: 'se', type: 'katakana' },
    { character: 'ソ', romanization: 'so', type: 'katakana' },

    // Ta row
    { character: 'タ', romanization: 'ta', type: 'katakana' },
    { character: 'チ', romanization: 'chi', type: 'katakana' },
    { character: 'ツ', romanization: 'tsu', type: 'katakana' },
    { character: 'テ', romanization: 'te', type: 'katakana' },
    { character: 'ト', romanization: 'to', type: 'katakana' },

    // Na row
    { character: 'ナ', romanization: 'na', type: 'katakana' },
    { character: 'ニ', romanization: 'ni', type: 'katakana' },
    { character: 'ヌ', romanization: 'nu', type: 'katakana' },
    { character: 'ネ', romanization: 'ne', type: 'katakana' },
    { character: 'ノ', romanization: 'no', type: 'katakana' },

    // Ha row
    { character: 'ハ', romanization: 'ha', type: 'katakana' },
    { character: 'ヒ', romanization: 'hi', type: 'katakana' },
    { character: 'フ', romanization: 'fu', type: 'katakana' },
    { character: 'ヘ', romanization: 'he', type: 'katakana' },
    { character: 'ホ', romanization: 'ho', type: 'katakana' },

    // Ma row
    { character: 'マ', romanization: 'ma', type: 'katakana' },
    { character: 'ミ', romanization: 'mi', type: 'katakana' },
    { character: 'ム', romanization: 'mu', type: 'katakana' },
    { character: 'メ', romanization: 'me', type: 'katakana' },
    { character: 'モ', romanization: 'mo', type: 'katakana' },

    // Ya row
    { character: 'ヤ', romanization: 'ya', type: 'katakana' },
    { character: 'ユ', romanization: 'yu', type: 'katakana' },
    { character: 'ヨ', romanization: 'yo', type: 'katakana' },

    // Ra row
    { character: 'ラ', romanization: 'ra', type: 'katakana' },
    { character: 'リ', romanization: 'ri', type: 'katakana' },
    { character: 'ル', romanization: 'ru', type: 'katakana' },
    { character: 'レ', romanization: 're', type: 'katakana' },
    { character: 'ロ', romanization: 'ro', type: 'katakana' },

    // Wa row
    { character: 'ワ', romanization: 'wa', type: 'katakana' },
    { character: 'ヲ', romanization: 'wo', type: 'katakana' },
    { character: 'ン', romanization: 'n', type: 'katakana' },
  ]

  static getCharacters(type: 'hiragana' | 'katakana'): JapaneseCharacter[] {
    return type === 'hiragana' ? this.hiraganaCharacters : this.katakanaCharacters
  }

  static getAllCharacters(): JapaneseCharacter[] {
    return [...this.hiraganaCharacters, ...this.katakanaCharacters]
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
