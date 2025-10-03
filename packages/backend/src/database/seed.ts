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
        first_name: 'John',
        last_name: 'Admin',
        role: 'admin',
        "is_active": true
      },
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        email: 'manager@crm.com',
        password: hashedPassword,
        first_name: 'Sarah',
        last_name: 'Manager',
        role: 'manager',
        "is_active": true
      },
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        email: 'cso1@crm.com',
        password: hashedPassword,
        first_name: 'Mike',
        last_name: 'Wilson',
        role: 'cso',
        "is_active": true
      },
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        email: 'cso2@crm.com',
        password: hashedPassword,
        first_name: 'Lisa',
        last_name: 'Chen',
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
      
      // Create realistic inquiry subjects and messages based on category
      const category = faker.helpers.arrayElement(['technical', 'billing', 'general', 'complaint', 'feature_request']);
      const status = faker.helpers.arrayElement(['pending', 'in_progress', 'responded', 'closed']);
      const priority = faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']);
      
      let subject = '';
      let message = '';
      
      switch (category) {
        case 'technical':
          const techIssues = [
            {
              subject: 'Unable to login to my account',
              message: 'Hi, I\'ve been trying to log into my account for the past hour but keep getting an "invalid credentials" error. I\'m sure I\'m using the correct email and password. Could you please help me reset my account or check if there\'s an issue on your end? My email is registered under this account.'
            },
            {
              subject: 'Website not loading properly on mobile',
              message: 'Hello, I\'m experiencing issues with your website on my mobile device. The pages are loading very slowly and some buttons are not responding when I tap them. This happens on both Chrome and Safari browsers on my iPhone. The desktop version works fine. Can you please look into this?'
            },
            {
              subject: 'Error message when uploading files',
              message: 'I keep getting an error message "File upload failed" whenever I try to upload documents to my profile. I\'ve tried different file formats (PDF, JPG, PNG) and they\'re all under 5MB as specified in your guidelines. The error occurs on the last step of the upload process. Please assist.'
            },
            {
              subject: 'Dashboard data not updating',
              message: 'The dashboard in my account shows old data from last week and doesn\'t seem to be updating with new information. I\'ve tried refreshing the page and clearing my browser cache, but the issue persists. Is this a known issue? I need access to real-time data for my reports.'
            }
          ];
          const techIssue = faker.helpers.arrayElement(techIssues);
          subject = techIssue.subject;
          message = techIssue.message;
          break;
          
        case 'billing':
          const billingIssues = [
            {
              subject: 'Incorrect charge on my credit card',
              message: 'I noticed a charge of $89.99 on my credit card statement that I don\'t recognize. The transaction date is last Tuesday and it\'s labeled as coming from your company. However, I don\'t recall making any purchases on that date. Could you please check my account and provide details about this charge? If it\'s an error, I\'d like it reversed.'
            },
            {
              subject: 'Request for invoice copy',
              message: 'Hello, I need a copy of my invoice from last month (Invoice #INV-2024-1234) for my accounting records. I can\'t seem to find it in my email and it\'s not showing up in my account dashboard. Could you please resend it to my email address or let me know how I can download it from my account?'
            },
            {
              subject: 'Unable to update payment method',
              message: 'I\'m trying to update my payment method in my account settings, but I keep getting an error when I try to save the new credit card information. The page says "Payment method could not be updated" without any specific reason. My subscription is due for renewal next week, so I need to resolve this soon.'
            },
            {
              subject: 'Subscription cancellation request',
              message: 'I would like to cancel my subscription effective at the end of this billing cycle. I\'ve been satisfied with the service, but I no longer need it for my current projects. Please confirm the cancellation and let me know the exact date when my access will end. Will I receive a final invoice?'
            }
          ];
          const billingIssue = faker.helpers.arrayElement(billingIssues);
          subject = billingIssue.subject;
          message = billingIssue.message;
          break;
          
        case 'general':
          const generalInquiries = [
            {
              subject: 'Information about enterprise plans',
              message: 'Hello, I work for a mid-size company and we\'re interested in your enterprise solutions. Could you provide more information about the enterprise plans, including pricing, features, and any volume discounts available? We would need licenses for approximately 50 users. Also, do you offer custom integration services?'
            },
            {
              subject: 'How to export my data',
              message: 'Hi, I\'m planning to migrate to a different solution and need to export all my data from your platform. Could you guide me through the process? What formats are available for export and is there any restriction on how much data I can export at once? I want to make sure I don\'t lose any important information.'
            },
            {
              subject: 'Training resources for new team members',
              message: 'We just hired several new team members who will be using your platform. Do you have any training materials, video tutorials, or documentation that would help them get up to speed quickly? We\'d prefer self-paced learning resources, but live training sessions would also be valuable.'
            },
            {
              subject: 'API documentation and rate limits',
              message: 'I\'m a developer working on integrating your API into our application. I\'ve reviewed the basic documentation, but I need more details about rate limits, authentication best practices, and error handling. Are there any code examples or SDKs available for Node.js? Also, what\'s the process for requesting higher rate limits?'
            }
          ];
          const generalInquiry = faker.helpers.arrayElement(generalInquiries);
          subject = generalInquiry.subject;
          message = generalInquiry.message;
          break;
          
        case 'complaint':
          const complaints = [
            {
              subject: 'Disappointed with recent service quality',
              message: 'I\'ve been a loyal customer for over two years, but I\'m quite disappointed with the recent decline in service quality. Over the past month, I\'ve experienced multiple outages, slow response times, and my support tickets have taken much longer to resolve than usual. This is affecting my business operations. I expect better service given what I\'m paying.'
            },
            {
              subject: 'Promised features still not delivered',
              message: 'Six months ago, your sales team promised that certain features would be available "within the next quarter." These features were a key factor in my decision to choose your service over competitors. However, these features are still not available and I haven\'t received any updates on the timeline. This lack of communication is unacceptable.'
            },
            {
              subject: 'Poor customer support experience',
              message: 'I recently had a very frustrating experience with your customer support team. The representative I spoke with was unprofessional, didn\'t seem to understand my technical issue, and kept transferring me to different departments. I spent over 3 hours on the phone without getting my problem resolved. This is not the level of service I expect.'
            },
            {
              subject: 'Unexpected service downtime affecting business',
              message: 'Your service went down yesterday during our peak business hours without any prior notice. This outage lasted for 4 hours and caused significant disruption to our operations, resulting in lost revenue and angry customers. While I understand that technical issues can occur, the lack of communication and status updates was unacceptable.'
            }
          ];
          const complaint = faker.helpers.arrayElement(complaints);
          subject = complaint.subject;
          message = complaint.message;
          break;
          
        case 'feature_request':
          const featureRequests = [
            {
              subject: 'Request for dark mode interface',
              message: 'Would it be possible to add a dark mode option to your platform? Many of us work long hours looking at screens, and a dark theme would be much easier on the eyes, especially during evening work sessions. This feature is becoming standard across most modern applications, and it would greatly improve the user experience.'
            },
            {
              subject: 'Multi-language support request',
              message: 'Our team works with international clients and we would greatly benefit from multi-language support in your platform. Specifically, we need support for Spanish, French, and German. Is this something that\'s on your roadmap? If not, are there any workarounds or third-party solutions you\'d recommend?'
            },
            {
              subject: 'Advanced filtering and search capabilities',
              message: 'The current search functionality is quite basic. We would love to see more advanced filtering options, such as date ranges, custom field filters, and the ability to save search queries. With the amount of data we manage, these features would significantly improve our productivity and efficiency.'
            },
            {
              subject: 'Integration with Slack for notifications',
              message: 'It would be extremely helpful if your platform could integrate with Slack to send notifications about important events, updates, and alerts directly to our team channels. This would help us stay on top of critical issues without having to constantly check the dashboard. Many of our other tools already have this integration.'
            }
          ];
          const featureRequest = faker.helpers.arrayElement(featureRequests);
          subject = featureRequest.subject;
          message = featureRequest.message;
          break;
          
        default:
          subject = 'General inquiry about your services';
          message = 'Hello, I have a question about your services and would appreciate your assistance.';
      }
      
      const inquiry = {
        id: inquiryId,
        subject: subject,
        message: message,
        status: status,
        priority: priority,
        category: category,
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
      // Get the inquiry details to create appropriate response
      const inquiryDetails = await dataSource.query(
        `SELECT subject, category FROM inquiries WHERE id = $1`,
        [inquiry.id]
      );
      
      let responseText = '';
      const inquirySubject = inquiryDetails[0]?.subject || '';
      const inquiryCategory = inquiryDetails[0]?.category || '';
      
      // Generate appropriate responses based on inquiry type
      if (inquirySubject.includes('login') || inquirySubject.includes('account')) {
        responseText = `Thank you for contacting us regarding your account access issue. I've reviewed your account and found that it was temporarily locked due to multiple failed login attempts. I've now unlocked your account and sent a password reset link to your registered email address. Please check your inbox (and spam folder) and follow the instructions to set a new password. If you continue to experience issues, please don't hesitate to reach out to us.`;
      } else if (inquirySubject.includes('mobile') || inquirySubject.includes('website')) {
        responseText = `Thank you for reporting the mobile website issues. Our technical team has identified and resolved the problem you described. The slow loading times were caused by a recent update that affected mobile optimization. We've rolled back the problematic changes and implemented a fix. Please clear your mobile browser cache and try accessing the website again. The performance should now be significantly improved.`;
      } else if (inquirySubject.includes('upload') || inquirySubject.includes('file')) {
        responseText = `I apologize for the file upload issues you've been experiencing. Our development team has identified a bug in the upload module that was causing failures during the final processing step. This has been fixed in our latest update deployed yesterday. Please try uploading your files again. If you still encounter issues, please try using a different browser or contact us with the specific error message you receive.`;
      } else if (inquirySubject.includes('dashboard') || inquirySubject.includes('data')) {
        responseText = `Thank you for bringing the dashboard data issue to our attention. We experienced a temporary synchronization problem with our data pipeline, which caused some dashboards to display outdated information. This has been resolved and all data should now be current. Please refresh your dashboard and you should see the updated information. We apologize for any inconvenience this may have caused.`;
      } else if (inquirySubject.includes('charge') || inquirySubject.includes('billing')) {
        responseText = `Thank you for contacting us about the charge on your account. I've reviewed your billing history and can confirm that the $89.99 charge was for your monthly premium subscription that was automatically renewed on that date. I've sent a detailed invoice to your email address for your records. If you believe this charge is incorrect or if you'd like to discuss your subscription options, please let me know and I'll be happy to assist you further.`;
      } else if (inquirySubject.includes('invoice') || inquirySubject.includes('copy')) {
        responseText = `I've located your requested invoice (INV-2024-1234) and have resent it to your registered email address. Please check your inbox within the next few minutes. For future reference, you can also access and download all your invoices from the "Billing" section in your account dashboard. If you need invoices in a specific format or have any other billing questions, please feel free to ask.`;
      } else if (inquirySubject.includes('payment') || inquirySubject.includes('update')) {
        responseText = `I understand your frustration with updating the payment method. This issue was caused by a temporary problem with our payment processor's validation system. I've manually refreshed your account settings, and you should now be able to update your payment information successfully. Please try again, and if you encounter any issues, I can assist you over a brief phone call to ensure everything is set up correctly before your renewal date.`;
      } else if (inquirySubject.includes('cancel') || inquirySubject.includes('subscription')) {
        responseText = `I've processed your subscription cancellation request. Your subscription will remain active until [current billing cycle end date], after which your access will be discontinued. You will receive a final invoice for any pro-rated charges. Before we finalize this, I'd like to offer you a 20% discount for the next 3 months if you'd like to reconsider. If you're firm on canceling, please reply to confirm, and I'll ensure everything is processed smoothly.`;
      } else if (inquirySubject.includes('enterprise') || inquirySubject.includes('plan')) {
        responseText = `Thank you for your interest in our enterprise solutions! I'd be happy to provide you with detailed information about our enterprise plans. For 50 users, we have several options ranging from $25-45 per user per month, depending on the features you need. I've attached our enterprise pricing guide and feature comparison sheet. We also offer custom integration services and dedicated support. Would you be available for a 30-minute demo call this week to discuss your specific requirements?`;
      } else if (inquirySubject.includes('export') || inquirySubject.includes('data')) {
        responseText = `I can definitely help you with data export. We support CSV, JSON, and XML formats for data export. You can export up to 10,000 records at a time through your dashboard under "Account Settings > Data Export." For larger datasets, we can arrange a complete export which typically takes 24-48 hours to prepare. All your data including historical records, custom fields, and metadata will be included. I've sent detailed instructions to your email. Let me know if you need any assistance with the process.`;
      } else if (inquirySubject.includes('training') || inquirySubject.includes('team')) {
        responseText = `We have comprehensive training resources for new users! I've sent you links to our video tutorial series (12 modules, about 3 hours total), quick start guide, and detailed documentation. We also offer live group training sessions every Tuesday at 2 PM EST - I can register your new team members for next week's session. Additionally, each new user receives a personal onboarding email with customized tips based on their role. Would you like me to set up individual accounts for your team members?`;
      } else if (inquirySubject.includes('API') || inquirySubject.includes('documentation')) {
        responseText = `Thank you for your interest in our API! I've sent you access to our comprehensive API documentation portal which includes detailed endpoint references, authentication guides, and error handling examples. We have official SDKs for Node.js, Python, and PHP. Current rate limits are 1000 requests per hour for standard accounts, and we can increase this to 10,000/hour for enterprise accounts. I've also included our developer Discord channel invite where you can get real-time help from our dev team.`;
      } else if (inquirySubject.includes('disappointed') || inquirySubject.includes('service quality')) {
        responseText = `I sincerely apologize for the recent service quality issues you've experienced. As a valued customer of over two years, you deserve much better. I've escalated your account to our senior support team and we're implementing immediate measures to ensure faster response times for your future tickets. Additionally, I'd like to offer you a 25% credit on your next two months of service as an apology for the inconvenience. Can we schedule a call this week to discuss how we can restore your confidence in our service?`;
      } else if (inquirySubject.includes('features') || inquirySubject.includes('delivered')) {
        responseText = `I apologize for the delay in delivering the promised features. You're absolutely right to expect better communication from us. The features you were promised are currently in final testing and will be released in our next major update scheduled for the end of this month. I've added your account to receive priority early access 1 week before the general release. I'm also assigning you a dedicated account manager who will provide you with weekly progress updates on future feature developments.`;
      } else if (inquirySubject.includes('support experience') || inquirySubject.includes('customer support')) {
        responseText = `I am deeply sorry for the poor support experience you received. This is absolutely not the level of service we strive to provide. I've reviewed the call logs and have identified the issues that led to your frustrating experience. I'm personally taking ownership of your case and will ensure it's resolved within 24 hours. I've also scheduled additional training for our support team to prevent similar incidents. As an apology, I'd like to provide you with priority support access for the next 6 months.`;
      } else if (inquirySubject.includes('downtime') || inquirySubject.includes('outage')) {
        responseText = `I sincerely apologize for the unexpected service outage that affected your business operations. You're absolutely right that we should have provided better communication during the incident. We've conducted a thorough post-mortem and have implemented additional monitoring and failover systems to prevent similar issues. As compensation for the business impact, we're providing a full month service credit to your account. I'd also like to set up a direct communication channel for future incidents so you're immediately informed of any service issues.`;
      } else if (inquirySubject.includes('dark mode') || inquirySubject.includes('interface')) {
        responseText = `Thank you for the excellent suggestion! Dark mode is actually already in development and is planned for release in our Q2 update. We've received numerous requests for this feature and completely agree that it would greatly improve the user experience, especially for users who work long hours. I've added your vote to the feature request and will ensure you're notified as soon as it becomes available. In the meantime, you might find our browser extension helpful - it provides a basic dark theme overlay.`;
      } else if (inquirySubject.includes('language') || inquirySubject.includes('multi-language')) {
        responseText = `Multi-language support is definitely on our roadmap! Spanish and French are planned for the next quarter, with German following shortly after. We're working with professional translation services to ensure accuracy, especially for technical terms. In the meantime, we do have a community-contributed browser extension that provides basic translation for the interface. I've added your requirements to our development priority list and will keep you updated on progress. Would you be interested in participating in our beta testing for these language versions?`;
      } else if (inquirySubject.includes('filtering') || inquirySubject.includes('search')) {
        responseText = `Your feedback about search functionality is spot on! Advanced filtering and search capabilities are being developed as part of our upcoming "Smart Search" feature set. This will include custom date ranges, multi-field filters, saved search queries, and even AI-powered search suggestions. The feature is currently in beta testing with select customers. Given your specific needs, I'd love to invite you to join our beta program so you can help us refine these features before the general release. Are you interested?`;
      } else if (inquirySubject.includes('Slack') || inquirySubject.includes('integration')) {
        responseText = `Great suggestion! Slack integration is actually one of our most requested features and I'm excited to tell you that it's currently in final development. The integration will support customizable notifications, channel routing based on event types, and even basic command functionality from within Slack. We're planning to release it in the next 6-8 weeks. I've added you to our early access list so you'll be among the first to try it out. Would you like me to send you a preview of the integration capabilities?`;
      } else {
        // Default response for general inquiries
        responseText = `Thank you for contacting us. I've reviewed your inquiry and our team is working on providing you with a comprehensive response. We appreciate your patience and will get back to you within 24 hours with detailed information to address your questions. If this is urgent, please don't hesitate to call our support line directly.`;
      }
      
      const response = {
        id: faker.string.uuid(),
        response_text: responseText,
        status: faker.helpers.arrayElement(['draft', 'pending_approval', 'approved', 'sent']),
        approval_notes: faker.helpers.maybe(() => 'Response reviewed and approved for sending', { probability: 0.3 }),
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