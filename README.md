# VaultHub

A modern web application for managing Ansible vaults with an intuitive interface. VaultHub allows you to encrypt/decrypt vault strings, manage vaults and secrets, and import/export vault files seamlessly.

## Features

- 🔐 **Encrypt/Decrypt Vault Strings** - Encrypt and decrypt Ansible vault strings with ease
- 📦 **Vault Management** - Store and manage multiple vaults in a database
- 🔑 **Secret Management** - Add, edit, view, and delete secrets within vaults
- 📥 **Import/Export** - Download vaults as YAML files or upload existing vault files
- 🎨 **Modern UI/UX** - Clean, intuitive interface with dark mode support
- 🗄️ **Database Integration** - Uses Drizzle ORM for reliable data persistence

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database ORM**: Drizzle
- **Styling**: Tailwind CSS (or your preferred CSS framework)
- **Language**: TypeScript
- **Vault Encryption**: Ansible Vault compatible encryption

## Implementation Plan

### Phase 1: Production-Ready Prototype - Encrypt/Decrypt with Modern UI/UX

**Goal**: Create a production-ready prototype with encrypt/decrypt functionality, featuring a polished UI/UX with dark mode support. This phase focuses on perfecting the core encryption functionality before adding database complexity.

**Tasks**:
1. Initialize Next.js project with TypeScript and App Router
2. Set up project structure and development environment
3. Implement Ansible vault encryption/decryption functions:
   - Research and integrate Ansible vault encryption library (e.g., `ansible-vault` npm package or custom implementation)
   - Create server actions for encryption and decryption
   - Ensure compatibility with Ansible vault format (`$ANSIBLE_VAULT;1.1;AES256`)
   - Handle encryption errors gracefully
4. Set up UI component library (shadcn/ui recommended):
   - Install and configure component library
   - Set up Tailwind CSS with design system
   - Create reusable UI components (Button, Input, Card, etc.)
5. Design and implement modern UI:
   - Create intuitive layout with clear sections for encrypt/decrypt
   - Implement responsive design (mobile-first approach)
   - Add loading states and animations
   - Create clear visual feedback for actions
   - Add icons and visual elements
6. Implement dark mode:
   - Set up theme provider (next-themes)
   - Create dark mode toggle component
   - Style all components for both light and dark themes
   - Persist theme preference in localStorage
   - Ensure smooth theme transitions
7. Enhance user experience:
   - Add toast notifications for success/error states
   - Implement copy-to-clipboard functionality
   - Add clear/reset buttons
   - Improve error messages and validation feedback
   - Add keyboard shortcuts (optional)
   - Ensure accessibility (ARIA labels, keyboard navigation)
8. Polish and refine:
   - Improve spacing and typography
   - Add transitions and micro-interactions
   - Optimize performance
   - Add comprehensive error handling
   - Test with various Ansible vault strings
9. Basic security considerations:
   - Validate and sanitize all inputs
   - Never expose sensitive data in error messages
   - Implement basic rate limiting (optional)
   - Secure password handling (never log passwords)

**Deliverables**:
- Production-ready encrypt/decrypt functionality
- Polished, modern UI with dark mode support
- Responsive design that works on all devices
- Comprehensive error handling and user feedback
- Accessible and performant application
- Documentation on how to use the prototype

**Estimated Time**: 7-10 days

---

### Phase 2: Database Setup & Vault Storage

**Goal**: Set up database infrastructure and implement basic vault storage.

**Tasks**:
1. Choose and set up database (PostgreSQL recommended)
2. Install and configure Drizzle ORM
3. Design database schema:
   - `vaults` table (id, name, description, created_at, updated_at)
   - `secrets` table (id, vault_id, key, encrypted_value, created_at, updated_at)
4. Create Drizzle schema definitions
5. Set up database migrations
6. Create database connection utilities
7. Implement basic CRUD operations for vaults:
   - Create vault
   - List vaults
   - Get vault by ID
   - Delete vault
8. Add simple UI to create and list vaults

**Deliverables**:
- Database schema defined
- Database migrations working
- Basic vault CRUD operations
- Simple UI for vault management

**Estimated Time**: 3-4 days

---

### Phase 3: Secret Management

**Goal**: Implement full CRUD operations for secrets within vaults.

**Tasks**:
1. Implement secret CRUD operations:
   - Add secret to vault (encrypt value before storing)
   - List secrets in a vault
   - Edit secret (decrypt, edit, re-encrypt)
   - Delete secret
2. Create UI components:
   - Secret list view for a vault
   - Add secret form
   - Edit secret form (with decrypt functionality)
   - Delete confirmation
3. Implement proper encryption/decryption flow:
   - Encrypt secrets before storing in database
   - Decrypt secrets only when displaying/editing
   - Never store plain text secrets
4. Add validation:
   - Ensure unique keys within a vault
   - Validate vault password/encryption key
5. Add error handling and user feedback

**Deliverables**:
- Full secret CRUD functionality
- UI for managing secrets within vaults
- Secure encryption/decryption workflow

**Estimated Time**: 4-5 days

---

### Phase 4: Import/Export Functionality

**Goal**: Enable users to download vaults as YAML files and upload existing vault files.

**Tasks**:
1. Implement export functionality:
   - Create function to convert vault + secrets to YAML format
   - Ensure exported YAML is properly formatted (Ansible vault compatible)
   - Add download button/functionality
2. Implement import functionality:
   - Create YAML parser
   - Validate YAML structure
   - Parse vault and secrets from YAML
   - Handle encrypted values in YAML
   - Import into database (create new vault or update existing)
3. Create UI components:
   - Export button for vaults
   - Upload/import form
   - File validation and error messages
4. Handle edge cases:
   - Malformed YAML files
   - Duplicate keys
   - Large files
   - Different YAML formats

**Deliverables**:
- Export vaults as YAML files
- Import vaults from YAML files
- UI for import/export operations

**Estimated Time**: 3-4 days

---

### Phase 5: Security & Production Readiness

**Goal**: Ensure the application is secure and ready for production use.

**Tasks**:
1. Security enhancements:
   - Implement proper password/key management
   - Add authentication/authorization if needed
   - Secure API routes and server actions
   - Validate and sanitize all inputs (already started in Phase 1)
   - Implement rate limiting
   - Add CSRF protection
   - Security audit of encryption implementation
2. Error handling:
   - Comprehensive error handling across all features
   - User-friendly error messages
   - Logging and monitoring setup
   - Error tracking (e.g., Sentry)
3. Performance optimization:
   - Optimize database queries
   - Add caching where appropriate
   - Optimize bundle size
   - Add loading states and Suspense boundaries
   - Performance testing and optimization
4. Testing:
   - Write unit tests for core functions (encryption, YAML parsing)
   - Write integration tests for server actions
   - Write E2E tests for critical user flows
   - Test encryption/decryption edge cases
   - Test import/export functionality
   - Test database operations
5. Documentation:
   - API documentation
   - User guide
   - Deployment guide
   - Environment variables documentation
   - Architecture documentation

**Deliverables**:
- Secure application
- Production-ready code
- Test coverage
- Complete documentation

**Estimated Time**: 4-5 days

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL (or your preferred database) - *Required starting Phase 2*
- Ansible (for testing vault compatibility)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vaulthub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

## Project Structure

```
vaulthub/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (routes)/         # Application routes
│   └── layout.tsx        # Root layout
├── components/            # React components
├── lib/                   # Utility functions
│   ├── db/               # Database configuration
│   ├── vault/           # Vault encryption/decryption
│   └── utils/           # General utilities
├── db/                    # Database schema and migrations
│   ├── schema.ts         # Drizzle schema
│   └── migrations/       # Migration files
└── public/               # Static assets
```

## Development

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Migrations

```bash
# Generate migration
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema changes (dev only)
npm run db:push
```

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting pull requests.

## License

See [LICENSE](LICENSE) file for details.

