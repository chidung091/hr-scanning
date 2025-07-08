import type { HttpContext } from '@adonisjs/core/http'
import AiCriterion from '#models/ai_criterion'

export default class AiCriteriaController {
  async index({ response }: HttpContext) {
    try {
      const criteria = await AiCriterion.activeCriteria()

      return response.json({
        success: true,
        data: criteria,
      })
    } catch (error) {
      console.error('Get AI criteria error:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to retrieve AI criteria',
      })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['name', 'weight', 'description', 'sortOrder'])

      const criterion = await AiCriterion.create({
        ...data,
        isActive: true,
      })

      return response.status(201).json({
        success: true,
        data: criterion,
        message: 'AI criterion created successfully',
      })
    } catch (error) {
      console.error('Create AI criterion error:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to create AI criterion',
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const criterion = await AiCriterion.findOrFail(params.id)

      return response.json({
        success: true,
        data: criterion,
      })
    } catch (error) {
      console.error('Get AI criterion error:', error)
      return response.status(404).json({
        success: false,
        message: 'AI criterion not found',
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const criterion = await AiCriterion.findOrFail(params.id)
      const data = request.only(['name', 'weight', 'description', 'sortOrder', 'isActive'])

      criterion.merge(data)
      await criterion.save()

      return response.json({
        success: true,
        data: criterion,
        message: 'AI criterion updated successfully',
      })
    } catch (error) {
      console.error('Update AI criterion error:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to update AI criterion',
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const criterion = await AiCriterion.findOrFail(params.id)
      await criterion.delete()

      return response.json({
        success: true,
        message: 'AI criterion deleted successfully',
      })
    } catch (error) {
      console.error('Delete AI criterion error:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to delete AI criterion',
      })
    }
  }
}
