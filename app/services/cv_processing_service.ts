import logger from '@adonisjs/core/services/logger'
import CvSubmission from '#models/cv_submission'
import ProcessedCv from '#models/processed_cv'
import openaiService from '#services/openai_service'
import { DateTime } from 'luxon'

/**
 * Result of CV processing workflow
 */
export interface CvProcessingResult {
  success: boolean
  processedCvId?: number
  error?: string
  processingTime?: number
  tokensUsed?: number
}

/**
 * CV Processing Service
 * Orchestrates the workflow of processing CV text through OpenAI and saving structured data
 */
export class CvProcessingService {
  /**
   * Process a CV submission through OpenAI extraction
   */
  async processCvSubmission(cvSubmissionId: number): Promise<CvProcessingResult> {
    const startTime = Date.now()

    try {
      logger.info('Starting CV processing workflow', { cvSubmissionId })

      // Load the CV submission with extracted text
      const cvSubmission = await CvSubmission.find(cvSubmissionId)
      if (!cvSubmission) {
        throw new Error(`CV submission not found: ${cvSubmissionId}`)
      }

      if (!cvSubmission.extractedText) {
        throw new Error('CV submission has no extracted text to process')
      }

      // Check if already processed
      const existingProcessed = await ProcessedCv.query()
        .where('cv_submission_id', cvSubmissionId)
        .where('processing_status', 'completed')
        .first()

      if (existingProcessed) {
        logger.info('CV already processed successfully', {
          cvSubmissionId,
          processedCvId: existingProcessed.id,
        })
        return {
          success: true,
          processedCvId: existingProcessed.id,
          processingTime: Date.now() - startTime,
        }
      }

      // Create or update processing record
      let processedCv = await ProcessedCv.query().where('cv_submission_id', cvSubmissionId).first()

      if (!processedCv) {
        processedCv = new ProcessedCv()
        processedCv.cvSubmissionId = cvSubmissionId
        processedCv.processingStatus = 'pending'
        processedCv.retryCount = 0
        await processedCv.save()
      } else if (!processedCv.canRetry()) {
        throw new Error('CV processing has exceeded maximum retry attempts')
      }

      // Mark as processing
      processedCv.markAsProcessing()
      await processedCv.save()

      logger.info('Processing CV text through OpenAI', {
        cvSubmissionId,
        processedCvId: processedCv.id,
        textLength: cvSubmission.extractedText.length,
      })

      // Process through OpenAI
      const openaiResult = await openaiService.extractCvData(cvSubmission.extractedText)

      if (openaiResult.success && openaiResult.data) {
        // Mark as completed with extracted data
        processedCv.markAsCompleted(
          openaiResult.data,
          openaiResult.tokensUsed || 0,
          openaiResult.processingTime || 0,
          'gpt-4o-mini'
        )
        await processedCv.save()

        logger.info('CV processing completed successfully', {
          cvSubmissionId,
          processedCvId: processedCv.id,
          tokensUsed: openaiResult.tokensUsed,
          processingTime: openaiResult.processingTime,
        })

        return {
          success: true,
          processedCvId: processedCv.id,
          processingTime: Date.now() - startTime,
          tokensUsed: openaiResult.tokensUsed,
        }
      } else {
        // Mark as failed
        const errorMessage = openaiResult.error || 'Unknown OpenAI processing error'
        processedCv.markAsFailed(errorMessage)
        await processedCv.save()

        logger.error('CV processing failed', {
          cvSubmissionId,
          processedCvId: processedCv.id,
          error: errorMessage,
        })

        return {
          success: false,
          error: errorMessage,
          processingTime: Date.now() - startTime,
        }
      }
    } catch (error) {
      const processingTime = Date.now() - startTime

      logger.error('CV processing workflow failed', {
        cvSubmissionId,
        error: error.message,
        processingTime,
      })

      return {
        success: false,
        error: error.message,
        processingTime,
      }
    }
  }

  /**
   * Retry failed CV processing
   */
  async retryFailedProcessing(processedCvId: number): Promise<CvProcessingResult> {
    try {
      const processedCv = await ProcessedCv.query()
        .where('id', processedCvId)
        .preload('cvSubmission')
        .firstOrFail()

      if (!processedCv.canRetry()) {
        throw new Error(
          'Processing cannot be retried (max attempts reached or not in failed state)'
        )
      }

      logger.info('Retrying failed CV processing', {
        processedCvId,
        cvSubmissionId: processedCv.cvSubmissionId,
        retryCount: processedCv.retryCount,
      })

      return await this.processCvSubmission(processedCv.cvSubmissionId)
    } catch (error) {
      logger.error('Failed to retry CV processing', {
        processedCvId,
        error: error.message,
      })

      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Get processing status for a CV submission
   */
  async getProcessingStatus(cvSubmissionId: number): Promise<{
    status: 'not_started' | 'pending' | 'processing' | 'completed' | 'failed'
    processedCv?: ProcessedCv
    canRetry?: boolean
  }> {
    const processedCv = await ProcessedCv.query().where('cv_submission_id', cvSubmissionId).first()

    if (!processedCv) {
      return { status: 'not_started' }
    }

    return {
      status: processedCv.processingStatus,
      processedCv,
      canRetry: processedCv.canRetry(),
    }
  }

  /**
   * Batch process multiple CV submissions
   */
  async batchProcessCvSubmissions(cvSubmissionIds: number[]): Promise<{
    successful: number[]
    failed: { id: number; error: string }[]
    totalProcessingTime: number
  }> {
    const startTime = Date.now()
    const successful: number[] = []
    const failed: { id: number; error: string }[] = []

    logger.info('Starting batch CV processing', {
      count: cvSubmissionIds.length,
      cvSubmissionIds,
    })

    for (const cvSubmissionId of cvSubmissionIds) {
      try {
        const result = await this.processCvSubmission(cvSubmissionId)
        if (result.success) {
          successful.push(cvSubmissionId)
        } else {
          failed.push({ id: cvSubmissionId, error: result.error || 'Unknown error' })
        }
      } catch (error) {
        failed.push({ id: cvSubmissionId, error: error.message })
      }

      // Add a small delay between processing to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    const totalProcessingTime = Date.now() - startTime

    logger.info('Batch CV processing completed', {
      successful: successful.length,
      failed: failed.length,
      totalProcessingTime,
    })

    return {
      successful,
      failed,
      totalProcessingTime,
    }
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(): Promise<{
    total: number
    completed: number
    failed: number
    pending: number
    processing: number
    successRate: number
  }> {
    const stats = await ProcessedCv.query()
      .groupBy('processing_status')
      .count('* as count')
      .select('processing_status')

    const statMap = stats.reduce(
      (acc, stat: any) => {
        acc[stat.processing_status] = Number(stat.count)
        return acc
      },
      {} as Record<string, number>
    )

    const total = Object.values(statMap).reduce((sum, count) => sum + count, 0)
    const completed = statMap.completed || 0
    const failed = statMap.failed || 0
    const pending = statMap.pending || 0
    const processing = statMap.processing || 0

    const successRate = total > 0 ? (completed / total) * 100 : 0

    return {
      total: total || 0,
      completed: completed || 0,
      failed: failed || 0,
      pending: pending || 0,
      processing: processing || 0,
      successRate: Number.isNaN(successRate) ? 0 : Math.round(successRate * 100) / 100,
    }
  }

  /**
   * Clean up old failed processing records
   */
  async cleanupFailedProcessing(olderThanDays: number = 7): Promise<number> {
    const cutoffDate = DateTime.now().minus({ days: olderThanDays })

    const deletedRecords = await ProcessedCv.query()
      .where('processing_status', 'failed')
      .where('retry_count', '>=', 3)
      .where('created_at', '<', cutoffDate.toSQL()!)
      .delete()

    const deletedCount = Array.isArray(deletedRecords) ? deletedRecords.length : 0

    logger.info('Cleaned up old failed processing records', {
      deletedCount,
      olderThanDays,
    })

    return deletedCount
  }
}

// Export singleton instance
export default new CvProcessingService()
