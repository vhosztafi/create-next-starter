# Create Next.js Starter

A CLI tool to create Next.js starter applications with optional authentication providers.

## Features

- 🚀 Quick Next.js project setup
- 🔐 Multiple authentication providers (Auth.js, Clerk, Auth0, Supabase, MSAL)
- 📚 Optional Storybook integration
- 🎨 Tailwind CSS pre-configured
- 📦 Multiple package manager support (pnpm, npm, yarn, bun)
- 🔧 TypeScript support
- 🧪 Testing setup (Vitest, Playwright)
- 📝 Linting and formatting configured

## Installation

```bash
npm install -g @solutioniser/create-next-starter
```

## Usage

```bash
# Interactive mode
npx @solutioniser/create-next-starter

# With project name
npx @solutioniser/create-next-starter my-app

# With options
npx @solutioniser/create-next-starter my-app --provider supabase --storybook

# Use specific template version
npx @solutioniser/create-next-starter my-app --template-tag v1.2.3
```

## Options

- `--provider <provider>` - Authentication provider (none, authjs, clerk, auth0, supabase, msal)
- `--storybook` - Include Storybook
- `--pm <package-manager>` - Package manager (pnpm, npm, yarn, bun)
- `--template-tag <tag>` - Template version to use (defaults to latest)
- `-y, --yes` - Skip prompts and use defaults

## Authentication Providers

- **None** - No authentication setup
- **Auth.js** - NextAuth.js with multiple providers
- **Clerk** - Modern authentication platform
- **Auth0** - Enterprise authentication
- **Supabase** - Open source Firebase alternative
- **MSAL** - Microsoft Authentication Library for Azure AD

## Development

```bash
# Install dependencies
pnpm install

# Build the CLI
pnpm build

# Test locally
node dist/index.js my-test-app
```

## Publishing

```bash
# Version and publish
pnpm version:patch  # or minor, major, alpha, beta, rc
```

## License

MIT
