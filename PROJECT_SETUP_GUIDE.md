# Project Setup & Documentation Process

This guide provides a step-by-step process for setting up a new project using our standardized documentation and environment patterns.

## Quick Start Checklist

For every new project, follow these steps to ensure consistency.

### 1. Environment Setup (Recommended First Step)

We use a **direnv -> devenv** pattern for environment management. This provides a consistent, reproducible development environment while keeping secrets secure and local.

> [!WARNING]
> Avoid devenv's `dotenv.enable = true` option. It only supports basic `key=value` pairs and will cause frustration. Use `.envrc.local` for full bash support, including variable expansion (`${VAR}`) and command execution (`$(cmd)`).

**A. Copy Environment Templates**

Copy the example files from the knowledge base into your new project's root.

```bash
# Example assumes knowledge-base is cloned next to your project
cp ../kb/templates/.envrc.example .envrc.example
cp ../kb/templates/.envrc.local.example .envrc.local.example
```

**B. Create Working Environment Files**

Instruct developers to create their own working files from the examples.

```bash
cp .envrc.example .envrc
cp .envrc.local.example .envrc.local
```

**C. Configure `.gitignore`**

Ensure local environment files are never committed. Add them to your project's `.gitignore`.

```bash
echo "" >> .gitignore
echo "# Local environment files" >> .gitignore
echo ".envrc" >> .gitignore
echo ".envrc.local" >> .gitignore
```

**D. Allow Direnv**

Once `.envrc` is present, `direnv` will prompt for permission on first entry into the directory.

```bash
direnv allow
```

This command loads the environment and integrates with `devenv` as configured in the template.

**E. Customize for Your Project**

- **Shared Variables:** Edit `devenv.nix` to include non-sensitive, team-wide environment variables.
- **Local Secrets:** Edit `.envrc.local.example` to document the required secrets and local overrides for your project. Developers will use this to populate their own `.envrc.local`.

### 2. Git Configuration

Ensure every contributor's commits are properly attributed and signed. For each new repository, configure your local Git settings using `git config edit --local`.

- **User Email:** Set your work email address via the `user.email` property.
- **Commit Signing:** We recommend using 1Password to manage SSH keys for signing commits. For the complete setup, follow the official [1Password guide on Git commit signing](https://developer.1password.com/docs/ssh/git-commit-signing/).

### 3. Setup Verification

Include setup verification instructions in your project's `README.md` to ensure developers properly configure their environment. Key verification points:

1.  **Git configuration** - Verify commits are properly signed and attributed.
2.  **Development environment** - Verify `devenv` and `direnv` are active and tools are available.
3.  **Quality tools** - Verify linting, testing, and build commands work.

See the [README template](./templates/README.md#setup-verification) for complete setup verification examples that you can customize for your project.

### 4. Initial Documentation Setup

Copy the core documentation templates into your project.

```bash
# Create a docs directory
mkdir -p docs

# Copy templates
cp ../kb/templates/GUIDELINES.md ./docs/
cp ../kb/templates/TODO.md ./docs/
cp -r ../kb/templates/decisions ./docs/
cp -r ../kb/templates/design-notes ./docs/
```

Refer to the main [Engineering Handbook (README.md)](./README.md) for the philosophy on when and how to use each of these documents.

## Template Customization Guide

### 1. GUIDELINES.md Customization

**For React Projects:**

```bash
# Keep: React/TypeScript sections
# Remove: Vue/Angular specific content
# Add: Your specific React patterns (hooks, context usage)
```

**For Node.js Backend:**

```bash
# Keep: Error handling, logging, security sections
# Remove: Frontend-specific content
# Add: API design patterns, database patterns
```

### 2. TODO.md Initial Setup

Replace template tasks with your project needs:

```markdown
## Now (Active Work)

- [ ] Initialize project structure
- [ ] Set up CI/CD pipeline
- [ ] Configure development environment
- [ ] Implement basic authentication
- [ ] Create initial database schema

## Next (Up Coming)

- [ ] Set up error monitoring (like Sentry)
- [ ] IaC
- [ ] Configure logging infrastructure
- [ ] Set up health check endpoints
- [ ] Implement security headers
- [ ] Configure backup strategy
```

### DECISIONS.md First Entry

Document your first major decision in the `docs/decisions` directory, using the template.

```markdown
### 2024-01-15 - Framework Selection

**Decision**: Use Next.js with TypeScript for the web application.

**Context**: Need to build a full-stack web application with both static and dynamic content...

**Rationale**:

- Built-in SSR/SSG capabilities
- Excellent TypeScript support
- Large ecosystem and community
- Team familiarity
```

## Maintenance & Integration

For guidelines on maintaining documentation, integrating with Git, and CI/CD checks, please refer to the main [Engineering Handbook (README.md)](./README.md).

## Related Resources

- [Engineering Handbook (README.md)](./README.md)
- [Template Directory](./templates/) - All template files
