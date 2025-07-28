# FoxChat - Real-time Chat Application

## Overview

FoxChat is a real-time chat application built with React, Express, and WebSockets. It provides private chat rooms where users can communicate in real-time using room codes (seeds). The application emphasizes privacy by storing messages only in RAM and supports multiple languages including English, Turkish, and Arabic.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack architecture with clear separation between client and server components:

- **Frontend**: React-based SPA with TypeScript, using Vite for development and building
- **Backend**: Express.js server with WebSocket support for real-time communication
- **Database**: Drizzle ORM configured for PostgreSQL (using Neon Database)
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query for server state and React hooks for local state

## Key Components

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for styling with custom CSS variables for theming
- **React Query** for server state management and caching

### Backend Architecture
- **Express.js** server with TypeScript
- **WebSocket Server** using the `ws` library for real-time communication
- **In-memory storage** implementation with interface for future database integration
- **Drizzle ORM** configured for PostgreSQL database operations
- **Session management** with connect-pg-simple for PostgreSQL sessions

### UI Components
- Custom themed components based on shadcn/ui
- Responsive design with mobile-first approach
- Dark theme with purple/fox-themed color scheme
- Internationalization support for multiple languages

## Data Flow

### WebSocket Communication
1. Client connects via WebSocket on `/ws` endpoint
2. Messages are validated using Zod schemas
3. Real-time bidirectional communication for:
   - Joining/leaving rooms
   - Sending messages
   - User updates
   - Room management commands

### Room Management
- Rooms are created with unique seeds (room codes)
- Each room has a leader with administrative privileges
- Users can be banned/kicked by room leaders
- Room data includes users, messages, and configuration

### Message Types
- **User messages**: Regular chat messages from users
- **System messages**: Automated notifications (joins, leaves, kicks, etc.)
- **Commands**: Administrative actions like `/kick`, `/ban`, `/password`

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm & drizzle-kit**: Database ORM and migration tools
- **ws**: WebSocket server implementation
- **zod**: Runtime type validation
- **react-query**: Server state management
- **wouter**: Lightweight React router

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Development
- Uses Vite dev server with HMR
- Express server runs with `tsx` for TypeScript execution
- WebSocket server integrated with HTTP server
- Environment variables for database configuration

### Production Build
- Frontend built with Vite to `dist/public`
- Backend bundled with esbuild to `dist/index.js`
- Static file serving for production
- Database migrations handled via Drizzle

### Database Schema
- Configured for PostgreSQL with Drizzle ORM
- Schema defined in `shared/schema.ts` for type sharing
- Migrations output to `./migrations` directory
- Connection via `DATABASE_URL` environment variable

### Key Features
- **Privacy-focused**: Messages stored only in RAM
- **Real-time communication**: WebSocket-based chat
- **Multi-language support**: i18n with RTL support for Arabic
- **Room-based**: Private chat rooms with unique seeds
- **Administrative controls**: Room leaders can manage users
- **Responsive design**: Works on desktop and mobile devices

The application is designed to be simple to deploy on Replit with automatic database provisioning and WebSocket support.