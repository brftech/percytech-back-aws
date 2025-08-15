# SMS B2B SaaS Platform API Documentation

## Overview

This is a comprehensive NestJS backend for an SMS B2B SaaS platform that manages brands, campaigns, inboxes, and Google Voice phone numbers. The platform supports TCR (The Campaign Registry) and Bandwidth approval workflows for SMS compliance.

## Entity Relationships

- **Campaign** → **Brand** (not Inbox)
- **Inbox** → **Campaign** (not Brand)
- **gPhone** → **Inbox** (not Campaign)

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, the API does not require authentication for testing purposes. In production, you should implement JWT authentication.

## API Endpoints

### Companies

#### Get All Companies

```http
GET /companies
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `name` (string): Filter by company name
- `status` (string): Filter by status

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Example Corp",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### Get Company by ID

```http
GET /companies/:id
```

#### Create Company

```http
POST /companies
```

**Request Body:**

```json
{
  "name": "New Company",
  "status": "active"
}
```

#### Update Company

```http
PATCH /companies/:id
```

#### Delete Company

```http
DELETE /companies/:id
```

### Brands

#### Get All Brands

```http
GET /brands
```

**Query Parameters:**

- `companyId` (number): Filter by company ID
- `status` (string): Filter by status
- `page` (number): Page number
- `limit` (number): Items per page

#### Get Brand by ID

```http
GET /brands/:id
```

#### Get Brand with Campaigns

```http
GET /brands/:id/campaigns
```

#### Create Brand

```http
POST /brands
```

**Request Body:**

```json
{
  "companyId": 1,
  "name": "Brand Name",
  "legalName": "Legal Brand Name",
  "businessType": "retail",
  "ein": "12-3456789",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "contactPerson": "John Doe",
  "cell_phone": "+1234567890",
  "email": "john@brand.com"
}
```

#### Update Brand

```http
PATCH /brands/:id
```

#### Delete Brand

```http
DELETE /brands/:id
```

#### Verify TCR

```http
POST /brands/:id/verify-tcr
```

#### Activate Brand

```http
POST /brands/:id/activate
```

#### Suspend Brand

```http
POST /brands/:id/suspend
```

### Campaigns

#### Get All Campaigns

```http
GET /campaigns
```

**Query Parameters:**

- `brandId` (number): Filter by brand ID
- `status` (string): Filter by status
- `useCase` (string): Filter by use case
- `page` (number): Page number
- `limit` (number): Items per page

#### Get Campaign by ID

```http
GET /campaigns/:id
```

#### Get Campaign with Inboxes

```http
GET /campaigns/:id/inboxes
```

#### Create Campaign

```http
POST /campaigns
```

**Request Body:**

```json
{
  "brandId": 1,
  "name": "Marketing Campaign",
  "description": "Promotional SMS campaign",
  "useCase": "marketing",
  "messageContent": "Get 20% off your next purchase!",
  "status": "draft"
}
```

#### Update Campaign

```http
PATCH /campaigns/:id
```

#### Delete Campaign

```http
DELETE /campaigns/:id
```

#### Submit TCR

```http
POST /campaigns/:id/submit-tcr
```

#### Submit Bandwidth

```http
POST /campaigns/:id/submit-bandwidth
```

#### Activate Campaign

```http
POST /campaigns/:id/activate
```

#### Pause Campaign

```http
POST /campaigns/:id/pause
```

#### Expire Campaign

```http
POST /campaigns/:id/expire
```

#### Get Campaigns by Brand

```http
GET /campaigns/brand/:brandId
```

#### Get Active Campaigns by Brand

```http
GET /campaigns/brand/:brandId/active
```

#### Get Approval Stats

```http
GET /campaigns/stats/approval-status
```

#### Get Regulated Use Cases

```http
GET /campaigns/use-cases/regulated
```

#### Get Expiring Soon

```http
GET /campaigns/expiring-soon
```

### Inboxes

#### Get All Inboxes

```http
GET /inboxes
```

**Query Parameters:**

- `companyId` (number): Filter by company ID
- `campaignId` (number): Filter by campaign ID
- `status` (string): Filter by status
- `page` (number): Page number
- `limit` (number): Items per page

#### Get Inbox by ID

```http
GET /inboxes/:id
```

#### Get Inbox with GPhones

```http
GET /inboxes/:id/g-phones
```

#### Create Inbox

```http
POST /inboxes
```

**Request Body:**

```json
{
  "companyId": 1,
  "campaignId": 1,
  "name": "Customer Support Inbox",
  "timeZone": "America/New_York",
  "areaCode": "212",
  "status": "setup"
}
```

#### Update Inbox

```http
PATCH /inboxes/:id
```

#### Delete Inbox

```http
DELETE /inboxes/:id
```

#### Complete Setup

```http
POST /inboxes/:id/complete-setup
```

#### Start Testing

```http
POST /inboxes/:id/start-testing
```

#### Activate Inbox

```http
POST /inboxes/:id/activate
```

#### Deactivate Inbox

```http
POST /inboxes/:id/deactivate
```

#### Assign Temporary Campaign

```http
POST /inboxes/:id/assign-temporary-campaign
```

**Request Body:**

```json
{
  "campaignId": 1,
  "deadline": "2024-12-31T23:59:59.000Z"
}
```

#### Remove Temporary Campaign

```http
POST /inboxes/:id/remove-temporary-campaign
```

#### Get Inboxes by Company

```http
GET /inboxes/company/:companyId
```

#### Get Active Inboxes by Company

```http
GET /inboxes/company/:companyId/active
```

#### Get Inboxes by Campaign

```http
GET /inboxes/campaign/:campaignId
```

#### Get Onboarding Stats

```http
GET /inboxes/stats/onboarding
```

#### Get Onboarding in Progress

```http
GET /inboxes/onboarding/in-progress
```

#### Get Campaign Approval Overdue

```http
GET /inboxes/campaign-approval/overdue
```

### GPhones (Google Voice Phone Numbers)

#### Get All GPhones

```http
GET /g-phones
```

**Query Parameters:**

- `inboxId` (number): Filter by inbox ID
- `status` (string): Filter by status
- `type` (string): Filter by type
- `page` (number): Page number
- `limit` (number): Items per page

#### Get GPhone by ID

```http
GET /g-phones/:id
```

#### Create GPhone

```http
POST /g-phones
```

**Request Body:**

```json
{
  "inboxId": 1,
  "phoneNumber": "+1234567890",
  "type": "local",
  "status": "available",
  "areaCode": "123",
  "city": "New York",
  "state": "NY",
  "country": "USA"
}
```

#### Update GPhone

```http
PATCH /g-phones/:id
```

#### Delete GPhone

```http
DELETE /g-phones/:id
```

#### Assign to Inbox

```http
POST /g-phones/:id/assign
```

**Request Body:**

```json
{
  "inboxId": 1
}
```

#### Unassign from Inbox

```http
POST /g-phones/:id/unassign
```

#### Mark In Use

```http
POST /g-phones/:id/mark-in-use
```

#### Mark Available

```http
POST /g-phones/:id/mark-available
```

#### Set as Default

```http
POST /g-phones/:id/set-default
```

#### Remove as Default

```http
POST /g-phones/:id/remove-default
```

#### Get GPhones by Inbox

```http
GET /g-phones/inbox/:inboxId
```

#### Get Available GPhones by Inbox

```http
GET /g-phones/inbox/:inboxId/available
```

#### Get Default GPhone by Inbox

```http
GET /g-phones/inbox/:inboxId/default
```

#### Get Status Stats

```http
GET /g-phones/stats/status
```

#### Get Type Stats

```http
GET /g-phones/stats/type
```

#### Search by Number

```http
GET /g-phones/search/number?phoneNumber=1234567890
```

#### Search by Area Code

```http
GET /g-phones/search/area-code?areaCode=123
```

#### Get Recently Used

```http
GET /g-phones/recently-used
```

#### Get Stale GPhones

```http
GET /g-phones/stale
```

## Status Enums

### Brand Status

- `active`
- `inactive`
- `suspended`
- `pending`

### Brand Type

- `retail`
- `healthcare`
- `financial`
- `legal`
- `real_estate`
- `automotive`
- `restaurant`
- `other`

### Campaign Status

- `draft`
- `pending_approval`
- `approved`
- `rejected`
- `active`
- `paused`
- `expired`

### Campaign Use Case

- `marketing`
- `transactional`
- `two_factor`
- `account_notification`
- `customer_service`
- `delivery_notification`
- `appointment_reminder`
- `other`

### Approval Status

- `pending`
- `approved`
- `rejected`
- `under_review`

### Inbox Status

- `setup`
- `testing`
- `pending_approval`
- `active`
- `inactive`
- `suspended`

### GPhone Status

- `available`
- `assigned`
- `in_use`
- `suspended`
- `expired`

### GPhone Type

- `local`
- `toll_free`
- `short_code`
- `international`

## Testing the API

1. Start the development server:

```bash
npm run start:dev
```

2. Run the test script:

```bash
node test-api.js
```

3. Or use curl to test individual endpoints:

```bash
# Test companies
curl http://localhost:3000/companies

# Test brands
curl http://localhost:3000/brands

# Test campaigns
curl http://localhost:3000/campaigns

# Test inboxes
curl http://localhost:3000/inboxes

# Test gPhones
curl http://localhost:3000/g-phones
```

## Database Setup

The application uses MySQL with the following default configuration:

- Host: localhost
- Port: 3306
- Username: percytech
- Password: password
- Database: percytech_modern

Make sure your MySQL database is running and accessible with these credentials, or update the environment variables accordingly.

## Environment Variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=percytech
DB_PASS=password
DB_NAME=percytech_modern
NODE_ENV=development
```

## Business Logic

### TCR (The Campaign Registry) Workflow

1. Brands must be verified with TCR before campaigns can be approved
2. Regulated use cases (healthcare, financial, legal) require TCR approval
3. Marketing campaigns also require TCR approval

### Bandwidth Workflow

1. All campaigns require Bandwidth approval
2. Campaigns must be approved by both TCR and Bandwidth to be active

### Inbox Onboarding

1. Setup → Testing → Pending Approval → Active
2. Temporary campaigns can be assigned during testing
3. Campaign approval deadlines are enforced

### GPhone Management

1. Phones can be assigned to inboxes
2. Only one phone per inbox can be set as default
3. Phone status tracks availability and usage
