import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InitialMigration1701000000000 implements MigrationInterface {
  name = 'InitialMigration1701000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension for PostgreSQL
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create Users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
          },
          {
            name: 'first_name',
            type: 'varchar',
          },
          {
            name: 'last_name',
            type: 'varchar',
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['admin', 'manager', 'cso'],
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'refresh_token',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'last_login',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create Customers table
    await queryRunner.createTable(
      new Table({
        name: 'customers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'first_name',
            type: 'varchar',
          },
          {
            name: 'last_name',
            type: 'varchar',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'company',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'suspended'],
            default: "'active'",
          },
          {
            name: 'segment',
            type: 'enum',
            enum: ['premium', 'standard', 'basic', 'vip'],
            default: "'standard'",
          },
          {
            name: 'total_spent',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'order_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'last_order_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create Inquiries table
    await queryRunner.createTable(
      new Table({
        name: 'inquiries',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'subject',
            type: 'varchar',
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'in_progress', 'responded', 'closed'],
            default: "'pending'",
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['low', 'medium', 'high', 'urgent'],
            default: "'medium'",
          },
          {
            name: 'category',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'customer_id',
            type: 'uuid',
          },
          {
            name: 'assigned_to',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create Responses table
    await queryRunner.createTable(
      new Table({
        name: 'responses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'response_text',
            type: 'text',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'pending_approval', 'approved', 'rejected', 'sent'],
            default: "'draft'",
          },
          {
            name: 'approval_notes',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'rejection_reason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'sent_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'approved_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'rejected_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'inquiry_id',
            type: 'uuid',
          },
          {
            name: 'responder_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add Foreign Keys
    await queryRunner.query(`
      ALTER TABLE "inquiries"
      ADD CONSTRAINT "FK_inquiry_customer"
      FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "inquiries"
      ADD CONSTRAINT "FK_inquiry_assignee"
      FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "responses"
      ADD CONSTRAINT "FK_response_inquiry"
      FOREIGN KEY ("inquiry_id") REFERENCES "inquiries"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "responses"
      ADD CONSTRAINT "FK_response_responder"
      FOREIGN KEY ("responder_id") REFERENCES "users"("id") ON DELETE RESTRICT
    `);


    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_USER_EMAIL" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_CUSTOMER_EMAIL" ON "customers" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_CUSTOMER_STATUS" ON "customers" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_INQUIRY_STATUS" ON "inquiries" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_INQUIRY_CUSTOMER" ON "inquiries" ("customer_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_INQUIRY_ASSIGNEE" ON "inquiries" ("assigned_to")`);
    await queryRunner.query(`CREATE INDEX "IDX_RESPONSE_STATUS" ON "responses" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_RESPONSE_INQUIRY" ON "responses" ("inquiry_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_RESPONSE_INQUIRY"`);
    await queryRunner.query(`DROP INDEX "IDX_RESPONSE_STATUS"`);
    await queryRunner.query(`DROP INDEX "IDX_INQUIRY_ASSIGNEE"`);
    await queryRunner.query(`DROP INDEX "IDX_INQUIRY_CUSTOMER"`);
    await queryRunner.query(`DROP INDEX "IDX_INQUIRY_STATUS"`);
    await queryRunner.query(`DROP INDEX "IDX_CUSTOMER_STATUS"`);
    await queryRunner.query(`DROP INDEX "IDX_CUSTOMER_EMAIL"`);
    await queryRunner.query(`DROP INDEX "IDX_USER_EMAIL"`);

    // Drop foreign keys
    await queryRunner.query('ALTER TABLE "responses" DROP CONSTRAINT "FK_response_responder"');
    await queryRunner.query('ALTER TABLE "responses" DROP CONSTRAINT "FK_response_inquiry"');
    await queryRunner.query('ALTER TABLE "inquiries" DROP CONSTRAINT "FK_inquiry_assignee"');
    await queryRunner.query('ALTER TABLE "inquiries" DROP CONSTRAINT "FK_inquiry_customer"');

    // Drop tables
    await queryRunner.dropTable('responses');
    await queryRunner.dropTable('inquiries');
    await queryRunner.dropTable('customers');
    await queryRunner.dropTable('users');
  }
}