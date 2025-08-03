import { test } from '@japa/runner'
import sinon from 'sinon'

test.group('Japanese Teacher Sentence Handling', (group) => {
  let openaiStub: sinon.SinonStub

  group.setup(async () => {
    // Mock OpenAI responses to avoid real API calls
    const openaiModule = await import('#services/openai_service')
    openaiStub = sinon.stub(openaiModule.default.prototype, 'explainJapaneseForVietnamese')
  })

  group.teardown(() => {
    sinon.restore()
  })

  test('should handle complete sentences with comprehensive explanations', async ({
    client,
    assert,
  }) => {
    // Mock response for a complete sentence
    const mockSentenceResponse = JSON.stringify({
      input: '今日は天気がいいです。',
      romaji: 'Kyou wa tenki ga ii desu.',
      furigana: '今日（きょう）は天気（てんき）がいいです。',
      meaning_vietnamese:
        'Hôm nay thời tiết đẹp. Đây là một câu hoàn chỉnh diễn tả tình trạng thời tiết hiện tại với mức độ lịch sự.',
      pronunciation_guide:
        'Kyou (như "kyeo" trong tiếng Việt), wa (đọc như "wa"), tenki (ten-ki), ga (như "ga"), ii (như "i" dài), desu (đọc như "des", không phát âm "u")',
      example_japanese: '明日も天気がいいでしょう。',
      example_vietnamese: 'Ngày mai thời tiết cũng sẽ đẹp.',
      note: 'Cấu trúc câu: Chủ ngữ + は + Danh từ + が + Tính từ + です。Đây là mẫu câu cơ bản để mô tả trạng thái. "です" thể hiện mức độ lịch sự. Trợ từ "は" đánh dấu chủ đề, "が" đánh dấu chủ ngữ của tính từ.',
    })

    openaiStub.resolves(mockSentenceResponse)

    const response = await client
      .post('/api/japanese-teacher')
      .json({ input: '今日は天気がいいです。' })

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const responseData = response.body()
    assert.isObject(responseData.data)
    assert.equal(responseData.data.input, '今日は天気がいいです。')
    assert.isTrue(responseData.data.meaning_vietnamese.includes('câu hoàn chỉnh'))
    assert.isTrue(responseData.data.note.includes('Cấu trúc câu'))
  })

  test('should handle single words with focused explanations', async ({ client, assert }) => {
    // Mock response for a single word
    const mockWordResponse = JSON.stringify({
      input: '本',
      romaji: 'hon',
      furigana: '本（ほん）',
      meaning_vietnamese: 'Sách, quyển sách',
      pronunciation_guide: 'Phát âm "hon" như "hôn" trong tiếng Việt nhưng ngắn hơn',
      example_japanese: '私は本を読みます。',
      example_vietnamese: 'Tôi đọc sách.',
      note: 'Danh từ cơ bản, thường dùng trong cuộc sống hàng ngày. Có thể kết hợp với các từ khác tạo thành từ ghép như 教科書 (kyoukasho - sách giáo khoa).',
    })

    openaiStub.resolves(mockWordResponse)

    const response = await client.post('/api/japanese-teacher').json({ input: '本' })

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const responseData = response.body()
    assert.isObject(responseData.data)
    assert.equal(responseData.data.input, '本')
    assert.equal(responseData.data.meaning_vietnamese, 'Sách, quyển sách')
  })

  test('should handle complex sentences with grammar analysis', async ({ client, assert }) => {
    // Mock response for a complex sentence
    const mockComplexResponse = JSON.stringify({
      input: '私は毎日日本語を勉強しています。',
      romaji: 'Watashi wa mainichi nihongo wo benkyou shite imasu.',
      furigana: '私（わたし）は毎日（まいにち）日本語（にほんご）を勉強（べんきょう）しています。',
      meaning_vietnamese:
        'Tôi đang học tiếng Nhật hàng ngày. Câu này diễn tả một hành động đang diễn ra thường xuyên.',
      pronunciation_guide:
        'Watashi (wa-ta-shi), wa (như "wa"), mainichi (mai-ni-chi), nihongo (ni-hon-go), wo (đọc như "o"), benkyou (ben-kyou), shite imasu (shi-te i-mas)',
      example_japanese: '彼女は毎週英語を教えています。',
      example_vietnamese: 'Cô ấy đang dạy tiếng Anh hàng tuần.',
      note: 'Cấu trúc: 私は + 時間 + 目的語を + 動詞ています。Thì hiện tại tiếp diễn với "ています" diễn tả hành động thường xuyên hoặc đang diễn ra. "を" là trợ từ đánh dấu tân ngữ trực tiếp. Mức độ lịch sự với "います".',
    })

    openaiStub.resolves(mockComplexResponse)

    const response = await client
      .post('/api/japanese-teacher')
      .json({ input: '私は毎日日本語を勉強しています。' })

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const responseData = response.body()
    assert.isObject(responseData.data)
    assert.isTrue(responseData.data.meaning_vietnamese.includes('hành động'))
    assert.isTrue(responseData.data.note.includes('Cấu trúc'))
    assert.isTrue(responseData.data.note.includes('ています'))
  })

  test('should handle questions and different sentence types', async ({ client, assert }) => {
    // Mock response for a question sentence
    const mockQuestionResponse = JSON.stringify({
      input: 'あなたの名前は何ですか？',
      romaji: 'Anata no namae wa nan desu ka?',
      furigana: 'あなたの名前（なまえ）は何（なん）ですか？',
      meaning_vietnamese: 'Tên của bạn là gì? Đây là câu hỏi lịch sự để hỏi tên của ai đó.',
      pronunciation_guide:
        'Anata (a-na-ta), no (như "no"), namae (na-ma-e), wa (như "wa"), nan (như "nan"), desu (des), ka (như "ka" nhẹ)',
      example_japanese: 'あなたの趣味は何ですか？',
      example_vietnamese: 'Sở thích của bạn là gì?',
      note: 'Cấu trúc câu hỏi: 主語 + の + 名詞 + は + 疑問詞 + ですか？"の" thể hiện sở hữu, "は" đánh dấu chủ đề, "何" là từ để hỏi, "か" biến câu thành câu hỏi. Đây là cách hỏi lịch sự trong tiếng Nhật.',
    })

    openaiStub.resolves(mockQuestionResponse)

    const response = await client
      .post('/api/japanese-teacher')
      .json({ input: 'あなたの名前は何ですか？' })

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const responseData = response.body()
    assert.isObject(responseData.data)
    assert.isTrue(responseData.data.meaning_vietnamese.includes('câu hỏi'))
    assert.isTrue(responseData.data.note.includes('Cấu trúc câu hỏi'))
  })

  test('should validate required fields in response', async ({ client, assert }) => {
    const mockResponse = JSON.stringify({
      input: 'テスト',
      romaji: 'tesuto',
      furigana: 'テスト',
      meaning_vietnamese: 'Bài kiểm tra, thử nghiệm',
      pronunciation_guide: 'Te-su-to, phát âm như "test" trong tiếng Anh',
      example_japanese: 'テストを受けます。',
      example_vietnamese: 'Tôi sẽ làm bài kiểm tra.',
      note: 'Từ vay mượn từ tiếng Anh "test", viết bằng katakana.',
    })

    openaiStub.resolves(mockResponse)

    const response = await client.post('/api/japanese-teacher').json({ input: 'テスト' })

    response.assertStatus(200)

    const responseData = response.body()
    const requiredFields = [
      'input',
      'romaji',
      'furigana',
      'meaning_vietnamese',
      'pronunciation_guide',
      'example_japanese',
      'example_vietnamese',
      'note',
    ]

    requiredFields.forEach((field) => {
      assert.property(responseData.data, field)
      assert.isString(responseData.data[field])
      assert.isTrue(responseData.data[field].length > 0)
    })
  })
})
