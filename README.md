# PercyTech Backend AWS - Core Texting Platform

## Overview

Core texting platform built with NestJS, MySQL, and AWS infrastructure. Handles messaging, conversations, phone management, and core texting services.

## Architecture

- **Framework**: NestJS
- **Database**: MySQL (via TypeORM)
- **Infrastructure**: AWS
- **Authentication**: Validates Supabase JWT tokens
- **Services**: Messages, conversations, inboxes, g-phones, broadcasts

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- MySQL 8.0

### Installation

```bash
cd backend-nestjs
npm install
```

### Environment Setup

```bash
cp env.development.example .env
# Update environment variables
```

### Database Setup

```bash
docker-compose up -d db redis
```

### Development

```bash
npm run start:dev
```

## API Endpoints

- `/api/v1/messages` - Message management
- `/api/v1/conversations` - Conversation handling
- `/api/v1/inboxes` - Inbox management
- `/api/v1/g-phones` - Phone number management
- `/api/v1/broadcasts` - Broadcast messaging

## Integration

This service integrates with `percytech-back-supa` for:

- User authentication (validates Supabase JWT tokens)
- User mapping (links Supabase users to local users)
- Cross-service communication

## Development

- **Port**: 3000 (configurable)
- **Database**: MySQL on port 3306
- **Redis**: Port 6379
- **Adminer**: Port 8083 (database admin)

## Deployment

- **Production**: AWS ECS/Fargate
- **Database**: AWS RDS MySQL
- **Cache**: AWS ElastiCache Redis
