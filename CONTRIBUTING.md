# Contributing to VaultHub

Thank you for your interest in contributing to VaultHub! This document provides guidelines and instructions for contributing to the project.

## 🤝 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm
- Git
- Basic understanding of Next.js, React, and TypeScript

### Setting Up Development Environment

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Development Workflow

### 1. Create a Feature Branch

```bash
# Create a new feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, maintainable code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Build the project
npm run build

# Test in development mode
npm run dev
```

### 4. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```bash
git add .
git commit -m "feat: add new feature"
```

**Commit Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
git commit -m "feat(vault): add bulk encryption support"
git commit -m "fix(ui): resolve dark mode contrast issue"
git commit -m "docs(readme): update docker instructions"
```

### 5. Push

```bash
git push
```

### 6. Create a Pull Request

1. Select your feature branch
2. Fill out the PR template with:
   - Description of changes
   - Related issue numbers
   - Testing performed
   - Screenshots (if UI changes)

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all code
- Avoid `any` type - use `unknown` if type is truly unknown
- Define interfaces/types for all data structures
- Use type guards for runtime type checking

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

function getUser(): User {
  // ...
}

// ❌ Bad
function getUser(): any {
  // ...
}
```

### React Components

- Use React Server Components by default
- Add `'use client'` only when needed (interactivity, hooks, browser APIs)
- Keep components small and focused
- Use composition over configuration

```typescript
// ✅ Good - Server Component
export default function Layout({ children }) {
  return <div>{children}</div>;
}

// ✅ Good - Client Component (only when needed)
'use client';
export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use CSS variables for theme colors
- Maintain consistency with existing design

```typescript
// ✅ Good
<div className="flex flex-col gap-4 p-6 rounded-lg border bg-card">

// ❌ Avoid inline styles
<div style={{ padding: '24px' }}>
```

### File Organization

Place files in appropriate directories:
- `/app` - Next.js App Router pages and layouts
- `/app/actions` - Server actions
- `/components/ui` - Reusable UI components
- `/components/vault` - Vault-specific components
- `/lib` - Utility functions and core logic
- `/types` - TypeScript type definitions

## 🔒 Security Guidelines

**Critical: Never expose sensitive data**

- ❌ Never log passwords or secrets
- ❌ Never commit API keys or credentials
- ✅ Always validate user input
- ✅ Always sanitize error messages
- ✅ Process sensitive operations server-side

```typescript
// ✅ Good - Secure error handling
catch (error) {
  return { error: 'Operation failed. Please try again.' };
}

// ❌ Bad - Exposes sensitive information
catch (error) {
  return { error: `Failed with password: ${password}` };
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

- Write tests for new features
- Test edge cases and error scenarios
- Follow existing test patterns

```typescript
// Example test structure
describe('encryptVaultString', () => {
  it('should encrypt plain text successfully', async () => {
    const result = await encryptVaultString('secret', 'password');
    expect(result).toContain('$ANSIBLE_VAULT;1.1;AES256');
  });

  it('should throw error for empty password', async () => {
    await expect(
      encryptVaultString('secret', '')
    ).rejects.toThrow();
  });
});
```

## 📚 Documentation

### When to Update Documentation

- Adding new features
- Changing existing functionality
- Modifying configuration
- Adding new dependencies

### Documentation Files

- `README.md` - User-facing documentation
- `AGENTS.md` - Development guidelines
- `CONTRIBUTING.md` - This file
- Code comments - For complex logic

## 🐛 Bug Reports

### Before Submitting

1. Check existing issues
2. Verify the bug in latest version
3. Test in a clean environment

### Bug Report Template

**Title:** Clear, descriptive title

**Description:**
- What happened?
- What did you expect?
- Steps to reproduce
- Environment (OS, Node version, browser)
- Screenshots (if applicable)

## 💡 Feature Requests

### Before Submitting

1. Check existing feature requests
2. Ensure it aligns with project goals
3. Consider implementation complexity

### Feature Request Template

**Title:** Clear feature name

**Description:**
- Problem being solved
- Proposed solution
- Alternative solutions considered
- Additional context

## 🔍 Code Review Process

### What We Look For

- Code quality and style
- Test coverage
- Documentation updates
- Security considerations
- Performance impact
- Accessibility

### Review Timeline

- Initial review within 48 hours
- Follow-up reviews within 24 hours
- Approval from at least one maintainer required

## 📦 Pull Request Checklist

Before submitting your PR, ensure:

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for features
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] No linting errors
- [ ] Security considerations addressed
- [ ] Accessibility maintained
- [ ] Self-reviewed code

## 🎯 Priority Areas

We're especially interested in contributions for:

- 🐛 Bug fixes
- 📚 Documentation improvements
- ♿ Accessibility enhancements
- 🌍 Internationalization
- 🧪 Test coverage
- 🎨 UI/UX improvements

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

## 🙏 Thank You

Every contribution, no matter how small, helps make VaultHub better. Thank you for being part of the community!

---

**Happy Contributing! 🚀**

