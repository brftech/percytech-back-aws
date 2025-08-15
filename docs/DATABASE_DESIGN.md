# 🗄️ **PercyTech Modern Database Design**

## 🎯 **Core Design Principles**

1. **SMS-First, Not SMS-Only**: Strongly encourage SMS while allowing email
2. **Multi-Brand Access**: Users can access multiple brands/accounts
3. **Flexible Authentication**: Users choose login method (SMS or email)
4. **Progressive Enhancement**: SMS unlocks additional platform features
5. **Backward Compatibility**: Preserve existing SMS functionality

## 🏗️ **Database Schema Overview**

```
User (Global Identity)
├── UserPhones (Phone numbers for authentication)
├── UserCompanies (Multi-company access permissions)
│   └── UserCompanyRoles (Role per company)
└── UserSessions (Active sessions across companies)

Platform (PercyTech, Gnymble, PercyMD, PercyText)
├── PlatformSettings (Compliance, branding, etc.)
└── PlatformCompanies (Companies using this platform)

Company (User Business - Anstead Cigars, etc.)
├── CompanyUsers (Users with access to this company)
├── CompanyPlatform (Which platform they're using)
├── Brands (DBA names - "Anstead Cigars", "Anstead Marine")
    ├── BrandUsers (User permissions per brand)
    ├── Campaigns (Marketing, 2FA, etc.)
        └── PhoneNumbers (One campaign per phone)
    ├── Inboxes (Phone numbers for SMS)
    │   ├── InboxUsers (User permissions per inbox)
    │   └── InboxSettings (Configuration)
    ├── Persons (Contacts/Customers)
    │   ├── PersonDetails (Custom fields)
    │   ├── PersonNotes (Notes)
    │   └── PersonFiles (Attachments)
    └── Messages (SMS/MMS communications)
        ├── GroupMessages (Broadcasts)
        └── MessageTemplates
```

## 📱 **Core Entities**

### **1. User (Global Identity)**

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE, -- Unique username for login
  email VARCHAR(255), -- Optional, for email-based login
  phone_number VARCHAR(20), -- Optional, for SMS-based login
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  password_hash VARCHAR(255), -- For email-based login
  preferred_login_method ENUM('sms', 'email') DEFAULT 'sms',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_email (email),
  UNIQUE KEY unique_phone (phone_number)
);
```

**Key Changes:**

- **Unique user ID** as primary identifier (not tied to login method)
- **Flexible login**: Email OR phone number (both optional)
- **Preferred method tracking** to encourage SMS usage
- **Global user identity** across all brands

### **2. UserPhone (Phone Number Management)**

```sql
CREATE TABLE user_phones (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_code VARCHAR(6),
  verification_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_user_phone (user_id, phone_number)
);
```

**Purpose:**

- **Multiple phone numbers per user** (work, personal, etc.)
- **SMS verification** for authentication and 2FA
- **Primary phone** for brand access and SMS features
- **Backup phone numbers** for account recovery

### **3. Platform (PercyTech, Gnymble, PercyMD, PercyText)**

```sql
CREATE TABLE platforms (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  type ENUM('percytech', 'gnymble', 'percymd', 'percytext') NOT NULL,
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  domain VARCHAR(255),
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  is_default BOOLEAN DEFAULT FALSE,
  settings JSON, -- Platform-specific configuration
  compliance JSON, -- HIPAA, FDA, GDPR settings
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Key Changes:**

- **Platform types** for multi-platform branding
- **Compliance settings** per platform
- **Customizable appearance** and configuration

### **4. Company (User Business - Anstead Cigars, etc.)**

```sql
CREATE TABLE companies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  platform_id BIGINT NOT NULL, -- Which platform they're using
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  business_type VARCHAR(100),
  ein VARCHAR(20),
  address JSON, -- Business address
  contact_person JSON, -- Primary contact
  status ENUM('active', 'inactive', 'suspended', 'pending_approval') DEFAULT 'pending_approval',
  tcr_verified BOOLEAN DEFAULT FALSE,
  tcr_verification_date TIMESTAMP NULL,
  settings JSON, -- Company-specific configuration
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (platform_id) REFERENCES platforms(id)
);
```

**Key Changes:**

- **Belongs to a platform** (PercyTech, Gnymble, etc.)
- **Business verification** through TCR
- **Company-specific settings** and configuration

### **5. Brand (DBA Names - Anstead Cigars, Anstead Marine)**

```sql
CREATE TABLE brands (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NOT NULL, -- Which company owns this brand
  name VARCHAR(255) NOT NULL, -- DBA name (e.g., "Anstead Cigars")
  legal_name VARCHAR(255), -- Full legal name if different
  description TEXT,
  logo_url VARCHAR(500),
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  status ENUM('active', 'inactive', 'suspended', 'pending_approval') DEFAULT 'pending_approval',
  tcr_verified BOOLEAN DEFAULT FALSE,
  tcr_verification_date TIMESTAMP NULL,
  settings JSON, -- Brand-specific configuration
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

**Key Changes:**

- **Belongs to a company** (not platform)
- **DBA name management** for different business lines
- **Brand-specific TCR verification**
- **Brand-specific settings** and appearance

### **6. Campaign (Marketing, 2FA, etc.)**

```sql
CREATE TABLE campaigns (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  brand_id BIGINT NOT NULL, -- Which brand this campaign belongs to
  name VARCHAR(255) NOT NULL, -- Campaign name
  description TEXT,
  use_case ENUM('marketing', '2fa', 'appointment_reminders', 'customer_service', 'alerts', 'surveys', 'other') NOT NULL,
  message_content TEXT, -- Sample message content
  tcr_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  bandwidth_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  tcr_response JSON, -- Full TCR API response
  bandwidth_response JSON, -- Full Bandwidth API response
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'inactive',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id) REFERENCES brands(id)
);
```

**Key Changes:**

- **Belongs to a brand** (not company)
- **Campaign approval** through TCR + Bandwidth
- **Use case classification** for compliance
- **Status tracking** for approval workflow

### **7. PhoneNumber (One Campaign per Phone)**

```sql
CREATE TABLE phone_numbers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  campaign_id BIGINT NOT NULL, -- Which campaign this phone is assigned to
  phone_number VARCHAR(20) NOT NULL UNIQUE, -- The actual phone number
  area_code VARCHAR(3),
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  expiration_date DATE,
  is_enabled BOOLEAN DEFAULT TRUE,
  is_deferred_messaging_enabled BOOLEAN DEFAULT FALSE,
  done_reset_time TIME DEFAULT '00:00',
  custom_details_limit INT DEFAULT 10,
  settings JSON, -- Phone-specific configuration
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);
```

**Key Changes:**

- **Belongs to a campaign** (not brand or company)
- **One campaign per phone** (enforced by foreign key)
- **Phone-specific settings** and configuration
- **Global phone number uniqueness**

### **8. UserCompany (Multi-Company Access)**

```sql
CREATE TABLE user_companies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  company_id BIGINT NOT NULL,
  role ENUM('owner', 'admin', 'manager', 'user', 'viewer') DEFAULT 'user',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_access_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  UNIQUE KEY unique_user_company (user_id, company_id)
);
```

**Purpose:**

- **Users can access multiple companies**
- **Different roles per company**
- **Track access patterns**

### **9. Inbox (SMS Phone Number)**

```sql
CREATE TABLE inboxes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  brand_id BIGINT NOT NULL, -- Which brand this inbox belongs to
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  area_code VARCHAR(3),
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  expiration_date DATE,
  is_enabled BOOLEAN DEFAULT TRUE,
  is_deferred_messaging_enabled BOOLEAN DEFAULT FALSE,
  done_reset_time TIME DEFAULT '00:00',
  custom_details_limit INT DEFAULT 10,
  settings JSON, -- Inbox-specific configuration
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id) REFERENCES brands(id),
  UNIQUE KEY unique_phone (phone_number)
);
```

**Key Changes:**

- **Belongs to brand** (not company)
- **Phone number uniqueness** across all brands
- **Brand-specific settings**

### **6. InboxUser (User Permissions per Inbox)**

```sql
CREATE TABLE inbox_users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  inbox_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  role ENUM('owner', 'admin', 'manager', 'user', 'viewer') DEFAULT 'user',
  permissions JSON, -- Specific permissions
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inbox_id) REFERENCES inboxes(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_inbox_user (inbox_id, user_id)
);
```

**Purpose:**

- **Granular permissions** per inbox
- **User access control** at inbox level
- **Flexible role system**

### **10. Person (Contact/Customer)**

```sql
CREATE TABLE persons (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  brand_id BIGINT NOT NULL, -- Which brand this person belongs to
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  type VARCHAR(50), -- customer, prospect, etc.
  language VARCHAR(10) DEFAULT 'en',
  is_spam BOOLEAN DEFAULT FALSE,
  validation_status ENUM('pending', 'verified', 'invalid') DEFAULT 'pending',
  external_id VARCHAR(255),
  metadata JSON, -- Flexible additional data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id) REFERENCES brands(id),
  UNIQUE KEY unique_brand_person (brand_id, phone_number)
);
```

**Key Changes:**

- **Belongs to brand** (not company)
- **Phone number uniqueness** within brand
- **Flexible metadata** for custom fields

### **11. Message (SMS/MMS)**

```sql
CREATE TABLE messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  inbox_id BIGINT NOT NULL,
  person_id BIGINT NOT NULL,
  user_id BIGINT, -- NULL for incoming messages
  body TEXT NOT NULL,
  direction ENUM('inbound', 'outbound') NOT NULL,
  status ENUM('pending', 'sent', 'delivered', 'failed', 'received') NOT NULL,
  message_type ENUM('sms', 'mms') DEFAULT 'sms',
  segment_count INT DEFAULT 1,
  gateway_message_id VARCHAR(255),
  is_system BOOLEAN DEFAULT FALSE,
  metadata JSON, -- Additional message data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inbox_id) REFERENCES inboxes(id),
  FOREIGN KEY (person_id) REFERENCES persons(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Key Changes:**

- **Simplified structure** (removed complex relationships)
- **JSON metadata** for flexibility
- **Brand isolation** through inbox relationship

## 🔐 **Authentication & Security**

### **Flexible Authentication Flow**

1. **User chooses login method** (SMS or email)
2. **SMS Login**: User enters phone number → receives verification code
3. **Email Login**: User enters email + password
4. **System creates session** with access to user's brands
5. **SMS users get enhanced features** (SMS notifications, quick access)

### **Multi-Brand Access**

1. **User authenticates** with phone number
2. **System shows available brands** from user_brands table
3. **User selects brand** to access
4. **System switches context** to selected brand

### **Security Features**

- **Flexible authentication** (SMS or email)
- **Phone number verification** for SMS users
- **Session management** across brands
- **Role-based access control** per brand
- **Audit logging** for compliance

### **Progressive Enhancement for SMS Users**

- **SMS notifications** for important events
- **Quick access** to frequently used features
- **SMS-based 2FA** for enhanced security
- **Mobile-optimized** interface and workflows
- **SMS templates** and quick responses

## 🔄 **Migration Strategy**

### **Phase 1: Setup New Schema**

1. Create new tables alongside existing ones
2. Set up data mapping between old and new

### **Phase 2: Data Migration**

1. Migrate users to new system
2. Map existing accounts to brands
3. Preserve all existing data

### **Phase 3: Switchover**

1. Update application to use new schema
2. Test thoroughly
3. Decommission old tables

## 💡 **Benefits of This Design**

1. **Multi-Brand Access**: Users can work across multiple brands
2. **SMS-First, Not SMS-Only**: Encourages SMS while maintaining flexibility
3. **Flexible Authentication**: Users choose their preferred login method
4. **Progressive Enhancement**: SMS users unlock additional platform features
5. **Scalable**: Easy to add new brands and features
6. **Compliant**: Built-in compliance and audit features
7. **User Choice**: Respects user preferences while encouraging SMS adoption

## 🚀 **Next Steps**

1. **Create database migration scripts**
2. **Update entity definitions** in backend
3. **Implement SMS authentication service**
4. **Build multi-brand access control**
5. **Implement SMS-first onboarding system**
6. **Test with sample data**

This design solves your core problems while maintaining all existing functionality and adding the new multi-brand, SMS-first capabilities you need.

## 🆕 **Onboarding System Entities**

### **9. OnboardingSession (Purchase to Account Setup)**

```sql
CREATE TABLE onboarding_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id VARCHAR(255) UNIQUE, -- Unique identifier for SMS tracking
  phone_number VARCHAR(20) NOT NULL, -- Customer's phone number
  email VARCHAR(255), -- Optional, for web fallback
  platform_type ENUM('percytech', 'gnymble', 'percymd', 'percytext') NOT NULL, -- Which platform they want
  domain VARCHAR(255), -- Which domain they came from
  status ENUM('purchased', 'verifying_business', 'campaign_approval', 'phone_assignment', 'account_setup', 'completed', 'failed') DEFAULT 'purchased',
  current_step VARCHAR(100), -- Current onboarding step
  stripe_payment_intent_id VARCHAR(255), -- Stripe payment reference
  purchase_amount DECIMAL(10,2),
  business_verification_data JSON, -- TCR verification data
  campaign_data JSON, -- Campaign submission data
  assigned_phone_number VARCHAR(20), -- Final assigned number
  error_details TEXT, -- Any failure reasons
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL
);
```

### **10. OnboardingStep (Step-by-Step Progress)**

```sql
CREATE TABLE onboarding_steps (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  onboarding_session_id BIGINT NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  step_order INT NOT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending',
  api_response JSON, -- API response data
  error_message TEXT,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (onboarding_session_id) REFERENCES onboarding_sessions(id)
);
```

### **11. BusinessVerification (TCR API Integration)**

```sql
CREATE TABLE business_verifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  onboarding_session_id BIGINT NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100),
  ein VARCHAR(20),
  address JSON, -- Business address
  contact_person JSON, -- Contact information
  tcr_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  tcr_response JSON, -- Full TCR API response
  verification_date TIMESTAMP NULL,
  FOREIGN KEY (onboarding_session_id) REFERENCES onboarding_sessions(id)
);
```

### **12. CampaignSubmission (TCR + Bandwidth)**

```sql
CREATE TABLE campaign_submissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  onboarding_session_id BIGINT NOT NULL,
  campaign_name VARCHAR(255) NOT NULL,
  campaign_description TEXT,
  use_case VARCHAR(100), -- Marketing, 2FA, etc.
  message_content TEXT, -- Sample message content
  tcr_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  bandwidth_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  tcr_response JSON,
  bandwidth_response JSON,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  FOREIGN KEY (onboarding_session_id) REFERENCES onboarding_sessions(id)
);
```

## 🔄 **SMS Onboarding Flow**

### **Step 1: Purchase & Initial Contact**

- Customer texts "BUY" to platform number (PercyTech, Gnymble, etc.)
- System responds with payment options
- Stripe payment processed via SMS
- Onboarding session created

### **Step 2: Business Verification (TCR)**

- System texts: "What's your business name?"
- Customer responds with business details (e.g., "Anstead Cigars")
- System validates via TCR API for platform compliance
- Progress updates sent via SMS

### **Step 3: Campaign Approval**

- System texts: "Describe your texting campaign"
- Customer provides use case and sample content
- System submits to TCR + Bandwidth for platform approval
- Approval status sent via SMS

### **Step 4: Phone Number Assignment**

- System texts: "Your campaign is approved! Assigning phone number..."
- Bandwidth API assigns local number
- Campaign linked to number
- Confirmation sent via SMS

### **Step 5: Account Setup**

- System texts: "Setting up your [Platform] company account..."
- Company account created and linked to platform
- Login credentials sent via SMS
- Welcome message with next steps

## 💡 **Key Benefits**

1. **Proves SMS Capability**: Complex business process via SMS
2. **Seamless Experience**: No context switching between platforms
3. **Mobile-First**: Perfect for mobile users
4. **API Integration**: Real-time TCR and Bandwidth updates
5. **Fallback Options**: Web forms for those who prefer it
6. **Platform Consistency**: Each platform has its own onboarding flow

This onboarding system becomes a **showcase** of what SMS can do - not just for texting, but for complex business processes. It's a perfect demonstration of your SMS-first philosophy!
