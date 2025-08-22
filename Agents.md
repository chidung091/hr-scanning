# Japanese Learning Quiz - Agents Guide

This document lists the essential files and components for the Japanese learning quiz application. Use it as a quick reference when navigating or extending the codebase.

## Backend (AdonisJS)

### Controllers
- app/controllers/home_controller.ts
  - Home page (pages/home.edge)
  - Session-based quiz APIs:
    - POST /api/quiz/start
    - GET /api/quiz/:sessionId/question
    - POST /api/quiz/:sessionId/answer
    - GET /api/quiz/:sessionId/progress
  - Japanese Teacher API: POST /api/japanese-teacher

- app/controllers/quiz_controller.ts
  - Deprecated direct N5 quiz endpoints (commented in routes):
    - GET /quiz/n5
    - GET /quiz/n5/new
    - POST /quiz/n5/explain

### Services
- app/services/n5_quiz_service.ts
  - JLPT N5 generation via OpenAI
  - Strict JSON prompt (10 questions)
  - Robust parsing helpers (strip code fences, balanced JSON, sanitation)
  - Partial salvage + fallback to demo questions
  - AI response logging to ai_logs/ (toggle with N5_AI_LOG=true)
  - Explain endpoint for answers

- app/services/quiz_session_service.ts
  - Session lifecycle for quizzes (hiragana/katakana/n5)
  - Uses JapaneseCharactersService for kana, N5QuizService for N5

- app/services/japanese_characters_service.ts
  - Loads kana datasets and generates MCQ questions locally

- app/services/openai_service.ts
  - Centralized OpenAI chat API wrapper
  - Note: generateQuizQuestions() for kana is currently unused (kept for future)

### Routes
- start/routes.ts
  - Session-based quiz API under /api
  - Deprecated direct N5 routes are commented out

## Frontend (Vite + TS)

### Components
- resources/js/components/Quiz.ts
  - Orchestrates state + view
  - Displays a loading overlay for N5 while waiting for API
- resources/js/components/QuizView.ts
  - View helpers
  - showLoading() creates non-destructive overlay
  - showQuizInterface() hides overlay and sets titles
- resources/js/components/QuizState.ts
  - Manages session state; calls QuizAPI

### Services
- resources/js/services/QuizAPI.ts
  - Wraps /api endpoints (start, question, answer)
  - Handles CSRF from meta tag

### Types
- resources/js/types/index.ts
  - Shared TS types for quiz flows

### Views
- resources/views/pages/home.edge
  - Main page: includes partials and app initialization
- resources/views/partials/*.edge
  - quiz-interface.edge, quiz-results.edge, etc.

## Tests
- tests/unit
  - Configuration and general UI checks
- tests/functional
  - End-to-end checks for UI structure and Teacher API

Note: Keep tests fast and deterministic; mock OpenAI in tests when needed.

## Configuration
- start/kernel.ts
  - Middleware stack (bodyparser, session, shield, vite)
- .env
  - N5_AI_LOG=true to save AI responses to ai_logs/
- .gitignore
  - ai_logs/ is ignored; also ignores build and typical dev artifacts

## Conventions & Notes
- Preferred N5 generation: N5QuizService only; legacy QuizService removed
- Loading UX: Use overlay (do not replace container innerHTML)
- Security: CSRF enabled via Shield; use QuizAPI to send requests
- Do not modify migrations or clear data without explicit approval

## Common Tasks
- Enable logging: set N5_AI_LOG=true, restart server, trigger N5 quiz
- Adjust number of N5 questions: change EXPECTED_COUNT in n5_quiz_service.ts
- Investigate AI parse issues: check ai_logs/ files

## Cleanup Status
- Legacy quiz_service removed
- Direct N5 routes commented out to prefer session-based flow

