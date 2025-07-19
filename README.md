# 🇯🇵 Japanese Learning Quiz

An interactive web application for learning Japanese Hiragana and Katakana characters through engaging quizzes.

## ✨ Features

- **Interactive Quizzes**: 20-question sessions for both Hiragana and Katakana
- **Immediate Feedback**: Get instant feedback on your answers
- **Progress Tracking**: Track your learning progress with detailed statistics
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Local Storage**: Your progress is saved locally in your browser
- **AI-Ready**: OpenAI integration ready for future AI-powered learning features

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v12 or higher) - for future features

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd japanese-learning-quiz
```

2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.example .env
```

4. Generate an application key:

```bash
node ace generate:key
```

5. (Optional) Set up PostgreSQL database for future features:
```bash
# Create database
createdb japanese_learning_quiz

# Run migrations (when available)
npm run migration:run
```

6. Start the development server:

```bash
npm run dev
```

7. Open your browser and visit `http://localhost:3333`

## 🎮 How to Use

1. **Choose Your Mode**: Select either Hiragana or Katakana quiz
2. **Take the Quiz**: Answer 20 multiple-choice questions
3. **Get Feedback**: See immediate feedback on each answer
4. **View Results**: Check your final score and accuracy
5. **Track Progress**: Monitor your improvement over time

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 3333)
- `HOST`: Server host (default: localhost)
- `APP_KEY`: Application encryption key (required)
- `SESSION_DRIVER`: Session storage driver (default: cookie)

### Database Configuration (Optional - for future features)

- `DB_CONNECTION`: Database connection type (postgres)
- `DB_HOST`: Database host (default: localhost)
- `DB_PORT`: Database port (default: 5432)
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_DATABASE`: Database name

### Optional OpenAI Configuration (for future features)

- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_MODEL`: Model to use (default: gpt-4o-mini)
- `OPENAI_MAX_TOKENS`: Maximum tokens per request (default: 1000)
- `OPENAI_TEMPERATURE`: Response creativity (default: 0.7)

## 📚 Learning Content

### Hiragana (ひらがな)

- 46 basic characters covering all Japanese syllables
- Used for native Japanese words and grammatical elements

### Katakana (カタカナ)

- 46 basic characters (same sounds as Hiragana)
- Used for foreign words, onomatopoeia, and emphasis

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking

### Database Scripts (for future features)

- `npm run migration:run` - Run database migrations
- `npm run migration:rollback` - Rollback all migrations
- `npm run migration:status` - Check migration status

### Project Structure

```
├── app/
│   ├── controllers/         # Route controllers
│   └── services/           # Business logic services
├── resources/
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   └── views/             # Edge.js templates
├── start/                 # Application bootstrap
└── tests/                 # Test files
```

## 🔮 Future Features

With PostgreSQL and Lucid ORM ready, we can easily add:

- **User Accounts**: Personal progress tracking and statistics
- **Learning History**: Detailed analytics of your learning journey
- **Leaderboards**: Compare progress with other learners
- **Custom Study Sets**: Create and share character sets
- **Spaced Repetition**: Intelligent review scheduling based on performance
- **AI-Powered Explanations**: Character explanations using OpenAI
- **Adaptive Learning**: AI-generated questions based on your progress
- **Study Tips**: Personalized learning recommendations
- **Advanced Quizzes**: Kanji learning and vocabulary tests
- **Achievement System**: Badges and milestones for motivation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License.

## 🙏 Acknowledgments

- Built with [AdonisJS](https://adonisjs.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Japanese character data sourced from standard Hiragana/Katakana charts
- Future AI features powered by [OpenAI](https://openai.com/)

---

Happy learning! 🎌 頑張って！ (Ganbatte! - Good luck!)
