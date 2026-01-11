# replit.md - Premium Agency/Event Chat Platform

## Overview

This is a premium agency and event chat platform built as a full-stack TypeScript application. The platform provides text-based chat functionality, event management, user role hierarchy (USER/VIP/MOD/ADMIN), and a ticketing system. It follows a dark theme with gold accents designed for a Turkish agency/entertainment context.

The application features:
- User authentication with session management
- Role-based access control with visual hierarchy
- Event/PK (live event) management system
- Group chat functionality with real-time polling
- Support ticket system
- Admin dashboard with statistics

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React Context for auth state
- **Styling**: Tailwind CSS with custom design tokens (black/gold premium theme)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **Session Management**: express-session with MemoryStore
- **API Design**: RESTful JSON API with `/api/` prefix
- **Validation**: Zod schemas shared between client and server

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between client/server)
- **Current Storage**: In-memory storage implementation (`server/storage.ts`)
- **Database Ready**: Drizzle config points to PostgreSQL when DATABASE_URL is provided

### Authentication & Authorization
- Session-based authentication stored server-side
- Role hierarchy: ADMIN > MOD > VIP > USER
- Protected routes check session userId
- Role-based UI visibility (admin links hidden from non-admins)

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Route pages
│   │   ├── lib/          # Utilities and contexts
│   │   └── hooks/        # Custom React hooks
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Data storage interface
│   └── vite.ts       # Vite dev middleware
├── shared/           # Shared code
│   └── schema.ts     # Drizzle schema + Zod types
└── migrations/       # Database migrations (Drizzle)
```

### Key Design Decisions
1. **Shared Schema**: Database schemas and validation types live in `shared/` for type safety across stack
2. **In-Memory Storage**: Currently uses Map-based storage for development; designed to swap to PostgreSQL
3. **Session Auth**: Simpler than JWT for this use case; sessions stored in MemoryStore
4. **Component Library**: shadcn/ui provides accessible, customizable components without framework lock-in
5. **Polling for Chat**: Uses 5-second polling instead of WebSockets per project requirements (no real-time WebSocket)

## External Dependencies

### Database
- **PostgreSQL**: Primary database (Drizzle configured for `DATABASE_URL`)
- **Drizzle Kit**: Database migrations via `npm run db:push`

### Key NPM Packages
- `express` - HTTP server
- `drizzle-orm` / `drizzle-zod` - Database ORM and schema validation
- `@tanstack/react-query` - Data fetching and caching
- `react-hook-form` - Form handling
- `zod` - Runtime type validation
- `date-fns` - Date formatting (Turkish locale support)
- `wouter` - Client-side routing
- `express-session` / `memorystore` - Session management

### UI Dependencies
- `@radix-ui/*` - Accessible UI primitives
- `tailwindcss` - Utility-first CSS
- `class-variance-authority` - Component variants
- `lucide-react` - Icon library

### Development Tools
- `vite` - Frontend build tool
- `tsx` - TypeScript execution
- `esbuild` - Production bundling
- Replit-specific plugins for dev experience