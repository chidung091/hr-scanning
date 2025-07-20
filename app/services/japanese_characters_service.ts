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

    // Dakuten (濁点) - Voiced sounds
    // Ga row
    { character: 'が', romanization: 'ga', type: 'hiragana' },
    { character: 'ぎ', romanization: 'gi', type: 'hiragana' },
    { character: 'ぐ', romanization: 'gu', type: 'hiragana' },
    { character: 'げ', romanization: 'ge', type: 'hiragana' },
    { character: 'ご', romanization: 'go', type: 'hiragana' },

    // Za row
    { character: 'ざ', romanization: 'za', type: 'hiragana' },
    { character: 'じ', romanization: 'ji', type: 'hiragana' },
    { character: 'ず', romanization: 'zu', type: 'hiragana' },
    { character: 'ぜ', romanization: 'ze', type: 'hiragana' },
    { character: 'ぞ', romanization: 'zo', type: 'hiragana' },

    // Da row
    { character: 'だ', romanization: 'da', type: 'hiragana' },
    { character: 'ぢ', romanization: 'ji', type: 'hiragana' },
    { character: 'づ', romanization: 'zu', type: 'hiragana' },
    { character: 'で', romanization: 'de', type: 'hiragana' },
    { character: 'ど', romanization: 'do', type: 'hiragana' },

    // Ba row
    { character: 'ば', romanization: 'ba', type: 'hiragana' },
    { character: 'び', romanization: 'bi', type: 'hiragana' },
    { character: 'ぶ', romanization: 'bu', type: 'hiragana' },
    { character: 'べ', romanization: 'be', type: 'hiragana' },
    { character: 'ぼ', romanization: 'bo', type: 'hiragana' },

    // Handakuten (半濁点) - Semi-voiced sounds
    // Pa row
    { character: 'ぱ', romanization: 'pa', type: 'hiragana' },
    { character: 'ぴ', romanization: 'pi', type: 'hiragana' },
    { character: 'ぷ', romanization: 'pu', type: 'hiragana' },
    { character: 'ぺ', romanization: 'pe', type: 'hiragana' },
    { character: 'ぽ', romanization: 'po', type: 'hiragana' },

    // Combination sounds (Yōon) - Small ya, yu, yo
    // Kya row
    { character: 'きゃ', romanization: 'kya', type: 'hiragana' },
    { character: 'きゅ', romanization: 'kyu', type: 'hiragana' },
    { character: 'きょ', romanization: 'kyo', type: 'hiragana' },

    // Sha row
    { character: 'しゃ', romanization: 'sha', type: 'hiragana' },
    { character: 'しゅ', romanization: 'shu', type: 'hiragana' },
    { character: 'しょ', romanization: 'sho', type: 'hiragana' },

    // Cha row
    { character: 'ちゃ', romanization: 'cha', type: 'hiragana' },
    { character: 'ちゅ', romanization: 'chu', type: 'hiragana' },
    { character: 'ちょ', romanization: 'cho', type: 'hiragana' },

    // Nya row
    { character: 'にゃ', romanization: 'nya', type: 'hiragana' },
    { character: 'にゅ', romanization: 'nyu', type: 'hiragana' },
    { character: 'にょ', romanization: 'nyo', type: 'hiragana' },

    // Hya row
    { character: 'ひゃ', romanization: 'hya', type: 'hiragana' },
    { character: 'ひゅ', romanization: 'hyu', type: 'hiragana' },
    { character: 'ひょ', romanization: 'hyo', type: 'hiragana' },

    // Mya row
    { character: 'みゃ', romanization: 'mya', type: 'hiragana' },
    { character: 'みゅ', romanization: 'myu', type: 'hiragana' },
    { character: 'みょ', romanization: 'myo', type: 'hiragana' },

    // Rya row
    { character: 'りゃ', romanization: 'rya', type: 'hiragana' },
    { character: 'りゅ', romanization: 'ryu', type: 'hiragana' },
    { character: 'りょ', romanization: 'ryo', type: 'hiragana' },

    // Voiced combination sounds
    // Gya row
    { character: 'ぎゃ', romanization: 'gya', type: 'hiragana' },
    { character: 'ぎゅ', romanization: 'gyu', type: 'hiragana' },
    { character: 'ぎょ', romanization: 'gyo', type: 'hiragana' },

    // Ja row
    { character: 'じゃ', romanization: 'ja', type: 'hiragana' },
    { character: 'じゅ', romanization: 'ju', type: 'hiragana' },
    { character: 'じょ', romanization: 'jo', type: 'hiragana' },

    // Bya row
    { character: 'びゃ', romanization: 'bya', type: 'hiragana' },
    { character: 'びゅ', romanization: 'byu', type: 'hiragana' },
    { character: 'びょ', romanization: 'byo', type: 'hiragana' },

    // Pya row
    { character: 'ぴゃ', romanization: 'pya', type: 'hiragana' },
    { character: 'ぴゅ', romanization: 'pyu', type: 'hiragana' },
    { character: 'ぴょ', romanization: 'pyo', type: 'hiragana' },

    // Long vowels (Chōon)
    { character: 'あー', romanization: 'aa', type: 'hiragana' },
    { character: 'いー', romanization: 'ii', type: 'hiragana' },
    { character: 'うー', romanization: 'uu', type: 'hiragana' },
    { character: 'えー', romanization: 'ee', type: 'hiragana' },
    { character: 'おー', romanization: 'oo', type: 'hiragana' },
    { character: 'おう', romanization: 'ou', type: 'hiragana' },
    { character: 'えい', romanization: 'ei', type: 'hiragana' },

    // Small tsu (っ) - Gemination (doubled consonants)
    // K row
    { character: 'っか', romanization: 'kka', type: 'hiragana' },
    { character: 'っき', romanization: 'kki', type: 'hiragana' },
    { character: 'っく', romanization: 'kku', type: 'hiragana' },
    { character: 'っけ', romanization: 'kke', type: 'hiragana' },
    { character: 'っこ', romanization: 'kko', type: 'hiragana' },

    // S row
    { character: 'っさ', romanization: 'ssa', type: 'hiragana' },
    { character: 'っし', romanization: 'sshi', type: 'hiragana' },
    { character: 'っす', romanization: 'ssu', type: 'hiragana' },
    { character: 'っせ', romanization: 'sse', type: 'hiragana' },
    { character: 'っそ', romanization: 'sso', type: 'hiragana' },

    // T row
    { character: 'った', romanization: 'tta', type: 'hiragana' },
    { character: 'っち', romanization: 'tchi', type: 'hiragana' },
    { character: 'っつ', romanization: 'ttsu', type: 'hiragana' },
    { character: 'って', romanization: 'tte', type: 'hiragana' },
    { character: 'っと', romanization: 'tto', type: 'hiragana' },

    // P row
    { character: 'っぱ', romanization: 'ppa', type: 'hiragana' },
    { character: 'っぴ', romanization: 'ppi', type: 'hiragana' },
    { character: 'っぷ', romanization: 'ppu', type: 'hiragana' },
    { character: 'っぺ', romanization: 'ppe', type: 'hiragana' },
    { character: 'っぽ', romanization: 'ppo', type: 'hiragana' },

    // B row
    { character: 'っば', romanization: 'bba', type: 'hiragana' },
    { character: 'っび', romanization: 'bbi', type: 'hiragana' },
    { character: 'っぶ', romanization: 'bbu', type: 'hiragana' },
    { character: 'っべ', romanization: 'bbe', type: 'hiragana' },
    { character: 'っぼ', romanization: 'bbo', type: 'hiragana' },

    // G row
    { character: 'っが', romanization: 'gga', type: 'hiragana' },
    { character: 'っぎ', romanization: 'ggi', type: 'hiragana' },
    { character: 'っぐ', romanization: 'ggu', type: 'hiragana' },
    { character: 'っげ', romanization: 'gge', type: 'hiragana' },
    { character: 'っご', romanization: 'ggo', type: 'hiragana' },

    // Z row
    { character: 'っざ', romanization: 'zza', type: 'hiragana' },
    { character: 'っじ', romanization: 'jji', type: 'hiragana' },
    { character: 'っず', romanization: 'zzu', type: 'hiragana' },
    { character: 'っぜ', romanization: 'zze', type: 'hiragana' },
    { character: 'っぞ', romanization: 'zzo', type: 'hiragana' },

    // D row
    { character: 'っだ', romanization: 'dda', type: 'hiragana' },
    { character: 'っぢ', romanization: 'jji', type: 'hiragana' },
    { character: 'っづ', romanization: 'zzu', type: 'hiragana' },
    { character: 'っで', romanization: 'dde', type: 'hiragana' },
    { character: 'っど', romanization: 'ddo', type: 'hiragana' },

    // Combination sounds with small tsu
    { character: 'っきゃ', romanization: 'kkya', type: 'hiragana' },
    { character: 'っきゅ', romanization: 'kkyu', type: 'hiragana' },
    { character: 'っきょ', romanization: 'kkyo', type: 'hiragana' },
    { character: 'っしゃ', romanization: 'ssha', type: 'hiragana' },
    { character: 'っしゅ', romanization: 'sshu', type: 'hiragana' },
    { character: 'っしょ', romanization: 'ssho', type: 'hiragana' },
    { character: 'っちゃ', romanization: 'tcha', type: 'hiragana' },
    { character: 'っちゅ', romanization: 'tchu', type: 'hiragana' },
    { character: 'っちょ', romanization: 'tcho', type: 'hiragana' },
    { character: 'っぴゃ', romanization: 'ppya', type: 'hiragana' },
    { character: 'っぴゅ', romanization: 'ppyu', type: 'hiragana' },
    { character: 'っぴょ', romanization: 'ppyo', type: 'hiragana' },
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

    // Dakuten (濁点) - Voiced sounds
    // Ga row
    { character: 'ガ', romanization: 'ga', type: 'katakana' },
    { character: 'ギ', romanization: 'gi', type: 'katakana' },
    { character: 'グ', romanization: 'gu', type: 'katakana' },
    { character: 'ゲ', romanization: 'ge', type: 'katakana' },
    { character: 'ゴ', romanization: 'go', type: 'katakana' },

    // Za row
    { character: 'ザ', romanization: 'za', type: 'katakana' },
    { character: 'ジ', romanization: 'ji', type: 'katakana' },
    { character: 'ズ', romanization: 'zu', type: 'katakana' },
    { character: 'ゼ', romanization: 'ze', type: 'katakana' },
    { character: 'ゾ', romanization: 'zo', type: 'katakana' },

    // Da row
    { character: 'ダ', romanization: 'da', type: 'katakana' },
    { character: 'ヂ', romanization: 'ji', type: 'katakana' },
    { character: 'ヅ', romanization: 'zu', type: 'katakana' },
    { character: 'デ', romanization: 'de', type: 'katakana' },
    { character: 'ド', romanization: 'do', type: 'katakana' },

    // Ba row
    { character: 'バ', romanization: 'ba', type: 'katakana' },
    { character: 'ビ', romanization: 'bi', type: 'katakana' },
    { character: 'ブ', romanization: 'bu', type: 'katakana' },
    { character: 'ベ', romanization: 'be', type: 'katakana' },
    { character: 'ボ', romanization: 'bo', type: 'katakana' },

    // Handakuten (半濁点) - Semi-voiced sounds
    // Pa row
    { character: 'パ', romanization: 'pa', type: 'katakana' },
    { character: 'ピ', romanization: 'pi', type: 'katakana' },
    { character: 'プ', romanization: 'pu', type: 'katakana' },
    { character: 'ペ', romanization: 'pe', type: 'katakana' },
    { character: 'ポ', romanization: 'po', type: 'katakana' },

    // Combination sounds (Yōon) - Small ya, yu, yo
    // Kya row
    { character: 'キャ', romanization: 'kya', type: 'katakana' },
    { character: 'キュ', romanization: 'kyu', type: 'katakana' },
    { character: 'キョ', romanization: 'kyo', type: 'katakana' },

    // Sha row
    { character: 'シャ', romanization: 'sha', type: 'katakana' },
    { character: 'シュ', romanization: 'shu', type: 'katakana' },
    { character: 'ショ', romanization: 'sho', type: 'katakana' },

    // Cha row
    { character: 'チャ', romanization: 'cha', type: 'katakana' },
    { character: 'チュ', romanization: 'chu', type: 'katakana' },
    { character: 'チョ', romanization: 'cho', type: 'katakana' },

    // Nya row
    { character: 'ニャ', romanization: 'nya', type: 'katakana' },
    { character: 'ニュ', romanization: 'nyu', type: 'katakana' },
    { character: 'ニョ', romanization: 'nyo', type: 'katakana' },

    // Hya row
    { character: 'ヒャ', romanization: 'hya', type: 'katakana' },
    { character: 'ヒュ', romanization: 'hyu', type: 'katakana' },
    { character: 'ヒョ', romanization: 'hyo', type: 'katakana' },

    // Mya row
    { character: 'ミャ', romanization: 'mya', type: 'katakana' },
    { character: 'ミュ', romanization: 'myu', type: 'katakana' },
    { character: 'ミョ', romanization: 'myo', type: 'katakana' },

    // Rya row
    { character: 'リャ', romanization: 'rya', type: 'katakana' },
    { character: 'リュ', romanization: 'ryu', type: 'katakana' },
    { character: 'リョ', romanization: 'ryo', type: 'katakana' },

    // Voiced combination sounds
    // Gya row
    { character: 'ギャ', romanization: 'gya', type: 'katakana' },
    { character: 'ギュ', romanization: 'gyu', type: 'katakana' },
    { character: 'ギョ', romanization: 'gyo', type: 'katakana' },

    // Ja row
    { character: 'ジャ', romanization: 'ja', type: 'katakana' },
    { character: 'ジュ', romanization: 'ju', type: 'katakana' },
    { character: 'ジョ', romanization: 'jo', type: 'katakana' },

    // Bya row
    { character: 'ビャ', romanization: 'bya', type: 'katakana' },
    { character: 'ビュ', romanization: 'byu', type: 'katakana' },
    { character: 'ビョ', romanization: 'byo', type: 'katakana' },

    // Pya row
    { character: 'ピャ', romanization: 'pya', type: 'katakana' },
    { character: 'ピュ', romanization: 'pyu', type: 'katakana' },
    { character: 'ピョ', romanization: 'pyo', type: 'katakana' },

    // Long vowels (Chōon) - Katakana uses ー for long vowels
    { character: 'アー', romanization: 'aa', type: 'katakana' },
    { character: 'イー', romanization: 'ii', type: 'katakana' },
    { character: 'ウー', romanization: 'uu', type: 'katakana' },
    { character: 'エー', romanization: 'ee', type: 'katakana' },
    { character: 'オー', romanization: 'oo', type: 'katakana' },

    // Additional foreign sound combinations commonly used in Katakana
    { character: 'ファ', romanization: 'fa', type: 'katakana' },
    { character: 'フィ', romanization: 'fi', type: 'katakana' },
    { character: 'フェ', romanization: 'fe', type: 'katakana' },
    { character: 'フォ', romanization: 'fo', type: 'katakana' },
    { character: 'ヴァ', romanization: 'va', type: 'katakana' },
    { character: 'ヴィ', romanization: 'vi', type: 'katakana' },
    { character: 'ヴェ', romanization: 've', type: 'katakana' },
    { character: 'ヴォ', romanization: 'vo', type: 'katakana' },
    { character: 'ティ', romanization: 'ti', type: 'katakana' },
    { character: 'ディ', romanization: 'di', type: 'katakana' },
    { character: 'デュ', romanization: 'dyu', type: 'katakana' },
    { character: 'トゥ', romanization: 'tu', type: 'katakana' },
    { character: 'ドゥ', romanization: 'du', type: 'katakana' },

    // Small tsu (ッ) - Gemination (doubled consonants)
    // K row
    { character: 'ッカ', romanization: 'kka', type: 'katakana' },
    { character: 'ッキ', romanization: 'kki', type: 'katakana' },
    { character: 'ック', romanization: 'kku', type: 'katakana' },
    { character: 'ッケ', romanization: 'kke', type: 'katakana' },
    { character: 'ッコ', romanization: 'kko', type: 'katakana' },

    // S row
    { character: 'ッサ', romanization: 'ssa', type: 'katakana' },
    { character: 'ッシ', romanization: 'sshi', type: 'katakana' },
    { character: 'ッス', romanization: 'ssu', type: 'katakana' },
    { character: 'ッセ', romanization: 'sse', type: 'katakana' },
    { character: 'ッソ', romanization: 'sso', type: 'katakana' },

    // T row
    { character: 'ッタ', romanization: 'tta', type: 'katakana' },
    { character: 'ッチ', romanization: 'tchi', type: 'katakana' },
    { character: 'ッツ', romanization: 'ttsu', type: 'katakana' },
    { character: 'ッテ', romanization: 'tte', type: 'katakana' },
    { character: 'ット', romanization: 'tto', type: 'katakana' },

    // P row
    { character: 'ッパ', romanization: 'ppa', type: 'katakana' },
    { character: 'ッピ', romanization: 'ppi', type: 'katakana' },
    { character: 'ップ', romanization: 'ppu', type: 'katakana' },
    { character: 'ッペ', romanization: 'ppe', type: 'katakana' },
    { character: 'ッポ', romanization: 'ppo', type: 'katakana' },

    // B row
    { character: 'ッバ', romanization: 'bba', type: 'katakana' },
    { character: 'ッビ', romanization: 'bbi', type: 'katakana' },
    { character: 'ッブ', romanization: 'bbu', type: 'katakana' },
    { character: 'ッベ', romanization: 'bbe', type: 'katakana' },
    { character: 'ッボ', romanization: 'bbo', type: 'katakana' },

    // G row
    { character: 'ッガ', romanization: 'gga', type: 'katakana' },
    { character: 'ッギ', romanization: 'ggi', type: 'katakana' },
    { character: 'ッグ', romanization: 'ggu', type: 'katakana' },
    { character: 'ッゲ', romanization: 'gge', type: 'katakana' },
    { character: 'ッゴ', romanization: 'ggo', type: 'katakana' },

    // Z row
    { character: 'ッザ', romanization: 'zza', type: 'katakana' },
    { character: 'ッジ', romanization: 'jji', type: 'katakana' },
    { character: 'ッズ', romanization: 'zzu', type: 'katakana' },
    { character: 'ッゼ', romanization: 'zze', type: 'katakana' },
    { character: 'ッゾ', romanization: 'zzo', type: 'katakana' },

    // D row
    { character: 'ッダ', romanization: 'dda', type: 'katakana' },
    { character: 'ッヂ', romanization: 'jji', type: 'katakana' },
    { character: 'ッヅ', romanization: 'zzu', type: 'katakana' },
    { character: 'ッデ', romanization: 'dde', type: 'katakana' },
    { character: 'ッド', romanization: 'ddo', type: 'katakana' },

    // Combination sounds with small tsu
    { character: 'ッキャ', romanization: 'kkya', type: 'katakana' },
    { character: 'ッキュ', romanization: 'kkyu', type: 'katakana' },
    { character: 'ッキョ', romanization: 'kkyo', type: 'katakana' },
    { character: 'ッシャ', romanization: 'ssha', type: 'katakana' },
    { character: 'ッシュ', romanization: 'sshu', type: 'katakana' },
    { character: 'ッショ', romanization: 'ssho', type: 'katakana' },
    { character: 'ッチャ', romanization: 'tcha', type: 'katakana' },
    { character: 'ッチュ', romanization: 'tchu', type: 'katakana' },
    { character: 'ッチョ', romanization: 'tcho', type: 'katakana' },
    { character: 'ッピャ', romanization: 'ppya', type: 'katakana' },
    { character: 'ッピュ', romanization: 'ppyu', type: 'katakana' },
    { character: 'ッピョ', romanization: 'ppyo', type: 'katakana' },

    // Foreign words with small tsu (common in modern Japanese)
    { character: 'ッフ', romanization: 'ffu', type: 'katakana' },
    { character: 'ッファ', romanization: 'ffa', type: 'katakana' },
    { character: 'ッフィ', romanization: 'ffi', type: 'katakana' },
    { character: 'ッフェ', romanization: 'ffe', type: 'katakana' },
    { character: 'ッフォ', romanization: 'ffo', type: 'katakana' },
    { character: 'ッヴ', romanization: 'vvu', type: 'katakana' },
    { character: 'ッティ', romanization: 'tti', type: 'katakana' },
    { character: 'ッディ', romanization: 'ddi', type: 'katakana' },
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
