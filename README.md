# Local Pro Sites Platform

Een volledig productie-klare SaaS platform voor webdesign bureaus met AI-powered content management, real-time chat, en automated website updates.

## 🚀 Features

### Client Portal
- **Dashboard** - Overzicht van website statistieken en activiteit
- **Content Editor** - No-code interface voor website content management
- **AI Chat Assistent** - Claude-powered chatbot voor automatische website wijzigingen
- **Analytics** - Bezoekersstatistieken en trends
- **File Manager** - Upload en beheer bestanden
- **Profiel Beheer** - Account instellingen en 2FA setup

### Admin Portal
- **Dashboard** - Platform-wide statistieken en metrics
- **Client Management** - Beheer klantaccounts en toegang
- **Change Requests** - Review en goedkeuren van wijzigingen
- **Website Management** - Replit integratie en deployment
- **Support System** - Ticket management en chat escalation
- **Analytics** - Platform-brede rapporten

### Core Technology
- **Authentication** - JWT + Argon2 password hashing + 2FA (TOTP)
- **AI Integration** - Claude API voor intelligente chat en content wijzigingen
- **Real-time Updates** - WebSocket voor live notifications
- **Database** - PostgreSQL met Drizzle ORM
- **Security** - Rate limiting, CSRF protection, encryption

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 14+
- NPM of Yarn

## 🛠️ Installation

### 1. Clone en setup

\`\`\`bash
git clone <repository-url>
cd local-pro-sites-platform
npm install
\`\`\`

### 2. Environment Setup

Kopieer de environment bestanden:

\`\`\`bash
cp .env.example .env
cp packages/web/.env.example packages/web/.env
\`\`\`

Vul de volgende variabelen in `.env`:

\`\`\`env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/local_pro_sites

# API Keys
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...

# Security (genereer sterke secrets!)
JWT_SECRET=<random-64-char-string>
ENCRYPTION_KEY=<random-32-byte-hex>

# Server
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
\`\`\`

### 3. Database Setup

Maak een PostgreSQL database aan:

\`\`\`bash
createdb local_pro_sites
\`\`\`

Genereer en run migraties:

\`\`\`bash
npm run db:generate
npm run db:migrate
\`\`\`

### 4. Start Development

Start zowel backend als frontend:

\`\`\`bash
npm run dev
\`\`\`

Of start ze apart:

\`\`\`bash
# Terminal 1 - Backend
cd packages/api
npm run dev

# Terminal 2 - Frontend
cd packages/web
npm run dev
\`\`\`

De applicatie is nu beschikbaar op:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Database Studio: `npm run db:studio`

## 📦 Project Structure

\`\`\`
/
├── packages/
│   ├── api/                    # Backend (Express + TypeScript)
│   │   ├── src/
│   │   │   ├── routes/        # API endpoints
│   │   │   ├── models/        # Database schema (Drizzle)
│   │   │   ├── services/      # Business logic
│   │   │   ├── middleware/    # Auth, validation, rate limiting
│   │   │   └── utils/         # Helpers (crypto, JWT)
│   │   └── drizzle/           # Database migrations
│   │
│   └── web/                    # Frontend (React + TypeScript)
│       ├── src/
│       │   ├── components/    # UI components (shadcn/ui)
│       │   ├── pages/         # Route components
│       │   │   ├── client/   # Client portal pages
│       │   │   └── admin/    # Admin portal pages
│       │   ├── hooks/         # Custom React hooks
│       │   ├── lib/           # Utils, API client
│       │   └── types/         # TypeScript definitions
│       └── public/
│
├── .env                        # Environment variables
└── package.json               # Root workspace config
\`\`\`

## 🔐 Security Features

- **Argon2 Password Hashing** - Industry-standard hashing
- **JWT Authentication** - Secure token-based auth
- **2FA (TOTP)** - Two-factor authentication met backup codes
- **Rate Limiting** - API en auth endpoints beschermd
- **CSRF Protection** - Cross-site request forgery preventie
- **Encrypted Storage** - API tokens encrypted at rest
- **Session Management** - Automatic session expiration

## 🤖 AI Chatbot

De AI chatbot gebruikt Claude API om:
- Website content wijzigingen te begrijpen en verwerken
- Automatisch "veilige" wijzigingen toe te passen
- Change requests aan te maken voor admin review
- Vragen te beantwoorden over de website
- Te escaleren naar support wanneer nodig

### Supported Change Types:
- Openingstijden updates
- Contact informatie wijzigingen
- Content aanpassingen (hero, about, services)
- Logo uploads
- General queries

## 📊 Database Schema

### Core Tables:
- `users` - Gebruikers (clients + admins)
- `client_profiles` - Client business informatie
- `websites` - Website registry
- `website_content` - Content versioning
- `chat_sessions` & `chat_messages` - AI chat
- `change_requests` - Website wijzigingsverzoeken
- `support_tickets` - Support systeem
- `files` - File storage
- `website_analytics` - Analytics data

Zie `packages/api/src/models/schema.ts` voor complete schema.

## 🚀 Deployment

### Production Build

\`\`\`bash
npm run build
\`\`\`

### Environment Variables

Zorg dat alle production environment variables zijn ingesteld:
- Sterke JWT_SECRET en ENCRYPTION_KEY
- Production DATABASE_URL
- Valid API keys (Anthropic, Resend)
- NODE_ENV=production

### Database Migration

\`\`\`bash
npm run db:migrate
\`\`\`

### Start Production

\`\`\`bash
npm start
\`\`\`

## 📝 API Documentation

### Authentication Endpoints

\`\`\`
POST /api/auth/register    - Register nieuwe gebruiker
POST /api/auth/login       - Login
POST /api/auth/logout      - Logout
GET  /api/auth/me          - Get current user
POST /api/auth/2fa/setup   - Setup 2FA
POST /api/auth/2fa/enable  - Enable 2FA
POST /api/auth/2fa/disable - Disable 2FA
\`\`\`

### Chat Endpoints

\`\`\`
POST /api/chat/sessions                 - Create chat session
POST /api/chat/messages                 - Send message
GET  /api/chat/sessions                 - Get all sessions
GET  /api/chat/sessions/:id/messages    - Get session messages
POST /api/chat/sessions/:id/escalate    - Escalate to support
\`\`\`

## 🔧 Development

### Available Scripts

\`\`\`bash
npm run dev           # Start development (backend + frontend)
npm run build         # Build for production
npm start             # Start production server
npm run db:generate   # Generate database migrations
npm run db:migrate    # Run migrations
npm run db:studio     # Open Drizzle Studio
\`\`\`

### Code Style

- TypeScript voor type safety
- ESLint voor code quality
- Prettier voor formatting (optioneel)
- Nederlandse UI teksten, Engelse code

## 🐛 Troubleshooting

### Database Connection Issues
- Controleer DATABASE_URL in .env
- Zorg dat PostgreSQL draait
- Check credentials en database bestaat

### API Key Errors
- Verify ANTHROPIC_API_KEY is valid
- Check RESEND_API_KEY voor email
- Ensure keys hebben correcte permissions

### Build Errors
- Clear node_modules en reinstall
- Check TypeScript versie compatibility
- Verify alle dependencies zijn installed

## 📄 License

Proprietary - All rights reserved

## 🤝 Contributing

Dit is een privé project. Contributie guidelines worden nog toegevoegd.

## 📧 Support

Voor vragen of problemen, neem contact op via support@yourplatform.com

---

**Built with ❤️ using Node.js, React, PostgreSQL, and Claude AI**
