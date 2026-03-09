# VaultHub

**A modern web application for encrypting and decrypting Ansible vault strings**

[Live Demo](https://vaulthub-app.vercel.app) • [Report Bug](https://github.com/pedrordgs/vaulthub/issues)

## Features

- 🔐 Ansible Vault compatible (`$ANSIBLE_VAULT;1.1;AES256`)
- 🔓 Encrypt plain text and decrypt vault strings
- 📦 Batch mode — encrypt/decrypt multiple labeled entries at once
- 📄 YAML import/export — import a `vault.yml` for bulk decryption; export encrypted results as `vault.yml`
- 🎨 Modern UI with dark mode support
- 🔒 Server-side processing, no data persistence
- ⚡ Fast and lightweight

## Quick Start

### Option 1: Use Hosted Version

Visit [https://vaulthub-app.vercel.app](https://vaulthub-app.vercel.app)

### Option 2: Run Locally

```bash
git clone https://github.com/pedrordgs/vaulthub.git
cd vaulthub
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Option 3: Docker

```bash
docker run -p 3000:3000 vaulthub:latest
```

## Usage

1. **Encrypt**: Enter plain text and password → Get encrypted vault string
2. **Decrypt**: Paste vault string and password → Get decrypted text
3. **Batch encrypt**: Add multiple labeled entries → Encrypt all with a single password → Optionally export as `vault.yml`
4. **Batch decrypt**: Add multiple vault strings (or import a `vault.yml`) → Decrypt all at once

## Tech Stack

- Next.js 16.1.5 (App Router)
- TypeScript 5
- Tailwind CSS 4
- Custom encryption (AES-256-CTR + PBKDF2 + HMAC-SHA256)


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License
