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
  data: Customer[];
  total: number;
  page: number;
  limit: number;
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
      createdBy: user,
      assignedTo: user.role === UserRole.CSO ? user : undefined,
    });

    return this.customerRepository.save(customer);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    user: User,
  ): Promise<CustomerListResponse> {
    const query = this.customerRepository.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.createdBy', 'createdBy')
      .leftJoinAndSelect('customer.assignedTo', 'assignedTo');

    // CSO can only see customers assigned to them
    if (user.role === UserRole.CSO) {
      query.where('customer.assignedToId = :userId', { userId: user.id });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('customer.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, user: User): Promise<Customer> {
    const query = this.customerRepository.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.createdBy', 'createdBy')
      .leftJoinAndSelect('customer.assignedTo', 'assignedTo')
      .leftJoinAndSelect('customer.inquiries', 'inquiries')
      .where('customer.id = :id', { id });

    // CSO can only see customers assigned to them
    if (user.role === UserRole.CSO) {
      query.andWhere('customer.assignedToId = :userId', { userId: user.id });
    }

    const customer = await query.getOne();

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

    // CSO can only update customers assigned to them
    if (user.role === UserRole.CSO && customer.assignedTo?.id !== user.id) {
      throw new ForbiddenException('You can only update customers assigned to you');
    }

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
    // Only Admin and Manager can assign customers
    if (user.role === UserRole.CSO) {
      throw new ForbiddenException('You do not have permission to assign customers');
    }

    const customer = await this.findOne(customerId, user);
    customer.assignedTo = { id: userId } as User;
    
    return this.customerRepository.save(customer);
  }

  async searchCustomers(
    searchTerm: string,
    user: User,
    page: number = 1,
    limit: number = 10,
  ): Promise<CustomerListResponse> {
    const query = this.customerRepository.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.createdBy', 'createdBy')
      .leftJoinAndSelect('customer.assignedTo', 'assignedTo')
      .where(
        '(customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.email ILIKE :search OR customer.company ILIKE :search)',
        { search: `%${searchTerm}%` },
      );

    // CSO can only search their assigned customers
    if (user.role === UserRole.CSO) {
      query.andWhere('customer.assignedToId = :userId', { userId: user.id });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('customer.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }
}