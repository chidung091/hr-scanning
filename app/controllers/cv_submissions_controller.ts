import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import CvSubmission from '#models/cv_submission'
import QuestionnaireResponse from '#models/questionnaire_response'
import drive from '@adonisjs/drive/services/main'
import mammoth from 'mammoth'
import OpenAI from 'openai'
import env from '#start/env'
import { cvUploadValidator } from '#validators/cv_submission_validator'

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

    const extractedText = result.value || 'DOCX uploaded successfully but contains no extractable text.'
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

      const { cv_file: file, applicant_name: applicantName, applicant_email: applicantEmail, job_id: jobId } = payload

      console.log('File details:', {
        clientName: file.clientName,
        extname: file.extname,
        type: file.type,
        size: file.size
      })

      // Generate unique submission ID
      const submissionId = cuid()

      // Move file to Drive storage
      const fileName = `${submissionId}_${file.clientName}`
      const fileKey = `cvs/${fileName}`

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
            if (pdfError.message.includes('No text content found') || pdfError.message.includes('no extractable text')) {
              extractedText = 'PDF uploaded successfully. This PDF appears to contain images or scanned content with no extractable text.'
            } else if (pdfError.message.includes('password') || pdfError.message.includes('encrypted')) {
              extractedText = 'PDF uploaded successfully. This PDF is password-protected or encrypted and cannot be processed.'
            } else if (pdfError.message.includes('corrupted') || pdfError.message.includes('invalid')) {
              extractedText = 'PDF uploaded successfully. This PDF file appears to be corrupted or invalid.'
            } else if (pdfError.message.includes('pdf-parse module not properly loaded')) {
              extractedText = 'PDF uploaded successfully. Text extraction temporarily unavailable due to library loading issues.'
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
          extractedText = 'DOC file uploaded successfully. For better text extraction, please convert to DOCX or PDF format.'

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
      console.log('File:', fileName)
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

      // Save to database (skip base64 content for now to avoid SQLite size issues)
      console.log('Preparing to save to database...')
      console.log('Data sizes:', {
        extractedTextLength: extractedText.length,
        fileSize: file.size
      })

      let cvSubmission
      try {
        cvSubmission = await CvSubmission.create({
          submissionId,
          filename: fileName,
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

      return response.json({
        success: true,
        message: 'CV uploaded successfully',
        data: {
          submissionId: cvSubmission.submissionId,
          filename: cvSubmission.originalFilename,
          extractedTextLength: extractedText.length,
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
          questionsAnswered: (responses.question1.answered ? 1 : 0) + (responses.question2.answered ? 1 : 0),
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

    const cvSubmission = await CvSubmission.query()
      .where('submission_id', submissionId)
      .preload('questionnaireResponse', (responseQuery) => {
        responseQuery.select('id', 'cv_submission_id', 'is_completed', 'total_score', 'assessment_result', 'completed_at')
      })
      .first()

    if (!cvSubmission) {
      return view.render('pages/error', {
        message: 'Application not found',
      })
    }

    const applicationReference = `TV-${cvSubmission.submissionId.slice(-8).toUpperCase()}`

    return view.render('pages/success', {
      applicantName: cvSubmission.applicantName,
      applicationReference,
      submissionId: cvSubmission.submissionId,
      questionsAnswered: cvSubmission.questionnaireResponse ?
        Object.values(cvSubmission.questionnaireResponse.responses).filter((q: any) => q.answered).length : 0,
    })
  }
}