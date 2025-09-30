import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

export async function seedUsers(dataSource: DataSource): Promise<User[]> {
  const userRepository = dataSource.getRepository(User);
  const users: Partial<User>[] = [];

  // Create Admin user
  users.push({
    email: 'admin@cnh.com',
    password: 'Admin@123', // Will be hashed by entity
    role: UserRole.ADMIN,
    firstName: 'Admin',
    lastName: 'User',
    isActive: true,
  });

  // Create Manager users
  for (let i = 0; i < 3; i++) {
    users.push({
      email: `manager${i + 1}@cnh.com`,
      password: 'Manager@123',
      role: UserRole.MANAGER,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      isActive: true,
    });
  }

  // Create CSO users
  for (let i = 0; i < 10; i++) {
    users.push({
      email: `cso${i + 1}@cnh.com`,
      password: 'Cso@123',
      role: UserRole.CSO,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      isActive: true,
    });
  }

  // Create random users with faker data
  for (let i = 0; i < 10; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    users.push({
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password: 'User@123',
      role: faker.helpers.arrayElement([UserRole.CSO, UserRole.CSO, UserRole.MANAGER]), // More CSOs
      firstName,
      lastName,
      isActive: faker.datatype.boolean({ probability: 0.9 }), // 90% active
    });
  }

  const savedUsers = await userRepository.save(users);
  console.log(`✅ Seeded ${savedUsers.length} users`);
  return savedUsers;
}