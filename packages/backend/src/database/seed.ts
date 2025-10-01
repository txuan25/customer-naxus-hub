import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Starting database seeding...');

  try {
    // Check if data already exists
    const userCount = await dataSource.query('SELECT COUNT(*) FROM users');
    if (userCount[0].count > 0) {
      console.log('⚠️  Database already contains data. Skipping seed to prevent duplicates.');
      console.log(`   Found ${userCount[0].count} existing users.`);
      console.log('   To re-seed, manually clear the database first.');
      return;
    }

    // Only proceed if database is empty
    console.log('✅ Database is empty, proceeding with seeding...');

    // Seed Users
    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        email: 'admin@crm.com',
        password: hashedPassword,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        role: 'admin',
        "is_active": true
      },
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        email: 'manager@crm.com',
        password: hashedPassword,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        role: 'manager',
        "is_active": true
      },
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        email: 'cso1@crm.com',
        password: hashedPassword,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        role: 'cso',
        "is_active": true
      },
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        email: 'cso2@crm.com',
        password: hashedPassword,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        role: 'cso',
        "is_active": true
      }
    ];

    for (const user of users) {
      await dataSource.query(
        `INSERT INTO users (id, email, password, first_name, last_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [user.id, user.email, user.password, user.first_name, user.last_name, user.role, user.is_active]
      );
    }

    // Seed Customers
    console.log('Seeding customers...');
    const customerIds: string[] = [];
    for (let i = 0; i < 50; i++) {
      const customerId = faker.string.uuid();
      customerIds.push(customerId);
      
      const customer = {
        id: customerId,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        company: faker.company.name(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        country: faker.location.country(),
        status: faker.helpers.arrayElement(['active', 'inactive', 'suspended']),
        segment: faker.helpers.arrayElement(['premium', 'standard', 'basic', 'vip']),
        total_spent: faker.number.float({ min: 0, max: 50000, multipleOf: 0.01 }),
        order_count: faker.number.int({ min: 0, max: 100 }),
        last_order_date: faker.date.recent({ days: 90 }),
        metadata: JSON.stringify({
          notes: faker.lorem.sentence(),
          tags: faker.helpers.arrayElements(['important', 'new', 'returning', 'vip'], { min: 1, max: 3 })
        })
      };

      await dataSource.query(
        `INSERT INTO customers (
          id, first_name, last_name, email, phone, company, 
          address, city, country, status, segment, 
          total_spent, order_count, last_order_date, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          customer.id,
          customer.first_name,
          customer.last_name,
          customer.email,
          customer.phone,
          customer.company,
          customer.address,
          customer.city,
          customer.country,
          customer.status,
          customer.segment,
          customer.total_spent,
          customer.order_count,
          customer.last_order_date,
          customer.metadata
        ]
      );
    }

    // Seed Inquiries
    console.log('Seeding inquiries...');
    const inquiryIds: string[] = [];
    const csoUserIds = ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'];
    
    for (let i = 0; i < 100; i++) {
      const inquiryId = faker.string.uuid();
      inquiryIds.push(inquiryId);
      
      const inquiry = {
        id: inquiryId,
        subject: faker.lorem.sentence({ min: 3, max: 8 }),
        message: faker.lorem.paragraphs({ min: 1, max: 3 }),
        status: faker.helpers.arrayElement(['pending', 'in_progress', 'responded', 'closed']),
        priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
        category: faker.helpers.arrayElement(['Technical Support', 'Billing', 'General Inquiry', 'Complaint', 'Feature Request']),
        customer_id: faker.helpers.arrayElement(customerIds),
        assigned_to: faker.helpers.maybe(() => faker.helpers.arrayElement(csoUserIds), { probability: 0.7 }),
        tags: JSON.stringify(faker.helpers.arrayElements(
          ['urgent', 'follow-up', 'resolved', 'escalated', 'waiting-customer'],
          { min: 0, max: 3 }
        )),
        metadata: JSON.stringify({
          source: faker.helpers.arrayElement(['email', 'phone', 'chat', 'form']),
          browser: faker.helpers.arrayElement(['Chrome', 'Firefox', 'Safari', 'Edge'])
        })
      };

      await dataSource.query(
        `INSERT INTO inquiries (
          id, subject, message, status, priority, category,
          customer_id, assigned_to, tags, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          inquiry.id,
          inquiry.subject,
          inquiry.message,
          inquiry.status,
          inquiry.priority,
          inquiry.category,
          inquiry.customer_id,
          inquiry.assigned_to,
          inquiry.tags,
          inquiry.metadata
        ]
      );
    }

    // Seed Responses (only for inquiries that are responded or closed)
    console.log('Seeding responses...');
    const respondedInquiries = await dataSource.query(
      `SELECT id, assigned_to FROM inquiries WHERE status IN ('responded', 'closed') AND assigned_to IS NOT NULL`
    );

    for (const inquiry of respondedInquiries) {
      const response = {
        id: faker.string.uuid(),
        response_text: faker.lorem.paragraphs({ min: 1, max: 2 }),
        status: faker.helpers.arrayElement(['draft', 'pending_approval', 'approved', 'sent']),
        approval_notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
        rejection_reason: null,
        sent_at: faker.helpers.maybe(() => faker.date.recent({ days: 30 }), { probability: 0.5 }),
        approved_at: faker.helpers.maybe(() => faker.date.recent({ days: 30 }), { probability: 0.5 }),
        rejected_at: null,
        metadata: JSON.stringify({
          template_used: faker.helpers.maybe(() => 'template_' + faker.number.int({ min: 1, max: 5 }), { probability: 0.3 }),
          response_time_minutes: faker.number.int({ min: 5, max: 480 })
        }),
        inquiry_id: inquiry.id,
        responder_id: inquiry.assigned_to || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        approved_by_id: faker.helpers.maybe(() => 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', { probability: 0.5 })
      };

      await dataSource.query(
        `INSERT INTO responses (
          id, response_text, status, approval_notes, rejection_reason,
          sent_at, approved_at, rejected_at, metadata,
          inquiry_id, responder_id, approved_by_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          response.id,
          response.response_text,
          response.status,
          response.approval_notes,
          response.rejection_reason,
          response.sent_at,
          response.approved_at,
          response.rejected_at,
          response.metadata,
          response.inquiry_id,
          response.responder_id,
          response.approved_by_id
        ]
      );
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Seeded data summary:');
    console.log(`   - Users: 4 (1 admin, 1 manager, 2 CSOs)`);
    console.log(`   - Customers: 50`);
    console.log(`   - Inquiries: 100`);
    console.log(`   - Responses: ${respondedInquiries.length}`);
    console.log('\n🔐 Login credentials:');
    console.log('   Admin: admin@crm.com / password123');
    console.log('   Manager: manager@crm.com / password123');
    console.log('   CSO 1: cso1@crm.com / password123');
    console.log('   CSO 2: cso2@crm.com / password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Run seeding
seed().catch((error) => {
  console.error('Fatal error during seeding:', error);
  process.exit(1);
});