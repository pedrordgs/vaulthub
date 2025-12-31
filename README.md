# VaultHub

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

**A modern web application for encrypting and decrypting Ansible vault strings**

[Live Demo](https://vaulthub.vercel.app) • [Report Bug](https://github.com/pedrordgs/vaulthub/issues) • [Request Feature](https://github.com/pedrordgs/vaulthub/issues)

</div>

---

## 🎯 Overview

VaultHub is a production-ready web application that provides an intuitive interface for encrypting and decrypting Ansible vault strings. Built with Next.js and TypeScript, it offers both cloud-hosted and self-hosted deployment options.

### Key Features

- 🔐 **Ansible Vault Compatible** - Fully compatible with Ansible vault format (`$ANSIBLE_VAULT;1.1;AES256`)
- 🔓 **Bidirectional Encryption** - Encrypt plain text and decrypt vault strings seamlessly
- 🎨 **Modern UI/UX** - Clean, responsive interface with dark mode support
- 📋 **One-Click Copy** - Instantly copy encrypted or decrypted results to clipboard
- ✅ **Input Validation** - Comprehensive validation with user-friendly error messages
- 🔒 **Security First** - Server-side processing, no data persistence
- 🌐 **Stateless Design** - No database required, completely stateless architecture
- ⚡ **Fast & Lightweight** - Optimized for performance with minimal bundle size
- 🐳 **Docker Ready** - Easy self-hosted deployment with Docker

## 🚀 Quick Start

### Option 1: Use the Hosted Version

Visit [https://vaulthub.vercel.app](https://vaulthub.vercel.app) to use VaultHub instantly without any setup.

### Option 2: Run Locally

```bash
# Clone the repository
git clone https://github.com/pedrordgs/vaulthub.git
cd vaulthub

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 3: Self-Host with Docker

```bash
# Pull and run the Docker image
docker run -p 3000:3000 vaulthub:latest

# Or build from source
docker build -t vaulthub .
docker run -p 3000:3000 vaulthub
```

Access VaultHub at [http://localhost:3000](http://localhost:3000).

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm**, **yarn**, or **pnpm**
- **Docker** (optional, for containerized deployment)

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui + Radix UI |
| Encryption | Custom (Node.js crypto) - AES-256-CTR + PBKDF2 + HMAC-SHA256 |
| Validation | Zod |
| Theme | next-themes |

## 📖 Usage

### Encrypting a String

1. Navigate to the **Encrypt** tab
2. Enter your plain text in the text area
3. Provide a secure password for encryption
4. Click **Encrypt**
5. Copy the encrypted result (starts with `$ANSIBLE_VAULT;1.1;AES256`)

**Example Output:**
```
$ANSIBLE_VAULT;1.1;AES256
66386439653034376537613361356637623633616531653563633832343436353038343634...
```

### Decrypting a String

1. Navigate to the **Decrypt** tab
2. Paste your Ansible vault-encrypted string
3. Enter the password used during encryption
4. Click **Decrypt**
5. View or copy the decrypted plain text

## 🐳 Docker Deployment

### Using Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  vaulthub:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

Run with:
```bash
docker-compose up -d
```

### Manual Docker Build

```bash
# Build the image
docker build -t vaulthub:latest .

# Run the container
docker run -d \
  --name vaulthub \
  -p 3000:3000 \
  --restart unless-stopped \
  vaulthub:latest
```

### Docker Configuration

The Docker container:
- Runs on port 3000 by default
- Uses Node.js 20 Alpine for minimal image size
- Includes all necessary dependencies
- Optimized for production with multi-stage build
- No persistent volumes required (stateless)

## ☁️ Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pedrordgs/vaulthub)

### Manual Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts to complete deployment

### Vercel Configuration

No environment variables or additional configuration required. VaultHub works out of the box on Vercel.

## 🏗️ Project Structure

```
vaulthub/
├── app/                      # Next.js app directory
│   ├── actions/              # Server actions
│   │   └── vault.ts          # Encrypt/decrypt actions
│   ├── layout.tsx            # Root layout with theme provider
│   ├── page.tsx              # Main page
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── ui/                   # Reusable UI components (shadcn/ui)
│   ├── vault/                # Vault-specific components
│   │   ├── encrypt-form.tsx  # Encryption form
│   │   └── decrypt-form.tsx  # Decryption form
│   └── theme/                # Theme components
│       ├── theme-provider.tsx
│       └── theme-toggle.tsx
├── lib/                      # Utility libraries
│   ├── vault/                # Vault encryption/decryption
│   │   ├── encrypt.ts        # Custom encryption implementation
│   │   └── decrypt.ts        # Custom decryption implementation
│   └── utils.ts              # General utilities
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose configuration
└── SECURITY.md               # Detailed cryptographic specification
```

## 🔧 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

### Building for Production

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm start
```

The application will be available at `http://localhost:3000`.

## 🔒 Security

VaultHub is designed with security as a top priority:

- **Custom Encryption Implementation**: Uses Node.js built-in `crypto` module with industry-standard algorithms
  - **AES-256-CTR**: Military-grade encryption cipher
  - **PBKDF2-HMAC-SHA256**: Secure password-based key derivation (10,000 iterations)
  - **HMAC-SHA256**: Message authentication to prevent tampering
- **Server-Side Processing**: All encryption and decryption operations occur on the server
- **No External Dependencies**: No third-party encryption libraries, full transparency
- **No Data Persistence**: No user data, passwords, or encrypted strings are stored
- **Stateless Architecture**: Each request is independent with no session storage
- **Timing-Attack Resistant**: Constant-time HMAC comparison using `timingSafeEqual()`
- **Ansible-Compatible**: 100% compatible with Ansible Vault 1.1 format

### Security Best Practices

When using VaultHub in production:

1. **Always use HTTPS** for encrypted connections
2. **Use strong passwords** for vault encryption (minimum 12 characters recommended)
3. **Don't share passwords** via insecure channels
4. **Keep dependencies updated** regularly (run `npm audit` periodically)
5. **Consider network isolation** for sensitive deployments
6. **Review the security documentation**: See [SECURITY.md](SECURITY.md) for detailed cryptographic specifications

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the TypeScript style guide
- Write meaningful commit messages (conventional commits)
- Add tests for new features
- Update documentation as needed
- Ensure all lints pass before committing

See [AGENTS.md](AGENTS.md) for detailed implementation guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Ansible Vault](https://docs.ansible.com/ansible/latest/user_guide/vault.html) - Encryption format
- [Vercel](https://vercel.com/) - Hosting platform
