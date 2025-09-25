# @solutioniser/create-next-starter

A CLI tool to create Next.js starter applications with optional authentication providers and tooling overlays.

## Installation

```bash
npm install -g @solutioniser/create-next-starter
```

## Usage

### Interactive Mode

```bash
create-next-starter
```

This will prompt you for:

- Project name
- Package manager (pnpm, npm, yarn, bun)
- Authentication provider (none, authjs, clerk, auth0, supabase, msal)
- Whether to include Storybook

### Non-Interactive Mode

```bash
create-next-starter my-app --provider authjs --storybook --pm pnpm
```

### Options

- `--name, -n`: Project name
- `--pm`: Package manager (pnpm, npm, yarn, bun)
- `--provider`: Authentication provider (none, authjs, clerk, auth0, supabase, msal)
- `--storybook`: Include Storybook
- `--yes, -y`: Skip prompts and use defaults

## Examples

```bash
# Create a basic Next.js app
create-next-starter my-app

# Create with Auth.js and Storybook
create-next-starter my-app --provider authjs --storybook

# Create with Clerk authentication
create-next-starter my-app --provider clerk

# Create with Supabase and pnpm
create-next-starter my-app --provider supabase --pm pnpm

# Skip all prompts
create-next-starter my-app --yes
```

## What It Creates

The CLI tool creates a complete Next.js application with:

1. **Base Template**: Modern Next.js setup with TypeScript, Tailwind CSS, testing, and development tooling
2. **Auth Overlay** (if selected): Authentication provider configuration and examples
3. **Storybook Overlay** (if selected): Component development setup
4. **Dependencies**: All required packages installed
5. **Git Repository**: Initialized with initial commit
6. **Environment Files**: Template files with provider-specific variables

## Next Steps

After creating your project:

1. `cd your-project-name`
2. Copy `env.example` to `.env.local`
3. Fill in your environment variables
4. `pnpm dev` to start development
5. Follow the provider-specific setup instructions in `README.addon.md`

## Development

To work on the CLI tool itself:

```bash
cd packages/create-next-starter
pnpm install
pnpm build
pnpm dev  # Watch mode
```
