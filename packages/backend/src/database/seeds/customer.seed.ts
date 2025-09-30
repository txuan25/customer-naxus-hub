import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { CustomerStatus } from '../../common/enums/customer-status.enum';
import { User } from '../entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

export async function seedCustomers(dataSource: DataSource, users: User[]): Promise<Customer[]> {
  const customerRepository = dataSource.getRepository(Customer);
  const customers: Partial<Customer>[] = [];

  // Get CSOs and some managers for assignment
  const csos = users.filter(u => u.role === UserRole.CSO);
  const managers = users.filter(u => u.role === UserRole.MANAGER);
  const assignableUsers = [...csos, ...managers.slice(0, 1)]; // CSOs and 1 manager

  // Create customers with realistic international names
  for (let i = 0; i < 100; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const company = faker.helpers.maybe(() => faker.company.name(), { probability: 0.4 });
    const assignedTo = faker.helpers.arrayElement(assignableUsers);
    const createdBy = faker.helpers.arrayElement(assignableUsers);

    customers.push({
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      phone: faker.phone.number(),
      company,
      status: faker.helpers.weightedArrayElement([
        { value: CustomerStatus.ACTIVE, weight: 50 },
        { value: CustomerStatus.PROSPECT, weight: 30 },
        { value: CustomerStatus.INACTIVE, weight: 20 },
      ]),
      metadata: {
        source: faker.helpers.arrayElement(['Website', 'Referral', 'Cold Call', 'Social Media', 'Event']),
        industry: company ? faker.helpers.arrayElement(['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing']) : null,
        value: faker.helpers.arrayElement(['High', 'Medium', 'Low']),
        lastContact: faker.date.recent({ days: 30 }).toISOString(),
      },
      notes: faker.helpers.maybe(() => faker.lorem.sentences(2), { probability: 0.3 }),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      country: faker.location.country(),
      createdById: createdBy.id,
      assignedToId: assignedTo.id,
    });
  }

  // Create some VIP customers
  for (let i = 0; i < 20; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const company = faker.company.name();
    const assignedTo = faker.helpers.arrayElement(managers); // VIPs assigned to managers

    customers.push({
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      phone: faker.phone.number(),
      company,
      status: CustomerStatus.ACTIVE,
      metadata: {
        source: 'Direct',
        vip: true,
        industry: faker.helpers.arrayElement(['Banking', 'Insurance', 'Real Estate', 'E-commerce']),
        value: 'VIP',
        revenue: faker.number.int({ min: 100000, max: 10000000 }),
        employeeCount: faker.number.int({ min: 50, max: 5000 }),
        lastContact: faker.date.recent({ days: 7 }).toISOString(),
      },
      notes: `VIP Customer - ${faker.lorem.sentence()}`,
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      country: faker.location.country(),
      createdById: assignedTo.id,
      assignedToId: assignedTo.id,
    });
  }

  const savedCustomers = await customerRepository.save(customers);
  console.log(`✅ Seeded ${savedCustomers.length} customers`);
  return savedCustomers;
}