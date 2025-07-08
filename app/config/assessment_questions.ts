export interface AssessmentQuestion {
  id: number
  key: string
  type: 'multiple_choice' | 'text' | 'rating'
  required: boolean
  validation: {
    minLength?: number
    maxLength?: number
    options?: string[]
  }
  scoring: {
    maxPoints: number
    criteria: Record<string, number>
  }
  translations: {
    en: {
      title: string
      description?: string
      placeholder?: string
      options?: string[]
    }
    vi: {
      title: string
      description?: string
      placeholder?: string
      options?: string[]
    }
  }
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    key: 'work_style_environment',
    type: 'multiple_choice',
    required: true,
    validation: {
      options: ['remote', 'office', 'hybrid', 'flexible'],
    },
    scoring: {
      maxPoints: 20,
      criteria: {
        remote: 15,
        office: 20,
        hybrid: 18,
        flexible: 16,
      },
    },
    translations: {
      en: {
        title: 'What is your preferred work style and environment?',
        description: 'Select the work arrangement that best suits your productivity and lifestyle.',
        options: [
          'Remote work from home',
          'Traditional office environment',
          'Hybrid (mix of remote and office)',
          'Flexible arrangement based on project needs',
        ],
      },
      vi: {
        title: 'Phong cách làm việc và môi trường nào bạn ưa thích?',
        description: 'Chọn cách thức làm việc phù hợp nhất với năng suất và lối sống của bạn.',
        options: [
          'Làm việc từ xa tại nhà',
          'Môi trường văn phòng truyền thống',
          'Kết hợp (vừa từ xa vừa tại văn phòng)',
          'Sắp xếp linh hoạt theo nhu cầu dự án',
        ],
      },
    },
  },
  {
    id: 2,
    key: 'overtime_commitment',
    type: 'multiple_choice',
    required: true,
    validation: {
      options: ['always_available', 'reasonable_notice', 'emergency_only', 'prefer_avoid'],
    },
    scoring: {
      maxPoints: 20,
      criteria: {
        always_available: 20,
        reasonable_notice: 18,
        emergency_only: 15,
        prefer_avoid: 10,
      },
    },
    translations: {
      en: {
        title: 'How do you respond to overtime or urgent work requests?',
        description:
          'Your approach to handling additional work responsibilities and time commitments.',
        options: [
          'Always available and willing to work extra hours',
          'Available with reasonable advance notice',
          'Only for genuine emergencies or critical deadlines',
          'Prefer to avoid overtime and maintain work-life balance',
        ],
      },
      vi: {
        title: 'Bạn phản ứng như thế nào với yêu cầu làm thêm giờ hoặc công việc khẩn cấp?',
        description:
          'Cách tiếp cận của bạn đối với trách nhiệm công việc bổ sung và cam kết thời gian.',
        options: [
          'Luôn sẵn sàng và sẵn lòng làm thêm giờ',
          'Sẵn sàng với thông báo trước hợp lý',
          'Chỉ trong trường hợp khẩn cấp thực sự hoặc deadline quan trọng',
          'Ưu tiên tránh làm thêm giờ và duy trì cân bằng cuộc sống',
        ],
      },
    },
  },
  {
    id: 3,
    key: 'recognition_reward',
    type: 'multiple_choice',
    required: true,
    validation: {
      options: [
        'public_recognition',
        'financial_rewards',
        'career_advancement',
        'personal_feedback',
        'team_appreciation',
      ],
    },
    scoring: {
      maxPoints: 20,
      criteria: {
        public_recognition: 16,
        financial_rewards: 18,
        career_advancement: 20,
        personal_feedback: 17,
        team_appreciation: 15,
      },
    },
    translations: {
      en: {
        title: 'What type of recognition or reward makes you feel most valued at work?',
        description: 'Understanding what motivates and energizes you in a professional setting.',
        options: [
          'Public recognition and acknowledgment of achievements',
          'Financial bonuses and monetary rewards',
          'Career advancement opportunities and promotions',
          'Personal feedback and one-on-one appreciation',
          'Team appreciation and peer recognition',
        ],
      },
      vi: {
        title:
          'Loại ghi nhận hoặc phần thưởng nào khiến bạn cảm thấy được trân trọng nhất tại nơi làm việc?',
        description:
          'Hiểu rõ điều gì thúc đẩy và tạo động lực cho bạn trong môi trường chuyên nghiệp.',
        options: [
          'Ghi nhận công khai và thừa nhận thành tích',
          'Thưởng tài chính và phần thưởng tiền bạc',
          'Cơ hội thăng tiến sự nghiệp và thăng chức',
          'Phản hồi cá nhân và sự đánh giá cao trực tiếp',
          'Sự đánh giá cao từ nhóm và ghi nhận từ đồng nghiệp',
        ],
      },
    },
  },
  {
    id: 4,
    key: 'feedback_communication',
    type: 'multiple_choice',
    required: true,
    validation: {
      options: [
        'embrace_learn',
        'analyze_improve',
        'discuss_clarify',
        'defensive_initially',
        'prefer_positive',
      ],
    },
    scoring: {
      maxPoints: 20,
      criteria: {
        embrace_learn: 20,
        analyze_improve: 18,
        discuss_clarify: 16,
        defensive_initially: 12,
        prefer_positive: 10,
      },
    },
    translations: {
      en: {
        title: 'How do you typically handle difficult or constructive feedback?',
        description:
          'Your approach to receiving and processing challenging feedback from supervisors or colleagues.',
        options: [
          'Embrace it as a learning opportunity and ask for specific examples',
          'Take time to analyze it privately, then create an improvement plan',
          'Discuss it openly to understand different perspectives',
          'Initially feel defensive but eventually work through it constructively',
          'Prefer positive feedback and find criticism demotivating',
        ],
      },
      vi: {
        title: 'Bạn thường xử lý phản hồi khó khăn hoặc mang tính xây dựng như thế nào?',
        description:
          'Cách tiếp cận của bạn khi nhận và xử lý phản hồi thách thức từ cấp trên hoặc đồng nghiệp.',
        options: [
          'Coi đó là cơ hội học hỏi và yêu cầu ví dụ cụ thể',
          'Dành thời gian phân tích riêng tư, sau đó tạo kế hoạch cải thiện',
          'Thảo luận cởi mở để hiểu các quan điểm khác nhau',
          'Ban đầu cảm thấy phòng thủ nhưng cuối cùng xử lý một cách xây dựng',
          'Ưa thích phản hồi tích cực và thấy chỉ trích làm mất động lực',
        ],
      },
    },
  },
  {
    id: 5,
    key: 'learning_growth',
    type: 'text',
    required: true,
    validation: {
      minLength: 50,
      maxLength: 500,
    },
    scoring: {
      maxPoints: 20,
      criteria: {
        detailed_specific: 20,
        general_examples: 15,
        vague_response: 10,
        minimal_effort: 5,
      },
    },
    translations: {
      en: {
        title: "Describe a recent learning experience or skill you've developed in the past year.",
        description:
          'Share details about what you learned, how you approached it, and how it has benefited you professionally.',
        placeholder:
          'Example: I learned React.js through online courses and built a personal project. This helped me understand modern web development and improved my problem-solving skills...',
      },
      vi: {
        title:
          'Mô tả một trải nghiệm học tập gần đây hoặc kỹ năng bạn đã phát triển trong năm qua.',
        description:
          'Chia sẻ chi tiết về những gì bạn đã học, cách bạn tiếp cận và nó đã mang lại lợi ích gì cho bạn trong công việc.',
        placeholder:
          'Ví dụ: Tôi đã học React.js thông qua các khóa học trực tuyến và xây dựng một dự án cá nhân. Điều này giúp tôi hiểu về phát triển web hiện đại và cải thiện kỹ năng giải quyết vấn đề...',
      },
    },
  },
  {
    id: 6,
    key: 'longterm_motivation',
    type: 'multiple_choice',
    required: true,
    validation: {
      options: [
        'growth_opportunities',
        'company_culture',
        'work_life_balance',
        'compensation_benefits',
        'meaningful_work',
        'team_relationships',
      ],
    },
    scoring: {
      maxPoints: 20,
      criteria: {
        growth_opportunities: 20,
        company_culture: 18,
        work_life_balance: 16,
        compensation_benefits: 14,
        meaningful_work: 19,
        team_relationships: 17,
      },
    },
    translations: {
      en: {
        title: 'What factor would most likely keep you committed to a company long-term?',
        description:
          'Consider what aspects of a workplace environment contribute most to your job satisfaction and loyalty.',
        options: [
          'Continuous learning and career growth opportunities',
          'Strong company culture and shared values',
          'Excellent work-life balance and flexibility',
          'Competitive compensation and comprehensive benefits',
          'Meaningful work that makes a positive impact',
          'Strong relationships with colleagues and management',
        ],
      },
      vi: {
        title: 'Yếu tố nào có khả năng cao nhất giữ bạn gắn bó lâu dài với một công ty?',
        description:
          'Xem xét những khía cạnh nào của môi trường làm việc đóng góp nhiều nhất vào sự hài lòng và lòng trung thành trong công việc của bạn.',
        options: [
          'Cơ hội học hỏi liên tục và phát triển sự nghiệp',
          'Văn hóa công ty mạnh mẽ và giá trị chung',
          'Cân bằng cuộc sống công việc tuyệt vời và tính linh hoạt',
          'Mức lương cạnh tranh và phúc lợi toàn diện',
          'Công việc có ý nghĩa tạo ra tác động tích cực',
          'Mối quan hệ tốt với đồng nghiệp và ban quản lý',
        ],
      },
    },
  },
]

export const ASSESSMENT_CONFIG = {
  totalQuestions: 6,
  maxTotalScore: 120,
  timeoutMinutes: 30,
  scoringThresholds: {
    excellent: 100,
    good: 80,
    fair: 60,
    poor: 0,
  },
  defaultLanguage: 'en' as const,
  supportedLanguages: ['en', 'vi'] as const,
}

export function getQuestionByKey(key: string): AssessmentQuestion | undefined {
  return ASSESSMENT_QUESTIONS.find((q) => q.key === key)
}

export function getQuestionById(id: number): AssessmentQuestion | undefined {
  return ASSESSMENT_QUESTIONS.find((q) => q.id === id)
}

export function calculateAssessmentScore(responses: Record<string, any>): {
  totalScore: number
  questionScores: Record<string, number>
  assessmentResult: string
} {
  let totalScore = 0
  const questionScores: Record<string, number> = {}

  ASSESSMENT_QUESTIONS.forEach((question) => {
    const response = responses[question.key]
    let score = 0

    if (response) {
      if (question.type === 'multiple_choice' && question.scoring.criteria[response]) {
        score = question.scoring.criteria[response]
      } else if (
        question.type === 'text' &&
        response.length >= (question.validation.minLength || 0)
      ) {
        // Score text responses based on length and quality
        if (response.length >= 200) {
          score = question.scoring.criteria.detailed_specific || question.scoring.maxPoints
        } else if (response.length >= 100) {
          score =
            question.scoring.criteria.general_examples ||
            Math.floor(question.scoring.maxPoints * 0.75)
        } else if (response.length >= 50) {
          score =
            question.scoring.criteria.vague_response || Math.floor(question.scoring.maxPoints * 0.5)
        } else {
          score =
            question.scoring.criteria.minimal_effort ||
            Math.floor(question.scoring.maxPoints * 0.25)
        }
      }
    }

    questionScores[question.key] = score
    totalScore += score
  })

  let assessmentResult = 'poor'
  if (totalScore >= ASSESSMENT_CONFIG.scoringThresholds.excellent) {
    assessmentResult = 'excellent'
  } else if (totalScore >= ASSESSMENT_CONFIG.scoringThresholds.good) {
    assessmentResult = 'good'
  } else if (totalScore >= ASSESSMENT_CONFIG.scoringThresholds.fair) {
    assessmentResult = 'fair'
  }

  return {
    totalScore,
    questionScores,
    assessmentResult,
  }
}
