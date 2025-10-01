import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { User, UserRole } from '@entities/user.entity';
import * as bcrypt from 'bcrypt';

async function createAdmin() {
  console.log('🔐 Creating initial admin user...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    const userRepository = dataSource.getRepository(User);
    
    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@nexus.com' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      await app.close();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin123!@#', 10);
    
    const adminUser = userRepository.create({
      email: 'admin@nexus.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      isActive: true,
    });

    await userRepository.save(adminUser);
    
    console.log(`
    ========================================
    ✅ Admin user created successfully!
    ========================================
    
    Login credentials:
    📧 Email: admin@nexus.com
    🔑 Password: Admin123!@#
    
    ⚠️  IMPORTANT: Change this password immediately!
    ========================================
    `);

  } catch (error) {
    console.error('❌ Failed to create admin:', error);
    throw error;
  } finally {
    await app.close();
  }
}

createAdmin()
  .then(() => {
    console.log('✅ Admin creation process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Admin creation failed:', error);
    process.exit(1);
  });