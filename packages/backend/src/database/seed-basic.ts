import 'dotenv/config';
import { DataSource } from 'typeorm';
import { hash } from 'bcrypt';
import { User, UserRole } from '@entities/user.entity';
import { Customer } from '@entities/customer.entity';
import { Inquiry, InquiryStatus, InquiryPriority } from '@entities/inquiry.entity';
import { Response, ResponseStatus } from '@entities/response.entity';
import { faker } from '@faker-js/faker';
import * as path from 'path';

// Create database connection
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'customer_nexus_hub',
  entities: [
    path.join(__dirname, '../entities/*.entity{.ts,.js}'),
    path.join(__dirname, '../modules/**/entities/*.entity{.ts,.js}'),
  ],
  synchronize: false,
  logging: false,
});

async function seedDatabase() {
  try {
    await dataSource.initialize();
    console.log('🔗 Database connection established');

    // Clear existing data
    await dataSource.query('TRUNCATE TABLE responses CASCADE');
    await dataSource.query('TRUNCATE TABLE inquiries CASCADE');
    await dataSource.query('TRUNCATE TABLE customers CASCADE');
    await dataSource.query('TRUNCATE TABLE users CASCADE');

    const userRepository = dataSource.getRepository(User);
    const customerRepository = dataSource.getRepository(Customer);
    const inquiryRepository = dataSource.getRepository(Inquiry);
    const responseRepository = dataSource.getRepository(Response);

    // Create users
    console.log('👥 Creating users...');
    const password = await hash('Admin123!@#', 10);
    
    const admin = await userRepository.save({
      email: 'admin@nexus.com',
      password,
      firstName: 'System',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      isActive: true,
    });

    const manager = await userRepository.save({
      email: 'manager@nexus.com',
      password,
      firstName: 'John',
      lastName: 'Manager',
      role: UserRole.MANAGER,
      isActive: true,
    });

    const cso = await userRepository.save({
      email: 'cso@nexus.com',
      password,
      firstName: 'Jane',
      lastName: 'Support',
      role: UserRole.CSO,
      isActive: true,
    });

    console.log('✅ Created 3 users (admin, manager, cso)');

    // Create customers
    console.log('📋 Creating customers...');
    const customerList: Customer[] = [];
    for (let i = 0; i < 20; i++) {
      const customer = await customerRepository.save({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        company: faker.company.name(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        country: faker.location.country(),
        active: true,
      });
      customerList.push(customer);
    }
    console.log('✅ Created 20 customers');

    // Create inquiries
    console.log('💬 Creating inquiries...');
    const priorities = Object.values(InquiryPriority);
    const statuses = [InquiryStatus.PENDING, InquiryStatus.IN_PROGRESS, InquiryStatus.RESOLVED];
    
    for (const customer of customerList) {
      const inquiry = await inquiryRepository.save({
        subject: faker.lorem.sentence(),
        message: faker.lorem.paragraphs(2),
        status: faker.helpers.arrayElement(statuses),
        priority: faker.helpers.arrayElement(priorities),
        category: faker.helpers.arrayElement(['technical', 'billing', 'general', 'complaint']),
        customerId: customer.id,
        assignedTo: Math.random() > 0.3 ? cso.id : undefined,
      });
    }
    console.log('✅ Created 20 inquiries');

    console.log(`
    ========================================
    🎉 Basic seed completed successfully!
    ========================================
    
    Test accounts:
    📧 admin@nexus.com / Admin123!@#
    📧 manager@nexus.com / Admin123!@# 
    📧 cso@nexus.com / Admin123!@#
    
    Created:
    - 3 users
    - 20 customers  
    - 20 inquiries
    ========================================
    `);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// Run the seed
seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });