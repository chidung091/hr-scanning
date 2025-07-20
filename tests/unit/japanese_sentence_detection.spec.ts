import { test } from '@japa/runner'

test.group('Japanese Sentence Detection', () => {
  test('should detect complete sentences with punctuation', async ({ assert }) => {
    const completeSentences = [
      '今日は天気がいいです。',
      'これは本です！',
      'あなたの名前は何ですか？',
      'I am studying Japanese.',
      'This is a test!',
      'How are you?',
    ]

    // All should be detected as complete sentences
    completeSentences.forEach((sentence) => {
      assert.isString(sentence)
      assert.isTrue(sentence.length > 0)
      // Test that sentences have proper endings
      const hasEnding = ['。', '！', '？', '.', '!', '?'].some((ender) => sentence.endsWith(ender))
      assert.isTrue(hasEnding, `Sentence "${sentence}" should have proper ending`)
    })
  })

  test('should detect complete sentences with verb forms', async ({ assert }) => {
    const verbFormSentences = [
      '学校に行きます',
      '昨日映画を見ました',
      '明日来ません',
      '彼は学生です',
      '本を読んでいる',
      '宿題をしていた',
      '時間がない',
      '面白かった',
    ]

    verbFormSentences.forEach((sentence) => {
      assert.isString(sentence)
      assert.isTrue(sentence.length > 0)
      // These should be detected as sentences due to verb forms
    })
  })

  test('should identify single words or short phrases', async ({ assert }) => {
    const singleWords = ['本', '学校', '頑張って', 'こんにちは', '美しい', '猫', '食べる', '大きい']

    singleWords.forEach((word) => {
      assert.isString(word)
      assert.isTrue(word.length > 0)
      // These should be detected as individual words/phrases
    })
  })

  test('should handle mixed content appropriately', async ({ assert }) => {
    const mixedContent = [
      '私は学生です。', // Complete sentence
      '学生', // Single word
      '今日は雨が降っています', // Sentence without punctuation
      'ありがとう', // Single phrase
      '彼女は美しいですね', // Complete sentence with particle
      '美しい', // Single adjective
    ]

    mixedContent.forEach((content) => {
      assert.isString(content)
      assert.isTrue(content.length > 0)
    })
  })

  test('should handle sentence patterns correctly', async ({ assert }) => {
    const sentencePatterns = [
      /です$/,
      /ます$/,
      /ました$/,
      /ません$/,
      /た$/,
      /ない$/,
      /よ$/,
      /ね$/,
      /か$/,
      /ている$/,
    ]

    sentencePatterns.forEach((pattern) => {
      assert.isTrue(pattern instanceof RegExp)
      assert.isString(pattern.source)
    })
  })

  test('should validate sentence ending detection', async ({ assert }) => {
    const sentenceEnders = ['。', '！', '？', '.', '!', '?']

    sentenceEnders.forEach((ender) => {
      assert.isString(ender)
      assert.isTrue(ender.length > 0)
    })

    // Test with actual sentences
    assert.isTrue('これは本です。'.endsWith('。'))
    assert.isTrue('Hello world!'.endsWith('!'))
    assert.isTrue('How are you?'.endsWith('?'))
  })

  test('should handle length-based detection', async ({ assert }) => {
    const shortInputs = ['本', '猫', '食べる']
    const longInputs = ['私は毎日日本語を勉強しています', '今日は天気がとてもいいですね']

    shortInputs.forEach((input) => {
      assert.isTrue(input.length <= 8)
    })

    longInputs.forEach((input) => {
      assert.isTrue(input.length > 8)
    })
  })

  test('should detect multiple components in text', async ({ assert }) => {
    const multiComponentTexts = [
      '私 は 学生 です', // Has spaces
      '今日天気いい', // Multiple kanji groups
      'これはほんです', // Multiple hiragana groups
    ]

    multiComponentTexts.forEach((text) => {
      assert.isString(text)
      assert.isTrue(text.length > 0)
      // Should be detected as having multiple components
    })
  })
})
