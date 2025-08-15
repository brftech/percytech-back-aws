// Platform types
export interface Platform {
  id: number;
  type: 'percytech' | 'gnymble' | 'percymd' | 'percytext';
  name: string;
  displayName: string;
  description?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  domain?: string;
  status: 'active' | 'inactive' | 'maintenance';
  isDefault: boolean;
  settings?: Record<string, string | number | boolean>;
  compliance?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

// Company types
export interface Company {
  id: number;
  platformId: number;
  name: string;
  legalName?: string;
  businessType?: string;
  ein?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactPerson?: string;
  cell_phone?: string;
  email?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  tcrVerified: boolean;
  tcrVerificationDate?: string;
  tcrResponse?: Record<string, string | number | boolean>;
  rejectionReason?: string;
  settings?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

// Brand types
export interface Brand {
  id: number;
  companyId: number;
  name: string;
  legalName?: string;
  businessType:
    | 'retail'
    | 'healthcare'
    | 'financial'
    | 'legal'
    | 'real_estate'
    | 'automotive'
    | 'restaurant'
    | 'other';
  ein?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactPerson?: string;
  cell_phone?: string;
  email?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  tcrVerified: boolean;
  tcrBrandId?: string;
  tcrVerificationDate?: string;
  tcrResponse?: Record<string, string | number | boolean>;
  rejectionReason?: string;
  settings?: Record<string, string | number | boolean>;
  compliance?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

// Inbox types
export interface Inbox {
  id: number;
  companyId: number;
  campaignId: number;
  name: string;
  timeZone?: string;
  areaCode?: string;
  expirationDate?: string;
  doneResetTime?: string;
  isEnabledDeferredMessaging: boolean;
  enableDoneResetTime: boolean;
  hideBroadcastButton: boolean;
  hideEpisodes: boolean;
  customDetailsLimit: number;
  status:
    | 'setup'
    | 'testing'
    | 'pending_approval'
    | 'active'
    | 'inactive'
    | 'suspended';
  defaultPhoneId?: number;
  temporaryCampaignId?: number;
  isUsingTemporaryCampaign: boolean;
  campaignApprovalDeadline?: string;
  setupCompletedAt?: string;
  settings?: Record<string, string | number | boolean>;
  compliance?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

// User types
export interface User {
  id: number;
  username: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  passwordHash?: string;
  preferredLoginMethod: 'sms' | 'email';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Person types
export interface Person {
  id: number;
  inboxId: number;
  cell_phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  type: 'customer' | 'lead' | 'partner' | 'employee' | 'other';
  status: 'active' | 'inactive' | 'blocked' | 'spam';
  company?: string;
  title?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  birthDate?: string;
  language?: string;
  timeZone?: string;
  optIn: boolean;
  optInDate?: string;
  optOutDate?: string;
  lastContactAt?: string;
  messageCount: number;
  inboundMessageCount: number;
  outboundMessageCount: number;
  customFields?: Record<string, string | number | boolean>;
  tags?: string[];
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

// Campaign types
export interface Campaign {
  id: number;
  brandId: number;
  name: string;
  description?: string;
  useCase: 'marketing' | 'transactional' | 'two_factor' | 'account_notification' | 'customer_service' | 'delivery_notification' | 'appointment_reminder' | 'other';
  messageContent?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'active' | 'paused' | 'expired';
  tcrStatus: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'under_review';
  bandwidthStatus: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'under_review';
  tcrBrandId?: string;
  tcrCampaignId?: string;
  tcrResponse?: Record<string, string | number | boolean>;
  bandwidthResponse?: Record<string, string | number | boolean>;
  tcrSubmittedAt?: string;
  tcrApprovedAt?: string;
  bandwidthApprovedAt?: string;
  expiresAt?: string;
  settings?: Record<string, string | number | boolean>;
  compliance?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

// gPhone types
export interface GPhone {
  id: number;
  inboxId: number;
  phoneNumber: string;
  type: 'local' | 'toll_free' | 'short_code' | 'international';
  status: 'available' | 'assigned' | 'in_use' | 'suspended' | 'expired';
  isAssigned: boolean;
  isDefault: boolean;
  areaCode?: string;
  city?: string;
  state?: string;
  country?: string;
  bandwidthData?: Record<string, string | number | boolean>;
  assignedAt?: string | null;
  lastUsedAt?: string | null;
  settings?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

// Message types
export interface Message {
  id: number;
  personId: number;
  gPhoneId?: number;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  type: 'sms' | 'mms' | 'voice';
  fromNumber: string;
  toNumber: string;
  messageId?: string;
  metadata?: Record<string, string | number | boolean>;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  deliveryReport?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

// Conversation types
export interface Conversation {
  id: number;
  personId: number;
  inboxId: number;
  title?: string;
  status: 'active' | 'archived' | 'closed';
  messageCount: number;
  unreadCount: number;
  lastMessageAt?: string;
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

// Broadcast types
export interface Broadcast {
  id: number;
  inboxId: number;
  campaignId?: number;
  name: string;
  message: string;
  type: 'immediate' | 'scheduled' | 'recurring';
  status:
    | 'draft'
    | 'scheduled'
    | 'sending'
    | 'completed'
    | 'failed'
    | 'cancelled';
  scheduledAt?: string;
  sentAt?: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  filters?: Record<string, string | number | boolean>;
  settings?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

// Onboarding types
export interface OnboardingSession {
  id: number;
  sessionId: string;
  phoneNumber: string;
  email?: string;
  brandType: 'percytech' | 'gnymble' | 'percymd' | 'percytext';
  domain: string;
  status:
    | 'purchased'
    | 'verifying_business'
    | 'campaign_approval'
    | 'phone_assignment'
    | 'account_setup'
    | 'completed'
    | 'failed';
  currentStep?: string;
  stripePaymentIntentId?: string;
  purchaseAmount?: number;
  businessVerificationData?: Record<string, string | number | boolean>;
  campaignData?: Record<string, string | number | boolean>;
  assignedPhoneNumber?: string;
  errorDetails?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface OnboardingStep {
  id: number;
  onboardingSessionId: number;
  stepName: string;
  stepOrder: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  apiResponse?: Record<string, string | number | boolean>;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface BusinessVerification {
  id: number;
  onboardingSessionId: number;
  businessName: string;
  ein?: string;
  businessType: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'under_review';
  tcrBrandId?: string;
  tcrResponse?: Record<string, string | number | boolean>;
  rejectionReason?: string;
  submittedAt?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignSubmission {
  id: number;
  onboardingSessionId: number;
  campaignName: string;
  description: string;
  useCase:
    | 'marketing'
    | 'transactional'
    | 'two_factor'
    | 'account_notification'
    | 'customer_service'
    | 'delivery_notification'
    | 'appointment_reminder'
    | 'other';
  messageContent: string;
  sampleMessages?: string;
  status:
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'approved'
    | 'rejected'
    | 'requires_changes';
  tcrCampaignId?: string;
  tcrResponse?: Record<string, string | number | boolean>;
  rejectionReason?: string;
  requiredChanges?: Record<string, string | number | boolean>;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}
