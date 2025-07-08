import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import QuestionnaireResponse from '#models/questionnaire_response'

export default class CleanupExpiredSessions extends BaseCommand {
  static commandName = 'cleanup:expired-sessions'
  static description = 'Clean up expired assessment sessions and reset incomplete assessments'

  static options: CommandOptions = {
    flags: [
      {
        name: 'timeout',
        description: 'Session timeout in minutes (default: 30)',
        type: 'number',
        default: 30,
      },
      {
        name: 'dry-run',
        description: 'Show what would be cleaned up without actually doing it',
        type: 'boolean',
        default: false,
      },
    ],
  }

  async run() {
    const { timeout, dryRun } = this.parsed.flags

    this.logger.info(`Looking for expired sessions (timeout: ${timeout} minutes)`)

    // Find expired sessions using the model scope
    const expiredSessions = await QuestionnaireResponse.expiredSessions(timeout)

    if (expiredSessions.length === 0) {
      this.logger.success('No expired sessions found')
      return
    }

    this.logger.info(`Found ${expiredSessions.length} expired sessions`)

    if (dryRun) {
      this.logger.info('DRY RUN - Would clean up the following sessions:')
      for (const session of expiredSessions) {
        this.logger.info(
          `- Session ID: ${session.submissionId}, Last activity: ${session.lastActivityAt?.toFormat('yyyy-MM-dd HH:mm:ss')}`
        )
      }
      return
    }

    // Reset expired sessions
    let cleanedCount = 0
    for (const session of expiredSessions) {
      session.currentQuestion = 1
      session.questionsCompleted = 0
      session.responses = {}
      session.lastActivityAt = null
      session.startedAt = null

      await session.save()
      cleanedCount++
    }

    this.logger.success(`Successfully cleaned up ${cleanedCount} expired sessions`)
  }
}
