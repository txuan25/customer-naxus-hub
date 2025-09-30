import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Inquiry } from '../entities/inquiry.entity';
import { InquiryStatus, InquiryPriority } from '../../common/enums/inquiry-status.enum';
import { Customer } from '../entities/customer.entity';

export async function seedInquiries(dataSource: DataSource, customers: Customer[]): Promise<Inquiry[]> {
  const inquiryRepository = dataSource.getRepository(Inquiry);
  const inquiries: Partial<Inquiry>[] = [];

  // Common inquiry subjects and messages
  const subjects = [
    'Product information request',
    'Pricing inquiry',
    'Technical support needed',
    'Account issue',
    'Billing question',
    'Feature request',
    'Service complaint',
    'Upgrade options',
    'Contract renewal',
    'General inquiry',
    'Demo request',
    'Partnership opportunity',
    'Refund request',
    'Documentation help',
    'Integration support',
  ];

  const categories = [
    'Sales',
    'Support',
    'Billing',
    'Technical',
    'General',
    'Complaints',
    'Features',
  ];

  // Create inquiries for customers
  for (const customer of customers) {
    // Each customer has 0-5 inquiries
    const inquiryCount = faker.number.int({ min: 0, max: 5 });
    
    for (let i = 0; i < inquiryCount; i++) {
      const subject = faker.helpers.arrayElement(subjects);
      const category = faker.helpers.arrayElement(categories);
      
      // Generate realistic message based on subject
      let message = faker.lorem.paragraph(3);
      if (subject.includes('support') || subject.includes('issue')) {
        message = `I'm experiencing issues with ${faker.commerce.product()}. ${faker.lorem.paragraph(2)} Please help resolve this as soon as possible.`;
      } else if (subject.includes('pricing') || subject.includes('upgrade')) {
        message = `I would like to know more about ${faker.commerce.product()} pricing and available plans. ${faker.lorem.paragraph(2)}`;
      } else if (subject.includes('complaint')) {
        message = `I'm not satisfied with the service. ${faker.lorem.paragraph(3)} This needs immediate attention.`;
      }

      // Determine status based on creation date
      const createdAt = faker.date.recent({ days: 60 });
      let status: InquiryStatus;
      let resolvedAt: Date | undefined;
      let resolutionNotes: string | undefined;

      // Older inquiries are more likely to be resolved
      const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceCreation > 30) {
        status = faker.helpers.weightedArrayElement([
          { value: InquiryStatus.CLOSED, weight: 60 },
          { value: InquiryStatus.APPROVED, weight: 20 },
          { value: InquiryStatus.REJECTED, weight: 10 },
          { value: InquiryStatus.IN_PROGRESS, weight: 10 },
        ]);
      } else if (daysSinceCreation > 7) {
        status = faker.helpers.weightedArrayElement([
          { value: InquiryStatus.IN_PROGRESS, weight: 40 },
          { value: InquiryStatus.PENDING_APPROVAL, weight: 30 },
          { value: InquiryStatus.CLOSED, weight: 20 },
          { value: InquiryStatus.OPEN, weight: 10 },
        ]);
      } else {
        status = faker.helpers.weightedArrayElement([
          { value: InquiryStatus.OPEN, weight: 40 },
          { value: InquiryStatus.IN_PROGRESS, weight: 30 },
          { value: InquiryStatus.PENDING_APPROVAL, weight: 30 },
        ]);
      }

      // Set resolution details for closed/approved inquiries
      if (status === InquiryStatus.CLOSED || status === InquiryStatus.APPROVED) {
        resolvedAt = faker.date.between({ from: createdAt, to: new Date() });
        resolutionNotes = faker.lorem.sentence();
      }

      // Priority based on subject and status
      let priority: InquiryPriority;
      if (subject.includes('complaint') || subject.includes('issue')) {
        priority = faker.helpers.weightedArrayElement([
          { value: InquiryPriority.HIGH, weight: 40 },
          { value: InquiryPriority.URGENT, weight: 30 },
          { value: InquiryPriority.MEDIUM, weight: 30 },
        ]);
      } else if (subject.includes('support') || subject.includes('technical')) {
        priority = faker.helpers.weightedArrayElement([
          { value: InquiryPriority.MEDIUM, weight: 50 },
          { value: InquiryPriority.HIGH, weight: 30 },
          { value: InquiryPriority.LOW, weight: 20 },
        ]);
      } else {
        priority = faker.helpers.weightedArrayElement([
          { value: InquiryPriority.LOW, weight: 40 },
          { value: InquiryPriority.MEDIUM, weight: 40 },
          { value: InquiryPriority.HIGH, weight: 20 },
        ]);
      }

      inquiries.push({
        subject,
        message,
        status,
        priority,
        category,
        customerId: customer.id,
        tags: faker.helpers.maybe(() => faker.helpers.arrayElements(['important', 'followup', 'vip', 'urgent', 'resolved'], { min: 1, max: 3 }).join(','), { probability: 0.3 }),
        resolvedAt,
        resolutionNotes,
        attachments: faker.helpers.maybe(() => [{
          filename: faker.system.fileName(),
          url: faker.internet.url(),
          size: faker.number.int({ min: 1000, max: 5000000 }),
          mimeType: faker.helpers.arrayElement(['application/pdf', 'image/png', 'image/jpeg', 'application/docx']),
        }], { probability: 0.2 }),
      });
    }
  }

  const savedInquiries = await inquiryRepository.save(inquiries);
  console.log(`✅ Seeded ${savedInquiries.length} inquiries`);
  return savedInquiries;
}