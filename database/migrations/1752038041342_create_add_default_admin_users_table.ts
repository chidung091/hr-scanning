import { BaseSchema } from '@adonisjs/lucid/schema'
import AdminUser from '#models/admin_user'

export default class extends BaseSchema {
  async up() {
    // Use the same approach as the seeder to ensure consistency
    await AdminUser.updateOrCreate(
      { username: 'admin' },
      {
        username: 'admin',
        password: await AdminUser.hashPassword('admin'),
        isActive: true,
      }
    )
  }

  async down() {
    // Remove the default admin user
    const admin = await AdminUser.findBy('username', 'admin')
    if (admin) {
      await admin.delete()
    }
  }
}
