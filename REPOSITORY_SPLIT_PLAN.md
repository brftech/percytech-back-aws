# Repository Split Plan: percytech-back-aws vs percytech-back-supabase

## Overview

Split the current monorepo into two focused repositories to reduce complexity and improve maintainability.

## Repository Structure

### percytech-back-aws (Core Texting Platform)

```
percytech-back-aws/
├── src/
│   ├── messages/
│   ├── conversations/
│   ├── inboxes/
│   ├── g-phones/
│   ├── broadcasts/
│   ├── auth/
│   │   ├── supabase-auth.guard.ts
│   │   └── user-mapping.service.ts
│   └── main.ts
├── docker/
│   ├── mysql/
│   ├── redis/
│   └── docker-compose.yml
├── package.json
├── env.development
└── README.md
```

### percytech-back-supabase (Admin & Onboarding)

```
percytech-back-supabase/
├── src/
│   ├── auth/
│   ├── onboarding/
│   ├── payments/
│   ├── leads/
│   ├── admin/
│   ├── tcr/
│   └── main.ts
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── config.toml
├── database/
│   ├── src/
│   ├── package.json
│   └── README.md
├── package.json
├── env.development
└── README.md
```

## Migration Steps

### Phase 1: Repository Creation

1. Create `percytech-back-supabase` repository
2. Move `backend-supabase/` → `percytech-back-supabase/src/`
3. Move `supabase/` → `percytech-back-supabase/supabase/`
4. Move `database/` → `percytech-back-supabase/database/`

### Phase 2: AWS Repository Cleanup

1. Move `backend-nestjs/` → `percytech-back-aws/src/`
2. Move `docker/` → `percytech-back-aws/docker/`
3. Remove Supabase-related dependencies
4. Update environment configuration

### Phase 3: Integration Setup

1. Implement cross-service authentication
2. Set up API gateway
3. Configure monitoring and logging
4. Create deployment pipelines

## Benefits

### Reduced Complexity

- No more conflicting dependencies
- Clear separation of concerns
- Independent development cycles
- Simplified deployment

### Better Maintainability

- Focused codebases
- Easier testing
- Clearer documentation
- Independent versioning

### Improved Scalability

- Independent scaling
- Different tech stacks
- Separate monitoring
- Easier debugging

## Integration Points

### Authentication

- Supabase handles all auth
- AWS validates Supabase JWT tokens
- Shared user mapping

### Data Flow

- Supabase → AWS: User creation/updates
- AWS → Supabase: Usage metrics
- Shared events via webhooks

### API Design

- Supabase: `/api/v1/admin/*`
- AWS: `/api/v1/core/*`
- Gateway: `/api/v1/*` (routes appropriately)
