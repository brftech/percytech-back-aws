# 🚀 PercyTech Modern Backend

A modern NestJS backend for the PercyTech multi-brand SMS platform.

## 🏗️ **Architecture**

- **Framework**: NestJS with TypeScript
- **Database**: MySQL with TypeORM
- **Authentication**: JWT + Passport
- **Validation**: Class-validator + Class-transformer
- **Multi-tenancy**: Brand-based user management

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 20+
- MySQL database (running in Docker)
- Environment variables configured

### **Installation**

```bash
npm install
```

### **Environment Setup**

Copy `.env.example` to `.env` and configure:

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=percytech_dev
DB_USER=percytech
DB_PASS=password

# JWT
JWT_SECRET=your-secret-key
```

### **Development**

```bash
# Start in development mode
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

## 📁 **Project Structure**

```
src/
├── auth/           # Authentication & authorization
├── users/          # User management
├── brands/         # Brand management (multi-tenancy)
├── app.module.ts   # Main application module
├── main.ts         # Application entry point
└── ...
```

## 🔐 **API Endpoints**

### **Authentication**

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### **Users**

- `GET /api/users` - List all users (protected)
- `GET /api/users/:id` - Get user by ID (protected)
- `POST /api/users` - Create user (protected)
- `PATCH /api/users/:id` - Update user (protected)
- `DELETE /api/users/:id` - Delete user (protected)

### **Brands**

- `GET /api/brands` - List all brands
- `GET /api/brands/:id` - Get brand by ID
- `GET /api/brands/type/:type` - Get brand by type
- `POST /api/brands/seed` - Seed default brands (protected)

## 🧪 **Testing**

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## 🐳 **Docker Integration**

This backend connects to the MySQL database running in Docker:

- **Host**: localhost
- **Port**: 3306
- **Database**: percytech_dev

## 🔄 **Next Steps**

1. **Database Migration**: Set up proper migrations
2. **SMS Integration**: Connect to AWS SMS services
3. **File Management**: Implement file uploads
4. **Real-time Features**: Add WebSocket support
5. **Advanced Security**: Implement rate limiting, CORS policies
