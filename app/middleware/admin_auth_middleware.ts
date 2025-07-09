import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import AdminUser from '#models/admin_user'

export default class AdminAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    console.log('AdminAuthMiddleware: handling request to', ctx.request.url())
    try {
      const { session, response, request } = ctx

      // Check if admin is logged in
      const adminId = session.get('admin_id')
      console.log('AdminAuthMiddleware: admin_id from session:', adminId)

      if (!adminId) {
        // If it's an API request, return JSON error
        if (
          request.header('accept')?.includes('application/json') ||
          request.url().startsWith('/api/')
        ) {
          return response.status(401).json({
            success: false,
            message: 'Authentication required',
          })
        }

        // Otherwise redirect to login page
        return response.redirect('/admin/login')
      }

      // Verify admin still exists and is active
      const admin = await AdminUser.find(adminId)

      if (!admin || !admin.isActive) {
        session.forget('admin_id')
        session.forget('admin_username')

        if (
          request.header('accept')?.includes('application/json') ||
          request.url().startsWith('/api/')
        ) {
          return response.status(401).json({
            success: false,
            message: 'Invalid or inactive admin account',
          })
        }

        return response.redirect('/admin/login')
      }

      // Add admin to context for use in controllers
      ctx.admin = admin

      await next()
    } catch (error) {
      console.error('Error in AdminAuthMiddleware:', error)
      throw error
    }
  }
}

// Extend HttpContext type to include admin
declare module '@adonisjs/core/http' {
  interface HttpContext {
    admin?: AdminUser
  }
}
