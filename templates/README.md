# Project Name

Brief description of what this project does.

> [!IMPORTANT]
> This README is the authoritative source for project setup and development. It contains comprehensive instructions for getting started, environment configuration, and development workflow. Other files (AGENTS.md, docs/) provide specialized guidance but reference this README for detailed setup procedures.

## Features

- Feature 1
- Feature 2
- Feature 3

## Getting Started

### Prerequisites

- Node.js >= 18 (provided via devenv - see devenv.nix)
- Additional prerequisites as needed

See [Setup](#setup) for instruction on how to setup your development environment.

## Usage

### Install

```bash
# Add your package manager install command
npm install
# or
pnpm install
# or
yarn install
```

### Run locally

```bash
# Add your development server command
npm run dev
# or
pnpm run dev
```

### Running tests

```bash
# Add your test commands
npm run test
```

### Building

```bash
# Add your build commands
npm run build
npm run lint
```

## Setup

This project uses **devenv** and **direnv** to manage development environments, ensuring consistent tooling and dependencies across all developers without affecting your host system.

- **[Devenv](https://devenv.sh/)**: Provides a reproducible development environment with all necessary tools and dependencies. [Installation guide](https://devenv.sh/getting-started/)
- **[Direnv](https://direnv.net/)**: Automatically loads the project's development environment when you enter the directory. [Installation guide](https://direnv.net/docs/installation.html)

### Environment Setup

This project uses the **direnv -> devenv loading chain** for environment management:

> [!WARNING]
> Avoid devenv's `dotenv.enable = true` option: It only supports basic `key=value` pairs without variable expansion (`${VAR}`) or command execution (`$(cmd)`). This differs from standard dotenv libraries and will frustrate developers. Use `.envrc.local` instead for full bash support.

**File Roles:**

- **`.envrc`**: Base configuration template (copied from `.envrc.example`, gitignored)
- **`.envrc.local`**: Personal secrets and local overrides (copied from `.envrc.local.example`, gitignored)

Once you have devenv and direnv installed:

1. **Set up your local environment** by copying the provided template:

   ```bash
   cp .envrc.example .envrc  # Copy the template to create your working environment file
   direnv allow              # Grant direnv permission to load the environment
   ```

   The included `.envrc.example` template provides:

   - Timeout configuration to prevent direnv hangs during long operations
   - Auto-watch functionality for `.envrc.local` changes (secrets reload automatically)
   - Seamless integration with devenv for reproducible development environment

2. **Configure local environment variables**:

   ```bash
   cp .envrc.local.example .envrc.local
   # Edit .envrc.local with your actual secrets and local configuration
   ```

3. **Environment activation**:
   - **Automatic**: Direnv activates the devenv shell when you `cd` into the project
   - **Manual**: If needed, run `devenv shell`

### Setup Verification

After completing the environment setup, verify your development environment is correctly configured:

#### 1. Git Configuration Verification

Ensure your commits are properly signed and attributed:

```bash
# Verify your git identity
git config --list --local | grep user

# Expected output should show your work email and signing key:
# user.email=your.name@company.com
# user.signingkey=ssh-ed25519 AAAAC3...

# Verify signing is enabled
git config --get commit.gpgsign  # Should return: true

# Test commit signing (creates a test commit and verifies signature)
echo "test" > .git-test && git add .git-test
git commit -m "test: verify git signing works"
git log --show-signature -1  # Should show "Good signature"
git reset HEAD~1 && git rm .git-test  # Clean up test
```

**If configuration is missing:**

- Set up your local git config following the [knowledge-base git setup guide](https://github.com/asabina-de/kb?tab=readme-ov-file#setup)
- Configure commit signing with your SSH key from [1Password](https://developer.1password.com/docs/ssh/git-commit-signing/#step-1-configure-git-commit-signing-with-ssh) or your preferred key manager

#### 2. Development Environment Verification

Verify your devenv/direnv setup is working correctly:

```bash
# Verify direnv loaded the environment
echo $DIRENV_WARN_TIMEOUT  # Should show: 20s

# Verify devenv is active (check if devenv-provided tools are available)
which node  # Should point to devenv's node, not system node
node --version  # Should match version specified in devenv.nix

# Test basic development commands work
[Add your project-specific verification commands here, examples:]
npm run lint --help    # Verify linter is available
npm run test --help    # Verify test runner is available
npm run build --help   # Verify build tools are available
```

**If verification fails:**

- Ensure you've run `direnv allow` in the project directory
- Try manually activating: `devenv shell`
- Check devenv logs: `devenv info`

> [!NOTE]
> This project uses **.envrc.local** for local environment variables. All working environment files (`.envrc` and `.envrc.local`) contain your personal configuration and are gitignored. Only the `*.example` files (`.envrc.example`, `.envrc.local.example`) are committed to help teammates understand what configuration is needed.

For complete environment management documentation, see [knowledge-base environment setup guide](https://github.com/asabina-de/kb?tab=readme-ov-file#environment-variable-management-pattern).

### Alternative Dependency Management

While this project is designed to work with devenv/direnv, you can choose to manage dependencies manually if preferred:

**Pros of devenv/direnv:**

- Guaranteed consistent environment across all developers
- Automatic dependency management
- Isolated from host system changes
- Easy onboarding for new team members

**Cons of devenv/direnv:**

- ⚠️ **Nix learning curve**: Troubleshooting Nix issues can be complex for newcomers
- ⚠️ **Package availability**: Adding tools not in nixpkgs requires custom packaging knowledge
- ⚠️ **Build times**: Initial Nix builds can be slow
- ⚠️ **Storage overhead**: Nix store can consume significant disk space

**Pros of manual management:**

- Use your existing tooling setup
- More control over specific versions
- Familiar troubleshooting when issues arise
- No Nix complexity to learn

**Cons of manual management:**

- ⚠️ **Configuration drift**: Your environment may differ from other developers
- ⚠️ **Dependency issues**: Missing or incompatible tool versions may cause build failures
- ⚠️ **Debugging complexity**: Environment-related issues become harder to reproduce across team
- ⚠️ **Onboarding friction**: New team members will have inconsistent setup experiences

**If you choose manual management**, ensure you have:

- Node.js >= 18 (or version specified in devenv.nix)
- Package manager (npm/pnpm/yarn)
- Git and any other tools specified in `devenv.nix`

> [!IMPORTANT]
> Recommendation: Use devenv/direnv for consistency, but manual management is a valid choice if you prefer to avoid Nix complexity.

## Dependencies

- List key dependencies here
- Include links to documentation where helpful

## Documentation & Development Process

This project maintains focused documentation to support both human developers and AI agents:

### Documentation Structure

- **[TODO.md](./TODO.md)** - Active task list and production readiness items
- **[decisions/](./decisions/)** - Architecture decisions with rationale and trade-offs
- **[GUIDELINES.md](./GUIDELINES.md)** - Development patterns and coding standards
- **[AGENTS.md](./AGENTS.md)** - Guidelines for AI agents working on this codebase
- **[CLAUDE.md](./CLAUDE.md)** - Claude-specific instructions and workflow

### Design Process

1. **Early Ideation**: Document ideas and proposals in `design-notes/`
2. **RFC Process**: Use PRs with `design` or `rfc` labels for design discussions
3. **Decision Recording**: Move finalized decisions to `decisions/` with full context
4. **Implementation Guidelines**: Update `GUIDELINES.md` with patterns and standards

This approach enables in-repo design through PRs rather than external knowledge bases.

## Development Quality Standards

Before committing code changes, ensure the following acceptance criteria are met:

### Pre-Commit Checklist

**Required Commands** (must pass before committing):

```bash
# 1. Code formatting
[Add your formatter command, examples:]
npm run format        # or: prettier --write .
# or: go fmt ./...
# or: black .

# 2. Linting
[Add your linter command, examples:]
npm run lint         # or: eslint .
# or: golangci-lint run
# or: ruff check .

# 3. Type checking (if applicable)
[Add your type checker command, examples:]
npm run type-check   # or: tsc --noEmit
# or: mypy .

# 4. Tests
[Add your test command, examples:]
npm run test         # or: pytest
# or: go test ./...
# or: cargo test

# 5. Build verification
[Add your build command, examples:]
npm run build        # or: go build
# or: cargo build --release
```

**Automated Pre-Commit Hooks** (if configured):

- If pre-commit hooks are set up, they will run automatically on `git commit`
- To run manually: `pre-commit run --all-files`
- To bypass (emergency only): `git commit --no-verify`

**Manual Quality Checks** (when pre-commit hooks are not available):

```bash
# Run all checks in sequence
npm run format && npm run lint && npm run type-check && npm run test && npm run build

# Alternative: Create a verification script
./scripts/verify.sh  # If available in this project
```

### Commit Standards

- Follow conventional commit format: `type(scope): description`
- Keep commit titles under 80 characters (including `[ai:agent-name]` tag)
- Include descriptive body for non-trivial changes
- Reference issue numbers when applicable

**Example commit message:**

```
feat(auth): add OAuth2 integration with Google [ai:claude]

- Implement OAuth2 flow for Google authentication
- Add user session management with JWT tokens
- Update login UI with Google sign-in button

Resolves: #123
```

## License

MIT
