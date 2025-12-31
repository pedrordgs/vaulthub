# VaultHub Development Guide

## Core Principles

1. **Security First** - All sensitive operations server-side
2. **Stateless Design** - No data persistence
3. **Type Safety** - Strict TypeScript
4. **Modern Stack** - Next.js App Router, React Server Components

## Project Structure

```
app/              # Next.js App Router
├── actions/      # Server actions
components/       # React components
├── ui/          # Base UI (shadcn/ui)
├── vault/       # Vault components
lib/              # Utilities
├── vault/       # Encryption/decryption logic
```

## Security Rules

- ❌ **NEVER** log passwords or secrets
- ✅ **ALWAYS** process encryption/decryption server-side
- ✅ **ALWAYS** validate input (use Zod)
- ✅ **ALWAYS** sanitize error messages

## Component Patterns

**Default to Server Components**, use Client Components only when needed:

```typescript
// ✅ Server Component (default)
export default function Layout({ children }) {
  return <div>{children}</div>;
}

// ✅ Client Component (only when needed)
'use client';
export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

## Server Actions Pattern

```typescript
'use server';
import { z } from 'zod';

const schema = z.object({
  plainText: z.string().min(1),
  password: z.string().min(1),
});

export async function encryptVaultString(prevState: unknown, formData: FormData) {
  try {
    const validated = schema.parse({
      plainText: formData.get('plainText'),
      password: formData.get('password'),
    });
    const encrypted = await encrypt(validated.plainText, validated.password);
    return { success: true, encrypted };
  } catch (error) {
    return { success: false, error: 'Encryption failed' };
  }
}
```

## Styling

- Use Tailwind CSS utility classes
- Mobile-first responsive design
- Use CSS variables for theming

## Testing

- Unit tests for encryption/decryption logic
- Integration tests for server actions
- Type tests via TypeScript compilation

## Deployment

- **Vercel**: Automatic on push to main
- **Docker**: Multi-stage build, Node.js 20 Alpine
- No environment variables required

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev/)
- [SECURITY.md](SECURITY.md) - Cryptographic specification
