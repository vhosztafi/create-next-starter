# GitHub Workflows

This directory contains GitHub Actions workflows for the create-next-starter CLI tool.

## Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- GitHub releases

**Jobs:**

- **Validate**: Runs linting, type checking, tests, and builds the package
- **Publish**: Publishes to npm when a release is created or version is bumped
- **Security Audit**: Runs security audit on dependencies
- **Update Dependencies**: Weekly automated dependency updates (optional)

### 2. Release Workflow (`release.yml`)

**Triggers:**

- Manual workflow dispatch

**Features:**

- Interactive version bumping (patch, minor, major, alpha, beta, rc)
- Automatic git tagging
- GitHub release creation
- Build verification before release

## Setup Instructions

### 1. NPM Token Setup

1. Go to [npmjs.com](https://www.npmjs.com) and log in
2. Go to Access Tokens → Generate New Token
3. Select "Automation" token type
4. Copy the token
5. In your GitHub repository, go to Settings → Secrets and variables → Actions
6. Add a new repository secret named `NPM_TOKEN` with your npm token

### 2. GitHub Token

The `GITHUB_TOKEN` is automatically provided by GitHub Actions and doesn't need manual setup.

### 3. Repository Settings

Make sure your repository has the following settings:

- Branch protection rules on `main` branch
- Require status checks to pass before merging
- Require branches to be up to date before merging

## Usage

### Automatic Publishing

The package will be automatically published to npm when:

1. A GitHub release is created
2. A commit message contains `chore(release)` (for automated version bumps)

### Manual Release

1. Go to Actions tab in your GitHub repository
2. Select "Release" workflow
3. Click "Run workflow"
4. Choose the version bump type (patch, minor, major, alpha, beta, rc)
5. Click "Run workflow"

### Version Bumping

You can also use the npm scripts for version bumping:

```bash
# Patch version (0.1.0 → 0.1.1)
pnpm version:patch

# Minor version (0.1.0 → 0.2.0)
pnpm version:minor

# Major version (0.1.0 → 1.0.0)
pnpm version:major

# Prerelease versions
pnpm version:alpha  # 0.1.0 → 0.1.1-alpha.0
pnpm version:beta   # 0.1.0 → 0.1.1-beta.0
pnpm version:rc     # 0.1.0 → 0.1.1-rc.0
```

## Workflow Features

### Validation

- **Linting**: Code style and quality checks
- **Type Checking**: TypeScript compilation without emitting files
- **Testing**: Unit and integration tests
- **Build**: Compiles TypeScript to JavaScript
- **Build Verification**: Ensures build output is correct

### Publishing

- **Version Check**: Prevents publishing duplicate versions
- **Build**: Ensures latest code is built before publishing
- **NPM Publish**: Publishes to npm registry with public access
- **Release Notes**: Automatic GitHub release creation

### Security

- **Dependency Audit**: Checks for known vulnerabilities
- **Automated Updates**: Weekly dependency updates with PR creation

## Troubleshooting

### Common Issues

1. **Build Fails**: Check TypeScript compilation errors
2. **Publish Fails**: Verify NPM_TOKEN is set correctly
3. **Version Already Exists**: The workflow will skip publishing if version exists
4. **Permission Denied**: Ensure npm package name is available and you have publish rights

### Debugging

- Check the Actions tab for detailed logs
- Verify all secrets are set correctly
- Ensure package.json has correct name and version
- Check that the build output directory exists

## Customization

### Adding Tests

1. Install a testing framework (Jest, Vitest, etc.)
2. Update the `test` script in package.json
3. Add test files to your project
4. The workflow will automatically run tests

### Adding Linting

1. Install ESLint and Prettier
2. Update the `lint` script in package.json
3. Add configuration files (.eslintrc, .prettierrc)
4. The workflow will automatically run linting

### Modifying Triggers

Edit the `on:` section in workflow files to change when workflows run:

```yaml
on:
  push:
    branches: [main, develop, feature/*]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday
```
