# VaultHub Development Guide

This document provides comprehensive guidelines for maintaining and extending the VaultHub application. Follow these guidelines to ensure consistency, maintainability, and quality.

## 🏛️ Architecture Overview

### Core Principles

VaultHub is built on these fundamental principles:

1. **Security First** - All sensitive operations are server-side
2. **Stateless Design** - No data persistence, no database
3. **Type Safety** - Strict TypeScript throughout
4. **Modern Stack** - Leveraging Next.js App Router and React Server Components
5. **User Experience** - Intuitive, accessible, and responsive

### Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | Next.js 16 (App Router) | Server & client-side rendering |
| Language | TypeScript 5 (strict) | Type safety and developer experience |
| Styling | Tailwind CSS 4 | Utility-first styling |
| UI Library | shadcn/ui + Radix UI | Accessible component primitives |
| Validation | Zod | Runtime type validation |
| Encryption | Custom (Node.js crypto) | Ansible-compatible encryption (AES-256-CTR + PBKDF2 + HMAC) |
| Theme | next-themes | Dark/light mode support |

## 📁 Project Structure

```
vaulthub/
├── app/                    # Next.js App Router
│   ├── actions/           # Server actions
│   │   └── vault.ts      # Encrypt/decrypt server actions
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx          # Main application page
│   └── globals.css       # Global styles and CSS variables
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── vault/           # Vault-specific components
│   │   ├── encrypt-form.tsx
│   │   └── decrypt-form.tsx
│   └── theme/            # Theme components
│       ├── theme-provider.tsx
│       └── theme-toggle.tsx
├── lib/                   # Core utilities
│   ├── vault/           # Encryption/decryption logic
│   │   ├── encrypt.ts   # Custom encryption implementation (AES-256-CTR + PBKDF2 + HMAC)
│   │   └── decrypt.ts   # Custom decryption implementation
│   └── utils.ts         # General utilities (cn, etc.)
├── SECURITY.md            # Detailed cryptographic specification
└── public/               # Static assets
```

## 🔐 Encryption/Decryption Implementation

### Security Guidelines

**Critical Security Rules:**

1. ❌ **NEVER** log passwords or plain text secrets
2. ✅ **ALWAYS** process encryption/decryption server-side
3. ✅ **ALWAYS** validate input before processing
4. ✅ **ALWAYS** sanitize error messages (no sensitive data exposure)
5. ✅ **ALWAYS** use Ansible vault-compatible format

### Implementation Pattern

VaultHub uses a **custom encryption implementation** using Node.js's built-in `crypto` module:

```typescript
// lib/vault/encrypt.ts
import { createCipheriv, createHmac, pbkdf2, randomBytes } from "crypto";

export async function encryptVaultString(
  plainText: string,
  password: string
): Promise<string> {
  // 1. Validate inputs
  if (!plainText || !password) {
    throw new Error('Invalid input');
  }
  
  // 2. Generate random salt (32 bytes)
  const salt = randomBytes(32);
  
  // 3. Derive keys using PBKDF2-HMAC-SHA256 (10,000 iterations)
  const derivedKey = await pbkdf2(password, salt, 10000, 80, "sha256");
  const encryptionKey = derivedKey.subarray(0, 32);    // AES-256 key
  const hmacKey = derivedKey.subarray(32, 64);         // HMAC key
  const iv = derivedKey.subarray(64, 80);              // IV for CTR mode
  
  // 4. Encrypt using AES-256-CTR
  const cipher = createCipheriv("aes-256-ctr", encryptionKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plainText), cipher.final()]);
  
  // 5. Compute HMAC for authentication
  const hmac = createHmac("sha256", hmacKey);
  hmac.update(salt);
  hmac.update(ciphertext);
  const hmacDigest = hmac.digest();
  
  // 6. Combine: salt + hmac + ciphertext
  const vaultData = Buffer.concat([salt, hmacDigest, ciphertext]);
  
  // 7. Format as $ANSIBLE_VAULT;1.1;AES256\n<hex-encoded-data>
  return formatVaultData(vaultData.toString("hex"));
}

// lib/vault/decrypt.ts
import { createDecipheriv, createHmac, pbkdf2, timingSafeEqual } from "crypto";

export async function decryptVaultString(
  encryptedText: string,
  password: string
): Promise<string> {
  // 1. Validate and parse Ansible Vault format
  if (!encryptedText.startsWith('$ANSIBLE_VAULT;1.1;AES256')) {
    throw new Error('Invalid vault format');
  }
  
  // 2. Extract components
  const vaultData = parseVaultData(encryptedText);
  const salt = vaultData.subarray(0, 32);
  const storedHmac = vaultData.subarray(32, 64);
  const ciphertext = vaultData.subarray(64);
  
  // 3. Derive keys (same as encryption)
  const derivedKey = await pbkdf2(password, salt, 10000, 80, "sha256");
  const encryptionKey = derivedKey.subarray(0, 32);
  const hmacKey = derivedKey.subarray(32, 64);
  const iv = derivedKey.subarray(64, 80);
  
  // 4. Verify HMAC (authenticate before decrypting)
  const hmac = createHmac("sha256", hmacKey);
  hmac.update(salt);
  hmac.update(ciphertext);
  const computedHmac = hmac.digest();
  
  if (!timingSafeEqual(storedHmac, computedHmac)) {
    throw new Error('HMAC verification failed');
  }
  
  // 5. Decrypt using AES-256-CTR
  const decipher = createDecipheriv("aes-256-ctr", encryptionKey, iv);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  
  return plaintext.toString("utf8");
}
```

**Key Features:**
- ✅ **Custom implementation** - No external dependencies
- ✅ **Industry-standard algorithms** - AES-256-CTR, PBKDF2, HMAC-SHA256
- ✅ **Authenticated encryption** - HMAC verification prevents tampering
- ✅ **Timing-attack resistant** - Uses `timingSafeEqual()` for HMAC comparison
- ✅ **Ansible-compatible** - 100% compatible with Ansible Vault 1.1 format

See [SECURITY.md](SECURITY.md) for detailed cryptographic specification.

### Error Handling Standards

```typescript
// ✅ GOOD - Secure error handling
try {
  const result = await decryptVaultString(encrypted, password);
  return { success: true, decrypted: result };
} catch (error) {
  // Never expose passwords or sensitive data
  return { 
    success: false, 
    error: 'Decryption failed. Please check your password and input format.' 
  };
}

// ❌ BAD - Exposes sensitive information
catch (error) {
  return { 
    success: false, 
    error: `Failed with password: ${password}` // NEVER DO THIS
  };
}
```

## 🎨 Component Architecture

### React Server Components (RSC) Strategy

**Default to Server Components**, use Client Components only when needed:

| Use Server Component For | Use Client Component For |
|-------------------------|-------------------------|
| Static layouts | Interactive forms |
| Data fetching | Event handlers (onClick, onChange) |
| Server-side logic | Browser APIs (localStorage, navigator) |
| SEO-critical content | State management (useState, useEffect) |
| Reduced bundle size | Dynamic UI updates |

### Component File Structure

```typescript
// components/vault/encrypt-form.tsx
'use client'; // Only when needed

import { useFormState, useFormStatus } from 'react-dom';
import { encryptVaultString } from '@/app/actions/vault';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function EncryptForm() {
  const [state, formAction] = useFormState(encryptVaultString, null);
  
  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="plainText">Plain Text</Label>
        <Textarea 
          id="plainText"
          name="plainText" 
          placeholder="Enter text to encrypt" 
          required 
          rows={6}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password"
          name="password" 
          type="password" 
          placeholder="Enter encryption password" 
          required 
        />
      </div>
      
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      
      {state?.encrypted && (
        <div className="space-y-2">
          <Label>Encrypted Result</Label>
          <Textarea 
            value={state.encrypted} 
            readOnly 
            rows={8}
            className="font-mono text-sm"
          />
          <Button 
            type="button" 
            variant="secondary"
            onClick={() => {
              navigator.clipboard.writeText(state.encrypted);
              toast.success('Copied to clipboard!');
            }}
          >
            Copy to Clipboard
          </Button>
        </div>
      )}
      
      <SubmitButton />
    </form>
  );
}

// Separate component to use useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Encrypting...' : 'Encrypt'}
    </Button>
  );
}
```

### Component Best Practices

1. **Single Responsibility** - Each component does one thing well
2. **Composition** - Build complex UIs from simple components
3. **Accessibility** - Include ARIA labels, semantic HTML, keyboard navigation
4. **Loading States** - Always show feedback during async operations
5. **Error States** - Handle and display errors gracefully
6. **TypeScript** - Fully typed props and state

## ⚡ Server Actions

### Server Action Pattern

```typescript
// app/actions/vault.ts
'use server';

import { z } from 'zod';
import { encryptVaultString as encrypt } from '@/lib/vault/encrypt';

// Define validation schema
const encryptSchema = z.object({
  plainText: z.string().min(1, 'Plain text is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function encryptVaultString(
  prevState: unknown,
  formData: FormData
) {
  try {
    // Validate input
    const validated = encryptSchema.parse({
      plainText: formData.get('plainText'),
      password: formData.get('password'),
    });
    
    // Perform encryption
    const encrypted = await encrypt(
      validated.plainText, 
      validated.password
    );
    
    // Return success response
    return { 
      success: true, 
      encrypted,
      error: null 
    };
    
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0].message,
        encrypted: null 
      };
    }
    
    // Handle encryption errors (never expose sensitive data)
    return { 
      success: false, 
      error: 'Encryption failed. Please check your input.',
      encrypted: null 
    };
  }
}
```

### Server Action Best Practices

1. **Input Validation** - Always use Zod for runtime validation
2. **Consistent Response** - Return `{ success: boolean, data?, error? }`
3. **Error Sanitization** - Never expose passwords, secrets, or stack traces
4. **Type Safety** - Infer types from Zod schemas
5. **No Side Effects** - Keep actions pure and stateless

## 🎨 Styling Guidelines

### Tailwind CSS Usage

```typescript
// ✅ GOOD - Semantic, maintainable classes
<div className="flex flex-col gap-4 p-6 rounded-lg border bg-card">
  <h2 className="text-2xl font-semibold tracking-tight">Title</h2>
  <p className="text-sm text-muted-foreground">Description</p>
</div>

// ❌ AVOID - Excessive inline styles
<div style={{ padding: '24px', borderRadius: '8px' }}>
```

### CSS Variables for Theming

```css
/* app/globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... more variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode overrides */
  }
}
```

### Component Styling Pattern

```typescript
import { cn } from '@/lib/utils';

export function MyComponent({ className, ...props }) {
  return (
    <div 
      className={cn(
        "base-styles here",
        "more-base-styles",
        className // Allow override from parent
      )}
      {...props}
    />
  );
}
```

## 🧪 Testing Strategy

### Testing Priorities

1. **Unit Tests** - Core encryption/decryption logic
2. **Integration Tests** - Server actions and form submissions
3. **E2E Tests** - Critical user flows
4. **Type Tests** - TypeScript compilation

### Testing Structure

```
__tests__/
├── unit/
│   ├── vault/
│   │   ├── encrypt.test.ts      # Test encryption function
│   │   └── decrypt.test.ts      # Test decryption function
│   └── utils.test.ts            # Test utility functions
├── integration/
│   └── actions.test.ts          # Test server actions
└── e2e/
    └── vault-flow.test.ts       # Test complete user flow
```

### Example Test

```typescript
// __tests__/unit/vault/encrypt.test.ts
import { describe, it, expect } from 'vitest';
import { encryptVaultString } from '@/lib/vault/encrypt';

describe('encryptVaultString', () => {
  it('should encrypt plain text with password', async () => {
    const result = await encryptVaultString('secret', 'password123');
    
    expect(result).toContain('$ANSIBLE_VAULT;1.1;AES256');
    expect(result.length).toBeGreaterThan(50);
  });
  
  it('should produce different outputs for same input', async () => {
    const result1 = await encryptVaultString('secret', 'pass');
    const result2 = await encryptVaultString('secret', 'pass');
    
    // Due to salt, outputs should differ
    expect(result1).not.toBe(result2);
  });
  
  it('should throw error for empty password', async () => {
    await expect(
      encryptVaultString('secret', '')
    ).rejects.toThrow();
  });
});
```

## 🚀 Deployment

### Vercel Deployment

**Automatic Deployment:**
- Push to main branch triggers deployment
- Preview deployments for PRs
- Zero configuration required

**Environment Variables:**
- None required (stateless application)
- Optional: Analytics, monitoring tokens

### Docker Deployment

```dockerfile
# Multi-stage build for optimization
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### Self-Hosted Considerations

1. **Reverse Proxy** - Use Nginx/Caddy for HTTPS
2. **Process Manager** - Use PM2 or systemd for process management
3. **Monitoring** - Set up logging and health checks
4. **Updates** - Establish update/rollback procedures
5. **Backups** - Not needed (stateless), but backup configuration

## 📊 Performance Optimization

### Bundle Size Optimization

- Use React Server Components by default
- Lazy load heavy client components
- Tree-shake unused code
- Minimize client-side JavaScript

### Rendering Optimization

```typescript
// ✅ GOOD - Server Component (no JS sent to client)
export default function ServerComponent() {
  return <div>Static content</div>;
}

// ✅ GOOD - Client Component only when needed
'use client';
export function InteractiveComponent() {
  const [state, setState] = useState();
  return <button onClick={() => setState(...)}>Click</button>;
}
```

### Caching Strategy

- Static assets cached via CDN
- No data caching needed (stateless)
- Theme preference cached in localStorage (next-themes)

## 🔒 Security Checklist

### Development

- [ ] All dependencies up to date
- [ ] No secrets in code or git history
- [ ] Input validation on all forms
- [ ] Error messages sanitized
- [ ] TypeScript strict mode enabled

### Deployment

- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting considered (if public)
- [ ] CORS properly configured
- [ ] Content Security Policy set

### Code Review

- [ ] No console.logs in production code
- [ ] No hardcoded credentials
- [ ] Proper error handling
- [ ] No exposure of sensitive data
- [ ] Server actions validated

## 🛠️ Development Workflow

### Git Workflow

1. Create feature branch from `main`
2. Make changes with conventional commits
3. Test locally
4. Create PR with description
5. Address review comments
6. Merge to `main`

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:** feat, fix, docs, style, refactor, test, chore

**Examples:**
```
feat(vault): add bulk encryption support
fix(ui): resolve dark mode button contrast issue
docs(readme): update docker deployment instructions
```

## 📚 Resources

### Official Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Ansible Vault](https://docs.ansible.com/ansible/latest/user_guide/vault.html)

### Core Libraries

- **Node.js `crypto` module** - Custom encryption implementation (AES-256, PBKDF2, HMAC)
- `zod` - Runtime validation and schema definition
- `next-themes` - Dark/light theme management
- `sonner` - Toast notifications
- `lucide-react` - Icon library

### Security Documentation

- [SECURITY.md](SECURITY.md) - Detailed cryptographic implementation specification

## 🤝 Contributing

### Before Contributing

1. Read this guide thoroughly
2. Set up development environment
3. Run existing tests
4. Understand the architecture

### Code Standards

- **TypeScript** - All code must be typed
- **ESLint** - Must pass linting
- **Formatting** - Follow Prettier config
- **Testing** - Add tests for new features
- **Documentation** - Update docs for API changes

### Pull Request Checklist

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for features
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] No linting errors
- [ ] Self-reviewed code

## 📞 Support & Questions

For questions or issues:

1. Check existing documentation
2. Review related code and tests
3. Search GitHub issues
4. Create new issue with details

---

**Remember:** VaultHub is a security-focused, stateless encryption platform. Every decision should prioritize user security and data privacy.
