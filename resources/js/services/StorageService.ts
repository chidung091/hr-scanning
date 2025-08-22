import type { QuizType, ProgressStats } from '../types/index.ts'

interface StoredStats {
  hiragana: ProgressStats | null
  katakana: ProgressStats | null
  n5: ProgressStats | null
}

interface StoredProgressStats {
  quizzes: number
  totalQuestions: number
  totalCorrect: number
  bestScore: number
}

/**
 * StorageService - Handles local storage operations for quiz progress
 */
export class StorageService {
  private readonly STORAGE_KEY = 'japaneseQuizStats'

  /**
   * Get stored quiz statistics
   */
  getStats(): StoredStats {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : this._getDefaultStats()
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return this._getDefaultStats()
    }
  }

  /**
   * Update quiz statistics
   */
  updateStats(type: QuizType, score: number, total: number): void {
    try {
      const stats = this.getStats()

      if (!stats[type]) {
        stats[type] = {
          quizzesTaken: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          bestScore: 0,
          accuracy: 0,
        }
      }

      const typeStats = stats[type]!
      typeStats.quizzesTaken++
      typeStats.totalQuestions += total
      typeStats.totalCorrect += score
      typeStats.bestScore = Math.max(typeStats.bestScore, score)
      typeStats.accuracy = Math.round((typeStats.totalCorrect / typeStats.totalQuestions) * 100)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  /**
   * Get statistics for a specific quiz type
   */
  getStatsForType(type: QuizType): ProgressStats | null {
    const stats = this.getStats()
    return stats[type] || null
  }

  /**
   * Get overall statistics across all quiz types
   */
  getOverallStats(): { totalQuestions: number; totalCorrect: number; overallAccuracy: number } {
    const stats = this.getStats()

    const totalQuestions =
      (stats.hiragana?.totalQuestions || 0) + (stats.katakana?.totalQuestions || 0)
    const totalCorrect = (stats.hiragana?.totalCorrect || 0) + (stats.katakana?.totalCorrect || 0)
    const overallAccuracy =
      totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

    return {
      totalQuestions,
      totalCorrect,
      overallAccuracy,
    }
  }

  /**
   * Clear all stored statistics
   */
  clearStats(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  /**
   * Export statistics as JSON
   */
  exportStats(): string {
    return JSON.stringify(this.getStats(), null, 2)
  }

  /**
   * Import statistics from JSON
   */
  importStats(jsonString: string): void {
    try {
      const stats = JSON.parse(jsonString)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats))
    } catch (error) {
      console.error('Error importing statistics:', error)
      throw new Error('Invalid statistics format')
    }
  }

  /**
   * Get default statistics structure
   */
  private _getDefaultStats(): StoredStats {
    return {
      hiragana: null,
      katakana: null,
      n5: null,
    }
  }
}
