import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import CvSubmission from '#models/cv_submission'
import QuestionnaireResponse from '#models/questionnaire_response'
import drive from '@adonisjs/drive/services/main'
import mammoth from 'mammoth'
import { cvUploadValidator } from '#validators/cv_submission_validator'
import cvProcessingService from '#services/cv_processing_service'
import { generateSafeFileKey } from '#utils/filename_sanitizer'

// Initialize OpenAI client (currently unused but available for PDF processing)
// const openai = new OpenAI({
//   apiKey: env.get('OPENAI_API_KEY'),
// })

/**
 * Extract text from PDF using pdf-parse with proper module loading
 */
async function extractTextFromPdfWithPdfParse(fileKey: string): Promise<string> {
  try {
    console.log('Loading pdf-parse module...')

    // Import pdf-parse dynamically
    const pdfParse = await import('pdf-parse')
    const parser = pdfParse.default || pdfParse

    if (typeof parser !== 'function') {
      throw new Error('pdf-parse module not properly loaded')
    }

    console.log('Reading PDF file from Drive...')
    const disk = drive.use()
    const dataBuffer = await disk.getArrayBuffer(fileKey)

    console.log(`Processing PDF (${Math.round(dataBuffer.byteLength / 1024)}KB)...`)

    // Parse the PDF and extract text
    const data = await parser(Buffer.from(dataBuffer), {
      max: 0, // No page limit
      version: 'v1.10.100', // Use specific version
    })

    if (!data || !data.text) {
      throw new Error('No text content found in PDF')
    }

    // Clean up the extracted text
    let extractedText = data.text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim()

    if (extractedText.length === 0) {
      throw new Error('PDF contains no extractable text')
    }

    console.log(`Successfully extracted ${extractedText.length} characters from PDF`)
    return extractedText
  } catch (error) {
    console.error('PDF text extraction failed:', error.message)
    throw error
  }
}

/**
 * Main PDF text extraction function
 */
async function extractTextFromPdf(fileKey: string): Promise<string> {
  return await extractTextFromPdfWithPdfParse(fileKey)
}

/**
 * Extract text from DOCX file using Drive
 */
async function extractTextFromDocx(fileKey: string): Promise<string> {
  try {
    console.log('Reading DOCX file from Drive...')
    const disk = drive.use()
    const dataBuffer = await disk.getArrayBuffer(fileKey)

    console.log('Extracting text from DOCX file...')
    const result = await mammoth.extractRawText({ buffer: Buffer.from(dataBuffer) })

    const extractedText =
      result.value || 'DOCX uploaded successfully but contains no extractable text.'
    console.log(`DOCX text extraction successful: ${extractedText.length} characters`)

    if (result.messages && result.messages.length > 0) {
      console.log('DOCX extraction messages:', result.messages)
    }

    return extractedText
  } catch (error) {
    console.error('DOCX text extraction failed:', error)
    throw error
  }
}

export default class CvSubmissionsController {
  /**
   * Upload CV file and extract text content
   */
  async upload({ request, response }: HttpContext) {
    try {
      // Validate request data using VineJS
      const payload = await request.validateUsing(cvUploadValidator)

      const {
        cv_file: file,
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        job_id: jobId,
      } = payload

      console.log('File details:', {
        clientName: file.clientName,
        extname: file.extname,
        type: file.type,
        size: file.size,
      })

      // Generate unique submission ID
      const submissionId = cuid()

      // Generate safe file key with sanitized filename to prevent storage errors
      const fileKey = generateSafeFileKey(submissionId, file.clientName, 'cvs/')

      console.log('Original filename:', file.clientName)
      console.log('Sanitized file key:', fileKey)

      // Use Drive's moveToDisk method for better file handling
      await file.moveToDisk(fileKey)

      // Get the file URL from Drive
      const disk = drive.use()
      const fileUrl = await disk.getUrl(fileKey)

      let extractedText = ''

      // Extract text based on file type with comprehensive error handling
      let extractionStatus = 'unknown'

      try {
        if (file.extname === 'pdf') {
          console.log('Extracting text from PDF file...')
          extractionStatus = 'pdf_processing'

          try {
            extractedText = await extractTextFromPdf(fileKey)
            extractionStatus = 'pdf_success'
            console.log(`PDF text extraction successful: ${extractedText.length} characters`)
          } catch (pdfError) {
            extractionStatus = 'pdf_failed'
            console.error('PDF text extraction failed:', pdfError.message)

            // Provide specific error messages based on the type of failure
            if (
              pdfError.message.includes('No text content found') ||
              pdfError.message.includes('no extractable text')
            ) {
              extractedText =
                'PDF uploaded successfully. This PDF appears to contain images or scanned content with no extractable text.'
            } else if (
              pdfError.message.includes('password') ||
              pdfError.message.includes('encrypted')
            ) {
              extractedText =
                'PDF uploaded successfully. This PDF is password-protected or encrypted and cannot be processed.'
            } else if (
              pdfError.message.includes('corrupted') ||
              pdfError.message.includes('invalid')
            ) {
              extractedText =
                'PDF uploaded successfully. This PDF file appears to be corrupted or invalid.'
            } else if (pdfError.message.includes('pdf-parse module not properly loaded')) {
              extractedText =
                'PDF uploaded successfully. Text extraction temporarily unavailable due to library loading issues.'
            } else {
              extractedText = `PDF uploaded successfully. Text extraction failed: ${pdfError.message}`
            }
          }
        } else if (file.extname === 'docx') {
          console.log('Extracting text from DOCX file...')
          extractionStatus = 'docx_processing'

          try {
            extractedText = await extractTextFromDocx(fileKey)
            extractionStatus = 'docx_success'
          } catch (docxError) {
            extractionStatus = 'docx_failed'
            console.error('DOCX text extraction failed:', docxError)
            extractedText = `DOCX uploaded successfully. Text extraction failed: ${docxError.message}`
          }
        } else if (file.extname === 'doc') {
          console.log('DOC files require special handling - using fallback message')
          extractionStatus = 'doc_unsupported'
          extractedText =
            'DOC file uploaded successfully. For better text extraction, please convert to DOCX or PDF format.'
        } else {
          extractionStatus = 'unsupported_format'
          extractedText = `File uploaded successfully. Text extraction not supported for ${file.extname} files.`
        }

        // Clean up extracted text if we got some
        if (extractedText && extractionStatus.includes('success')) {
          extractedText = extractedText
            .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
            .replace(/\n\s*\n/g, '\n') // Remove empty lines
            .trim()
        }
      } catch (textError) {
        extractionStatus = 'extraction_error'
        console.error('Text extraction failed with unexpected error:', textError)
        extractedText = `File uploaded successfully. Text extraction encountered an unexpected error: ${textError.message}`
      }

      // Comprehensive debug information
      console.log('=== CV TEXT EXTRACTION DEBUG ===')
      console.log('Original filename:', file.clientName)
      console.log('File Key:', fileKey)
      console.log('File Type:', file.extname)
      console.log('File Size:', file.size, 'bytes')
      console.log('MIME Type:', file.type)
      console.log('File URL:', fileUrl)
      console.log('Applicant:', applicantName)
      console.log('Email:', applicantEmail)
      console.log('Extraction Status:', extractionStatus)
      console.log('Extracted Text Length:', extractedText.length)

      if (extractedText.length > 0) {
        console.log('Extracted Text Preview (first 500 chars):')
        console.log(extractedText.substring(0, 500))
        console.log('Extracted Text Preview (last 200 chars):')
        console.log(extractedText.substring(Math.max(0, extractedText.length - 200)))
      }
      console.log('================================')

      // Save to database
      console.log('Preparing to save to database...')
      console.log('Data sizes:', {
        extractedTextLength: extractedText.length,
        fileSize: file.size,
      })

      let cvSubmission
      try {
        cvSubmission = await CvSubmission.create({
          submissionId,
          filename: fileKey.split('/').pop() || fileKey, // Extract filename from file key
          originalFilename: file.clientName,
          filePath: fileKey, // Store the Drive file key instead of local path
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          applicantName,
          applicantEmail,
          extractedText,
          base64Content: null, // Skip base64 for now
          status: 'pending',
          jobId: jobId || null, // Associate with job if provided
        })
        console.log('Database save successful')
      } catch (dbError) {
        console.error('Database save failed:', dbError)
        throw dbError
      }

      // Process CV through OpenAI if text extraction was successful
      let openaiProcessingResult = null
      if (extractionStatus.includes('success') && extractedText && extractedText.length > 50) {
        try {
          console.log('Starting OpenAI processing for CV...')

          // Process asynchronously to avoid blocking the response
          cvProcessingService
            .processCvSubmission(cvSubmission.id)
            .then((result) => {
              if (result.success) {
                console.log('OpenAI processing completed successfully', {
                  cvSubmissionId: cvSubmission.id,
                  processedCvId: result.processedCvId,
                  tokensUsed: result.tokensUsed,
                })
              } else {
                console.error('OpenAI processing failed', {
                  cvSubmissionId: cvSubmission.id,
                  error: result.error,
                })
              }
            })
            .catch((error) => {
              console.error('OpenAI processing error', {
                cvSubmissionId: cvSubmission.id,
                error: error.message,
              })
            })

          openaiProcessingResult = { status: 'initiated' }
        } catch (error) {
          console.error('Failed to initiate OpenAI processing:', error.message)
          openaiProcessingResult = { status: 'failed', error: error.message }
        }
      } else {
        console.log('Skipping OpenAI processing - insufficient text content or extraction failed')
        openaiProcessingResult = {
          status: 'skipped',
          reason: 'insufficient_text_or_extraction_failed',
        }
      }

      return response.json({
        success: true,
        message: 'CV uploaded successfully',
        data: {
          submissionId: cvSubmission.submissionId,
          filename: cvSubmission.originalFilename,
          extractedTextLength: extractedText.length,
          openaiProcessing: openaiProcessingResult,
        },
      })
    } catch (error) {
      console.error('CV upload error:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to upload CV. Please try again.',
      })
    }
  }

  /**
   * Submit questionnaire responses
   */
  async submitQuestionnaire({ request, response }: HttpContext) {
    try {
      const submissionId = request.input('submission_id')
      const question1Answer = request.input('question1_answer') || ''
      const question2Answer = request.input('question2_answer') || ''

      if (!submissionId) {
        return response.status(400).json({
          success: false,
          message: 'Submission ID is required',
        })
      }

      // Find the CV submission
      const cvSubmission = await CvSubmission.findBy('submissionId', submissionId)

      if (!cvSubmission) {
        return response.status(404).json({
          success: false,
          message: 'CV submission not found',
        })
      }

      // Prepare questionnaire responses
      const responses = {
        question1: {
          question: 'Why do you want to join this company?',
          answer: question1Answer,
          answered: question1Answer.length > 0,
        },
        question2: {
          question: 'What is your favorite aspect of company culture?',
          answer: question2Answer,
          answered: question2Answer.length > 0,
        },
      }

      // Calculate a simple score based on response completeness
      let totalScore = 0
      if (question1Answer.length >= 50) totalScore += 50
      if (question2Answer.length >= 50) totalScore += 50

      // Save questionnaire response
      await QuestionnaireResponse.create({
        submissionId: cuid(),
        cvSubmissionId: cvSubmission.id,
        responses,
        totalScore,
        assessmentResult: totalScore >= 50 ? 'good' : 'fair',
        notes: `Questionnaire completed. Answered ${responses.question1.answered ? 1 : 0} + ${responses.question2.answered ? 1 : 0} questions.`,
      })

      // Update CV submission status
      cvSubmission.status = 'submitted'
      await cvSubmission.save()

      return response.json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          submissionId: cvSubmission.submissionId,
          applicationReference: `TV-${cvSubmission.submissionId.slice(-8).toUpperCase()}`,
          questionsAnswered:
            (responses.question1.answered ? 1 : 0) + (responses.question2.answered ? 1 : 0),
          totalScore,
        },
      })
    } catch (error) {
      console.error('Questionnaire submission error:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to submit questionnaire. Please try again.',
      })
    }
  }

  /**
   * Show success page
   */
  async success({ params, view }: HttpContext) {
    const submissionId = params.id

    try {
      const cvSubmission = await CvSubmission.query()
        .where('submission_id', submissionId)
        .preload('questionnaireResponse', (responseQuery) => {
          responseQuery.select(
            'id',
            'cv_submission_id',
            'is_completed',
            'total_score',
            'assessment_result',
            'completed_at',
            'responses',
            'questions_completed'
          )
        })
        .first()

      if (!cvSubmission) {
        return view.render('pages/error', {
          message: 'Application not found',
        })
      }

      const applicationReference = `TV-${cvSubmission.submissionId.slice(-8).toUpperCase()}`

      // Calculate questions answered from the responses object
      let questionsAnswered = 0
      if (cvSubmission.questionnaireResponse && cvSubmission.questionnaireResponse.responses) {
        // Count non-null, non-undefined responses
        questionsAnswered = Object.values(cvSubmission.questionnaireResponse.responses).filter(
          (answer) => answer !== null && answer !== undefined && answer !== ''
        ).length
      }

      return view.render('pages/success', {
        applicantName: cvSubmission.applicantName || 'Applicant',
        applicationReference,
        submissionId: cvSubmission.submissionId,
        questionsAnswered,
        isAssessmentCompleted: cvSubmission.questionnaireResponse?.isCompleted || false,
      })
    } catch (error) {
      console.error('Success page error:', error)
      return view.render('pages/error', {
        message: 'An error occurred while loading your application details',
      })
    }
  }

  /**
   * Get OpenAI processing status for a CV submission
   * @swagger
   * /api/cv/{submissionId}/processing-status:
   *   get:
   *     tags:
   *       - OpenAI Processing
   *     summary: Get processing status for a CV submission
   *     description: Retrieve the current OpenAI processing status and details for a specific CV submission
   *     parameters:
   *       - in: path
   *         name: submissionId
   *         required: true
   *         schema:
   *           type: string
   *         description: The submission ID of the CV
   *         example: clx1234567890
   *     responses:
   *       200:
   *         description: Processing status retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/ProcessingStatus'
   *       404:
   *         description: CV submission not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getProcessingStatus({ params, response }: HttpContext) {
    try {
      const submissionId = params.submissionId

      // Find CV submission by submission ID
      const cvSubmission = await CvSubmission.query().where('submission_id', submissionId).first()

      if (!cvSubmission) {
        return response.status(404).json({
          success: false,
          message: 'CV submission not found',
        })
      }

      const status = await cvProcessingService.getProcessingStatus(cvSubmission.id)

      return response.json({
        success: true,
        data: {
          submissionId,
          processingStatus: status.status,
          canRetry: status.canRetry || false,
          processedCv: status.processedCv
            ? {
                id: status.processedCv.id,
                processingStartedAt: status.processedCv.processingStartedAt,
                processingCompletedAt: status.processedCv.processingCompletedAt,
                tokensUsed: status.processedCv.tokensUsed,
                processingTimeMs: status.processedCv.processingTimeMs,
                retryCount: status.processedCv.retryCount,
                errorMessage: status.processedCv.errorMessage,
                dataValidated: status.processedCv.dataValidated,
              }
            : null,
        },
      })
    } catch (error) {
      console.error('Error getting processing status:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to get processing status',
      })
    }
  }

  /**
   * Get extracted CV data from OpenAI processing
   * @swagger
   * /api/cv/{submissionId}/extracted-data:
   *   get:
   *     tags:
   *       - OpenAI Processing
   *     summary: Get extracted CV data
   *     description: Retrieve the structured data extracted from a CV using OpenAI processing
   *     parameters:
   *       - in: path
   *         name: submissionId
   *         required: true
   *         schema:
   *           type: string
   *         description: The submission ID of the CV
   *         example: clx1234567890
   *     responses:
   *       200:
   *         description: Extracted data retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/ExtractedCvData'
   *       404:
   *         description: CV submission not found or not processed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getExtractedData({ params, response }: HttpContext) {
    try {
      const submissionId = params.submissionId

      // Find CV submission by submission ID
      const cvSubmission = await CvSubmission.query()
        .where('submission_id', submissionId)
        .preload('processedCv')
        .first()

      if (!cvSubmission) {
        return response.status(404).json({
          success: false,
          message: 'CV submission not found',
        })
      }

      if (!cvSubmission.processedCv || cvSubmission.processedCv.processingStatus !== 'completed') {
        return response.status(404).json({
          success: false,
          message: 'CV has not been successfully processed yet',
        })
      }

      return response.json({
        success: true,
        data: {
          submissionId,
          extractedData: cvSubmission.processedCv.extractedData,
          processingMetadata: {
            processingCompletedAt: cvSubmission.processedCv.processingCompletedAt,
            tokensUsed: cvSubmission.processedCv.tokensUsed,
            processingTimeMs: cvSubmission.processedCv.processingTimeMs,
            openaiModel: cvSubmission.processedCv.openaiModel,
            dataValidated: cvSubmission.processedCv.dataValidated,
          },
        },
      })
    } catch (error) {
      console.error('Error getting extracted data:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to get extracted data',
      })
    }
  }

  /**
   * Retry failed OpenAI processing
   * @swagger
   * /api/cv/{submissionId}/retry-processing:
   *   post:
   *     tags:
   *       - OpenAI Processing
   *     summary: Retry failed CV processing
   *     description: Retry OpenAI processing for a CV submission that previously failed
   *     parameters:
   *       - in: path
   *         name: submissionId
   *         required: true
   *         schema:
   *           type: string
   *         description: The submission ID of the CV
   *         example: clx1234567890
   *     responses:
   *       200:
   *         description: Processing retry initiated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Processing retry initiated successfully
   *                 data:
   *                   $ref: '#/components/schemas/ProcessingStatus'
   *       400:
   *         description: Cannot retry processing (not eligible or already processing)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: CV submission not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async retryProcessing({ params, response }: HttpContext) {
    try {
      const submissionId = params.submissionId

      // Find CV submission by submission ID
      const cvSubmission = await CvSubmission.query()
        .where('submission_id', submissionId)
        .preload('processedCv')
        .first()

      if (!cvSubmission) {
        return response.status(404).json({
          success: false,
          message: 'CV submission not found',
        })
      }

      if (!cvSubmission.processedCv) {
        return response.status(400).json({
          success: false,
          message: 'CV has not been processed yet',
        })
      }

      if (!cvSubmission.processedCv.canRetry()) {
        return response.status(400).json({
          success: false,
          message: 'CV processing cannot be retried (max attempts reached or not in failed state)',
        })
      }

      const result = await cvProcessingService.retryFailedProcessing(cvSubmission.processedCv.id)

      if (result.success) {
        return response.json({
          success: true,
          message: 'CV processing retry initiated successfully',
          data: {
            submissionId,
            processedCvId: result.processedCvId,
            tokensUsed: result.tokensUsed,
            processingTime: result.processingTime,
          },
        })
      } else {
        return response.status(500).json({
          success: false,
          message: 'Failed to retry CV processing',
          error: result.error,
        })
      }
    } catch (error) {
      console.error('Error retrying processing:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to retry processing',
      })
    }
  }

  /**
   * Get processing statistics
   * @swagger
   * /api/cv/processing-stats:
   *   get:
   *     tags:
   *       - OpenAI Processing
   *     summary: Get OpenAI processing statistics
   *     description: Retrieve overall statistics for OpenAI CV processing including success rates and counts
   *     responses:
   *       200:
   *         description: Processing statistics retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/ProcessingStats'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getProcessingStats({ response }: HttpContext) {
    try {
      const stats = await cvProcessingService.getProcessingStats()

      return response.json({
        success: true,
        data: stats,
      })
    } catch (error) {
      console.error('Error getting processing stats:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to get processing statistics',
      })
    }
  }
}
