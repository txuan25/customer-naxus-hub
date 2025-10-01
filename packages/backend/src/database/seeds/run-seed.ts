import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../entities/user.entity';
import { Customer } from '../entities/customer.entity';
import { Inquiry } from '../entities/inquiry.entity';
import { Response } from '../entities/response.entity';
import { seedUsers } from './user.seed';
import { seedCustomers } from './customer.seed';
import { seedInquiries } from './inquiry.seed';
import { seedResponses } from './response.seed';

// Load environment variables
dotenv.config({ path: '../../../.env' });

// Create data source for seeding
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'crm_user',
  password: process.env.DATABASE_PASSWORD || 'crmpass123',
  database: process.env.DATABASE_NAME || 'customer_hub_db',
  entities: [User, Customer, Inquiry, Response],
  synchronize: false, // Don't use synchronize, we use migrations
  logging: false,
});

async function runSeed() {
  try {
    console.log('🚀 Starting seed process...');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Clear existing data (be careful with this in production!)
    console.log('🗑️  Clearing existing data...');
    await AppDataSource.getRepository(Response).delete({});
    await AppDataSource.getRepository(Inquiry).delete({});
    await AppDataSource.getRepository(Customer).delete({});
    await AppDataSource.getRepository(User).delete({});
    console.log('✅ Existing data cleared');

    // Run seeds in order
    console.log('🌱 Seeding database...\n');

    // 1. Seed Users
    console.log('👥 Seeding users...');
    const users = await seedUsers(AppDataSource);
    
    // 2. Seed Customers
    console.log('🏢 Seeding customers...');
    const customers = await seedCustomers(AppDataSource, users);
    
    // 3. Seed Inquiries
    console.log('❓ Seeding inquiries...');
    const inquiries = await seedInquiries(AppDataSource, customers);
    
    // 4. Seed Responses
    console.log('💬 Seeding responses...');
    const responses = await seedResponses(AppDataSource, inquiries, users);

    // Summary
    console.log('\n📊 Seed Summary:');
    console.log('================');
    console.log(`✅ Users: ${users.length}`);
    console.log(`✅ Customers: ${customers.length}`);
    console.log(`✅ Inquiries: ${inquiries.length}`);
    console.log(`✅ Responses: ${responses.length}`);
    
    console.log('\n🎉 Database seeding completed successfully!');
    
    // Print login credentials
    console.log('\n🔑 Test Login Credentials:');
    console.log('==========================');
    console.log('Admin:    admin@cnh.com / Admin@123');
    console.log('Manager:  manager1@cnh.com / Manager@123');
    console.log('CSO:      cso1@cnh.com / Cso@123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('\n👋 Database connection closed');
  }
}

// Run the seed
runSeed()
  .then(() => {
    console.log('\n✨ Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });