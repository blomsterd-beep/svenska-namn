# BlomsterLån - Retur och Lånesystem

## Overview

BlomsterLån is a Swedish-language loan and return tracking system for the flower industry. It manages the lending and return of containers (buckets) and carts between suppliers and customers. The application tracks customers, inventory items, transactions (deliveries and returns), and calculates outstanding balances per customer and item.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **UI Components**: Radix UI primitives wrapped with custom styling
- **Notifications**: Sonner toast library
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Style**: RESTful JSON API under `/api/*` routes
- **Build**: esbuild for production bundling with selective dependency bundling for cold start optimization

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Shared schema definitions in `/shared/schema.ts` used by both client and server
- **Validation**: Zod schemas generated from Drizzle schemas via `drizzle-zod`
- **Migrations**: Drizzle Kit with push-based migrations (`db:push`)

### Application Structure
```
client/           # React frontend
  src/
    components/   # UI components including shadcn/ui
    pages/        # Route pages (dashboard, customers, items, transactions, balances)
    lib/          # Utilities, API client, query client
    hooks/        # Custom React hooks
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route handlers
  storage.ts      # Database access layer
  db.ts           # Database connection
shared/           # Shared code between client and server
  schema.ts       # Drizzle schema definitions and Zod validators
```

### Core Data Models
- **Users**: Authentication users with username/password
- **Customers**: Business contacts with name, company, contact info
- **Items**: Trackable inventory items (buckets, carts) with categories
- **Transactions**: Records of deliveries and returns with quantities, timestamps, and notes
- **CustomerBalance**: Computed view showing outstanding balances per customer/item

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connected via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage (available but may not be actively used)

### Frontend Libraries
- **@tanstack/react-query**: Async state management
- **Radix UI**: Accessible component primitives (dialog, dropdown, select, tabs, etc.)
- **Lucide React**: Icon library
- **date-fns**: Date formatting utilities
- **embla-carousel-react**: Carousel component

### Backend Libraries
- **Express**: HTTP server framework
- **Drizzle ORM**: Type-safe database toolkit
- **Zod**: Runtime validation

### Development Tools
- **Vite**: Development server and build tool
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling
- **Drizzle Kit**: Database migration tooling