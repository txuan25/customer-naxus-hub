import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Response } from '../entities/response.entity';
import { ResponseStatus } from '../../common/enums/response-status.enum';
import { Inquiry } from '../entities/inquiry.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { InquiryStatus } from '../../common/enums/inquiry-status.enum';

export async function seedResponses(
  dataSource: DataSource,
  inquiries: Inquiry[],
  users: User[]
): Promise<Response[]> {
  const responseRepository = dataSource.getRepository(Response);
  const responses: Partial<Response>[] = [];

  // Get CSOs and managers
  const csos = users.filter(u => u.role === UserRole.CSO);
  const managers = users.filter(u => u.role === UserRole.MANAGER);

  // Response templates
  const responseTemplates = {
    greeting: [
      'Thank you for contacting us.',
      'We appreciate your inquiry.',
      'Thank you for reaching out to our team.',
      'We have received your message.',
    ],
    closing: [
      'Please let us know if you need any further assistance.',
      'We are here to help if you have any other questions.',
      'Feel free to contact us if you need additional information.',
      'We look forward to serving you.',
    ],
    processing: [
      'We are currently reviewing your request.',
      'Your inquiry is being processed by our team.',
      'We are looking into this matter for you.',
      'Our team is working on your request.',
    ],
    resolution: [
      'The issue has been resolved.',
      'We have completed the requested action.',
      'Your request has been fulfilled.',
      'The matter has been addressed.',
    ],
  };

  // Create responses for inquiries that are not OPEN
  for (const inquiry of inquiries) {
    if (inquiry.status === InquiryStatus.OPEN) {
      continue; // Skip open inquiries
    }

    // Number of responses per inquiry (1-3)
    const responseCount = faker.number.int({ min: 1, max: 3 });

    for (let i = 0; i < responseCount; i++) {
      const respondedBy = faker.helpers.arrayElement(csos);
      let approvedBy: User | undefined;
      let status: ResponseStatus;
      let approvalNotes: string | undefined;
      let rejectionReason: string | undefined;
      let sentAt: Date | undefined;
      let emailSent = false;
      let emailSentAt: Date | undefined;

      // Generate response message
      const greeting = faker.helpers.arrayElement(responseTemplates.greeting);
      const closing = faker.helpers.arrayElement(responseTemplates.closing);
      let bodyContent: string;

      if (inquiry.status === InquiryStatus.CLOSED || inquiry.status === InquiryStatus.APPROVED) {
        bodyContent = `${faker.helpers.arrayElement(responseTemplates.resolution)} ${faker.lorem.paragraph()}`;
        status = ResponseStatus.SENT;
        approvedBy = faker.helpers.arrayElement(managers);
        approvalNotes = 'Response approved and sent to customer';
        sentAt = faker.date.recent({ days: 7 });
        emailSent = true;
        emailSentAt = sentAt;
      } else if (inquiry.status === InquiryStatus.PENDING_APPROVAL) {
        if (i === responseCount - 1) {
          // Latest response is pending approval
          status = ResponseStatus.PENDING_APPROVAL;
          bodyContent = `${faker.helpers.arrayElement(responseTemplates.processing)} ${faker.lorem.paragraph()}`;
        } else {
          // Earlier responses might be rejected
          status = faker.helpers.arrayElement([ResponseStatus.REJECTED, ResponseStatus.APPROVED]);
          if (status === ResponseStatus.REJECTED) {
            approvedBy = faker.helpers.arrayElement(managers);
            rejectionReason = faker.helpers.arrayElement([
              'Needs more detail',
              'Incorrect information provided',
              'Please revise the tone',
              'Missing key information',
              'Requires manager input',
            ]);
            bodyContent = faker.lorem.paragraph();
          } else {
            bodyContent = `${faker.helpers.arrayElement(responseTemplates.resolution)} ${faker.lorem.paragraph()}`;
            approvedBy = faker.helpers.arrayElement(managers);
            approvalNotes = 'Approved';
          }
        }
      } else if (inquiry.status === InquiryStatus.IN_PROGRESS) {
        status = faker.helpers.arrayElement([ResponseStatus.DRAFT, ResponseStatus.PENDING_APPROVAL]);
        bodyContent = `${faker.helpers.arrayElement(responseTemplates.processing)} ${faker.lorem.paragraph()}`;
      } else if (inquiry.status === InquiryStatus.REJECTED) {
        status = ResponseStatus.REJECTED;
        approvedBy = faker.helpers.arrayElement(managers);
        rejectionReason = 'Customer request cannot be fulfilled';
        bodyContent = `Unfortunately, we cannot accommodate your request at this time. ${faker.lorem.paragraph()}`;
      } else {
        status = ResponseStatus.DRAFT;
        bodyContent = faker.lorem.paragraph();
      }

      const message = `${greeting}\n\n${bodyContent}\n\n${closing}`;

      // Generate subject based on inquiry
      const subject = `Re: ${inquiry.subject}`;

      responses.push({
        message,
        subject,
        status,
        inquiryId: inquiry.id,
        respondedById: respondedBy.id,
        approvedById: approvedBy?.id,
        approvalNotes,
        rejectionReason,
        sentAt,
        emailSent,
        emailSentAt,
        attachments: faker.helpers.maybe(() => [{
          filename: faker.system.fileName(),
          url: faker.internet.url(),
          size: faker.number.int({ min: 1000, max: 2000000 }),
          mimeType: faker.helpers.arrayElement(['application/pdf', 'application/docx']),
        }], { probability: 0.1 }),
      });
    }
  }

  const savedResponses = await responseRepository.save(responses);
  console.log(`✅ Seeded ${savedResponses.length} responses`);
  return savedResponses;
}