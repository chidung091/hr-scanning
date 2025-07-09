import type { HttpContext } from '@adonisjs/core/http'
import AdminUser from '#models/admin_user'
import vine from '@vinejs/vine'

export default class AdminAuthController {
  /**
   * Show login form
   */
  async showLogin({ view, session, response }: HttpContext) {
    // Redirect if already logged in
    if (session.get('admin_id')) {
      return response.redirect('/admin')
    }

    return view.render('admin/login')
  }

  /**
   * Handle login attempt
   */
  async login({ request, response, session }: HttpContext) {
    // Validate input
    const loginValidator = vine.compile(
      vine.object({
        username: vine.string().trim().minLength(1),
        password: vine.string().minLength(1),
      })
    )

    try {
      const { username, password } = await request.validateUsing(loginValidator)

      // Find admin user
      const admin = await AdminUser.findActiveByUsername(username)

      if (!admin) {
        session.flash('error', 'Invalid username or password')
        return response.redirect().back()
      }

      // Verify password
      const isValidPassword = await admin.verifyPassword(password)

      if (!isValidPassword) {
        session.flash('error', 'Invalid username or password')
        return response.redirect().back()
      }

      // Update last login
      await admin.updateLastLogin()

      // Set session
      session.put('admin_id', admin.id)
      session.put('admin_username', admin.username)

      session.flash('success', 'Welcome back!')
      return response.redirect('/admin')
    } catch (error) {
      if (error.messages) {
        session.flash('errors', error.messages)
      } else {
        session.flash('error', 'Login failed. Please try again.')
      }
      return response.redirect().back()
    }
  }

  /**
   * Handle logout
   */
  async logout({ response, session }: HttpContext) {
    session.forget('admin_id')
    session.forget('admin_username')
    session.flash('success', 'You have been logged out successfully')
    return response.redirect('/admin/login')
  }

  /**
   * API login endpoint
   */
  async apiLogin({ request, response, session }: HttpContext) {
    const loginValidator = vine.compile(
      vine.object({
        username: vine.string().trim().minLength(1),
        password: vine.string().minLength(1),
      })
    )

    try {
      const { username, password } = await request.validateUsing(loginValidator)

      const admin = await AdminUser.findActiveByUsername(username)

      if (!admin || !(await admin.verifyPassword(password))) {
        return response.status(401).json({
          success: false,
          message: 'Invalid credentials',
        })
      }

      await admin.updateLastLogin()

      session.put('admin_id', admin.id)
      session.put('admin_username', admin.username)

      return response.json({
        success: true,
        message: 'Login successful',
        data: {
          username: admin.username,
          lastLoginAt: admin.lastLoginAt,
        },
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.messages || ['Invalid input'],
      })
    }
  }

  /**
   * API logout endpoint
   */
  async apiLogout({ response, session }: HttpContext) {
    session.forget('admin_id')
    session.forget('admin_username')

    return response.json({
      success: true,
      message: 'Logout successful',
    })
  }
}
