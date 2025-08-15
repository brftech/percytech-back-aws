# PercyTech Modern - SMS B2B SaaS Platform

## 🚀 **Project Overview**

Modernizing a legacy SMS B2B SaaS platform with a **SMS-first architecture**, multi-brand access, and streamlined onboarding. Built with NestJS, React 19, TypeScript, and MySQL.

## 🎯 **Core Features**

### **SMS-First Authentication**

- Phone number as primary login identifier
- Email as fallback option
- Multi-company access without email uniqueness constraints

### **Multi-Brand Architecture**

- **Platform** → **Company** → **Brand** → **Inbox** hierarchy
- Single company can have multiple TCR-verified brands
- Each brand gets unique TCR Brand ID for regulatory compliance

### **SMS-Driven Onboarding**

- Complete SMS-based purchase and setup flow
- Stripe integration for payments
- TCR API for business verification
- Bandwidth API for phone number assignment
- Web forms as fallback option

## 🏗️ **Technical Architecture**

### **Backend (NestJS + TypeScript)**

- **18 Core Entities**: User, Company, Brand, Inbox, Campaign, gPhone, Message, Conversation, Broadcast, etc.
- **TypeORM** with MySQL for data persistence
- **Modular design** with proper separation of concerns
- **Environment-based configuration** for development/production

### **Frontend (React 19 + TypeScript)**

- **Modern React** with hooks and functional components
- **Tailwind CSS v4** for styling
- **Type-safe API client** for backend communication
- **Responsive design** with mobile-first approach

### **Database Design**

- **Multi-tenant architecture** with proper relationships
- **SMS-focused schema** with clear entity boundaries
- **Regulatory compliance** fields for TCR and Bandwidth integration
- **AI-ready infrastructure** for future enhancements

## 📊 **Entity Structure**

```
Platform (PercyTech, Gnymble, PercyMD, PercyText)
├── Company (Legal business entity)
│   ├── Brand (TCR-verified DBA names)
│   │   ├── Campaign (TCR-approved messaging)
│   │   │   └── gPhone (Assigned phone numbers)
│   │   └── Inbox (SMS management interface)
│   └── User (Multi-company access)
└── Onboarding (SMS-driven setup flow)
```

## 🔧 **Key Entities**

- **User**: Multi-company access with SMS/email login
- **Company**: Legal business entity with TCR verification
- **Brand**: TCR-verified business lines (DBA names)
- **Inbox**: SMS management interface for each brand
- **Campaign**: TCR-approved messaging campaigns
- **gPhone**: Phone number infrastructure
- **Conversation**: Threaded SMS conversations
- **Broadcast**: Mass messaging campaigns
- **OnboardingSession**: SMS-driven setup tracking

## 🚀 **Current Status**

### ✅ **Completed**

- Backend development with all 18 entities
- Database schema design and implementation
- Frontend foundation with React 19
- Docker development environment
- Basic API endpoints and services
- Multi-company user architecture
- SMS-first authentication design

### 🔄 **In Progress**

- Frontend UI components development
- API endpoint implementation
- Database migration strategy

### 📋 **Next Steps**

- Authentication system (JWT + Passport)
- SMS onboarding flow implementation
- Advanced UI components (Conversation, Broadcast, Persons views)
- External API integrations (TCR, Bandwidth, Stripe)
- Row-level security policies
- AI integration planning

## 🛠️ **Development Setup**

### **Prerequisites**

- Node.js 18+
- Docker Desktop
- MySQL 8.0+
- Redis

### **Quick Start**

```bash
# Start development environment
docker compose up -d

# Backend (NestJS)
cd backend-nestjs
npm install
npm run start:dev

# Frontend (React)
cd frontend
npm install
npm run dev
```

### **Environment Variables**

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=percytech
DB_PASS=password
DB_NAME=percytech_modern

# Backend
NODE_ENV=development
PORT=3001
```

## 🎨 **UI/UX Improvements**

### **Legacy System Enhancements**

- **Conversation View**: Replace confusing Person-Inbox dashboard
- **Broadcast View**: Enhanced mass messaging interface
- **Persons View**: Better contact management
- **Superadmin Dashboard**: Overhaul existing management interface

### **Modern Design Principles**

- Mobile-first responsive design
- SMS-centric user experience
- Progressive enhancement for SMS-enabled users
- Clean, intuitive navigation

## 🔒 **Security & Compliance**

- **Multi-tenant data isolation** with row-level security
- **TCR compliance** for business verification
- **Bandwidth integration** for regulatory phone number management
- **Secure authentication** with JWT tokens
- **Role-based access control** per company/brand

## 🚀 **Future Enhancements**

### **AI Integration**

- Replace static "WorkHours" with dynamic AI scheduling
- Smart auto-responses using "Keywords" data
- AI-powered conversation management
- Predictive analytics for SMS campaigns

### **Advanced Features**

- Real-time SMS webhooks
- Advanced filtering and search
- Bulk operations and automation
- Integration with external CRMs

## 📚 **Documentation & Resources**

- **API Documentation**: Built-in Swagger/OpenAPI
- **Database Schema**: Comprehensive entity documentation
- **Development Guide**: Setup and contribution guidelines
- **Legacy System Analysis**: Cross-reference with existing features

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch
3. Follow TypeScript and NestJS best practices
4. Test thoroughly with existing entities
5. Submit pull request with clear description

---

**Built with ❤️ for modern SMS business communication**
