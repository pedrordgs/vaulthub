# Contributing to VaultHub

## Quick Start

```bash
npm install
npm run dev
```

## Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature-name`
2. Make changes following existing code style
3. Test: `npm run lint && npm run build`
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation
   - `refactor:` - Code refactoring
   - `test:` - Tests
   - `chore:` - Maintenance
5. Push and create Pull Request

## Code Standards

- **TypeScript**: Strict types, avoid `any`
- **React**: Use Server Components by default, add `'use client'` only when needed
- **Styling**: Tailwind CSS utility classes, mobile-first
- **Security**: Never log passwords/secrets, validate input, sanitize errors

## PR Checklist

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] No linting errors

See [AGENTS.md](AGENTS.md) for detailed guidelines.
