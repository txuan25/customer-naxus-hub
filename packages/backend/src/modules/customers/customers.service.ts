import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../database/entities/customer.entity';
import { User } from '../../database/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export interface CustomerListResponse {
  items: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, user: User): Promise<Customer> {
    const customer = this.customerRepository.create({
      ...createCustomerDto,
    });

    return this.customerRepository.save(customer);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    user: User,
  ): Promise<CustomerListResponse> {
    const query = this.customerRepository.createQueryBuilder('customer');

    // All users can see all customers for now (no assignment logic)
    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('customer.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, user: User): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['inquiries'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
    user: User,
  ): Promise<Customer> {
    const customer = await this.findOne(id, user);

    Object.assign(customer, updateCustomerDto);
    return this.customerRepository.save(customer);
  }

  async remove(id: string, user: User): Promise<void> {
    // Only Admin and Manager can delete customers
    if (user.role === UserRole.CSO) {
      throw new ForbiddenException('You do not have permission to delete customers');
    }

    const customer = await this.findOne(id, user);
    await this.customerRepository.remove(customer);
  }

  async assignToUser(customerId: string, userId: string, user: User): Promise<Customer> {
    // Assignment functionality temporarily disabled since assignedTo relation was removed
    throw new ForbiddenException('Customer assignment feature is temporarily unavailable');
  }

  async searchCustomers(
    searchTerm: string,
    user: User,
    page: number = 1,
    limit: number = 10,
  ): Promise<CustomerListResponse> {
    const query = this.customerRepository.createQueryBuilder('customer')
      .where(
        '(customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.email ILIKE :search OR customer.company ILIKE :search)',
        { search: `%${searchTerm}%` },
      );

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('customer.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}