/**
 * Email campaign registry for /email-marketing and product triggers.
 * Each campaign has: id, name, description, requiredFields, getTemplate(customerData).
 * Brand: QuickTruckTax — professional, friendly, $0 upfront, clear CTA.
 */

import {
  getWelcomeEmailTemplate,
  getCustomerFollowUpEmailTemplate,
  getAbandonEmailTemplate,
  getUcrSeasonalReminderEmailTemplate,
  getUcrDeadlineReminderEmailTemplate,
  getPostDownloadThankYouEmailTemplate,
} from '@/lib/emailTemplates';

export const EMAIL_CAMPAIGNS = [
  {
    id: 'customer_follow_up',
    name: 'Customer follow-up',
    description: 'Friendly check-in after they started a UCR filing. Saved progress, no pressure.',
    requiredFields: ['email'],
    optionalFields: ['legalName', 'registrantName'],
    getTemplate: (data) => getCustomerFollowUpEmailTemplate({
      legalName: data.legalName || '',
      registrantName: data.registrantName || '',
    }),
  },
  {
    id: 'welcome',
    name: 'Welcome to QuickTruckTax',
    description: 'Sent after signup. Dashboard link, what to do next.',
    requiredFields: ['email'],
    optionalFields: ['displayName'],
    getTemplate: (data) => getWelcomeEmailTemplate({
      displayName: data.displayName || data.registrantName || '',
    }),
  },
  {
    id: 'abandon_ucr',
    name: 'UCR filing abandoned',
    description: 'They started UCR but didn’t finish. Continue where they left off.',
    requiredFields: ['email'],
    optionalFields: ['registrantName'],
    getTemplate: (data) => getAbandonEmailTemplate({
      firstName: data.registrantName ? data.registrantName.trim().split(/\s+/)[0] : '',
    }),
  },
  {
    id: 'ucr_seasonal_reminder',
    name: 'UCR seasonal reminder (Oct 1 open)',
    description: 'UCR registration is open — file by Dec 31, $0 upfront. Use Oct–Nov.',
    requiredFields: ['email'],
    optionalFields: ['legalName', 'registrantName'],
    getTemplate: (data) => {
      const first = data.registrantName ? data.registrantName.trim().split(/\s+/)[0] : '';
      return getUcrSeasonalReminderEmailTemplate({
        firstName: data.displayName || first,
        registrantName: data.registrantName || '',
        legalName: data.legalName || '',
      });
    },
  },
  {
    id: 'ucr_deadline_reminder',
    name: 'UCR deadline reminder (Dec urgency)',
    description: 'X days left / last chance before Dec 31. Use in December.',
    requiredFields: ['email'],
    optionalFields: ['legalName', 'registrantName', 'daysLeft'],
    getTemplate: (data) => {
      const first = data.registrantName ? data.registrantName.trim().split(/\s+/)[0] : '';
      return getUcrDeadlineReminderEmailTemplate({
        firstName: data.displayName || first,
        registrantName: data.registrantName || '',
        legalName: data.legalName || '',
        daysLeft: data.daysLeft != null ? Number(data.daysLeft) : 14,
      });
    },
  },
  {
    id: 'post_download_thank_you',
    name: 'Thank you (post payment & download)',
    description: 'After they paid and downloaded UCR certificate. Keeps relationship warm.',
    requiredFields: ['email'],
    optionalFields: ['legalName', 'registrantName'],
    getTemplate: (data) => getPostDownloadThankYouEmailTemplate({
      legalName: data.legalName || '',
      registrantName: data.registrantName || '',
    }),
  },
];

export function getCampaignById(id) {
  return EMAIL_CAMPAIGNS.find((c) => c.id === id) || null;
}

export function getDefaultCampaignId() {
  return 'customer_follow_up';
}
