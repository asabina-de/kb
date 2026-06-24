# Project Setup & Documentation Process

This guide provides a step-by-step process for setting up a new project using our standardized documentation and environment patterns.

## Quick Start Checklist

For every new project, follow these steps to ensure consistency.

### 1. Environment Setup (Recommended First Step)

We use a **direnv -> devenv** pattern for environment management. This provides a consistent, reproducible development environment while keeping secrets secure and local.

> [!WARNING]
> Avoid devenv's `dotenv.enable = true` option. It only supports basic `key=value` pairs and will cause frustration. Use `.envrc.local` for full bash support, including variable expansion (`${VAR}`) and command execution (`$(cmd)`).

**A. Copy Environment Files**

Copy the environment files from the knowledge base into your new project's root.

```bash
# Replace <path-to-kb> with the actual path to your kb checkout
cp <path-to-kb>/templates/.envrc .envrc
cp <path-to-kb>/templates/.envrc.local.example .envrc.local.example
```

`.envrc` is committed directly — it contains only direnv/devenv boilerplate, no secrets. Secrets go in `.envrc.local` (gitignored).

**B. Configure `.gitignore`**

Ensure secret files are never committed. Add them to your project's `.gitignore`.

```bash
echo "" >> .gitignore
echo "# Local secrets and overrides" >> .gitignore
echo ".envrc.local" >> .gitignore
```

> **Note:** Do NOT gitignore `.envrc` — it is committed. Only `.envrc.local` (which holds secrets) is gitignored.

**C. Allow Direnv**

On first clone (or after `.envrc` changes), `direnv` will prompt for permission.

```bash
direnv allow
```

**D. Set Up Local Secrets**

Each developer creates their own `.envrc.local` from the example:

```bash
cp .envrc.local.example .envrc.local
# Edit .envrc.local with your secrets (1Password refs, API keys, etc.)
```

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

### 4. GitHub Repository Settings

Configure these settings immediately after creating the repo. The defaults are footguns.

**A. Squash-merge commit message format**

Go to **Settings > Pull Requests > "Allow squash merging"** and change the dropdown from the default to **"Pull request title and description"** (or **"Pull request title and commit details"**).

The factory default uses the commit message for single-commit PRs but the PR title for multi-commit PRs. This inconsistency silently breaks commit-message conventions (e.g., `KB-28: Title (#42)` becomes `fix: whatever [ai:claude] (#42)` when a PR has exactly one commit). There are [multiple GitHub Community threads](https://github.com/orgs/community/discussions/6102) complaining about this — GitHub shipped the setting as a fix but left the broken default in place.

**B. Branch protection (recommended)**

For `main` / the default branch:
- Require pull request reviews before merging
- Require status checks to pass (once CI is configured)
- Do not allow bypassing the above settings

### 5. Pre-commit Hooks Setup (Optional but Recommended)

Set up automated code quality checks that run before commits:

**A. Copy Pre-commit Configuration**

```bash
cp <path-to-kb>/.pre-commit-config.yaml .pre-commit-config.yaml
```

**B. Install Pre-commit Hooks**

```bash
pre-commit install  # Sets up git hooks
```

**C. Pre-commit Strategy Recommendations**

Use a **hybrid approach** balancing accessibility and reliability:

**Auto-installing hooks** (recommended for most tools):

- Python-based tools (YAML validation, file formatters)
- Tools with reliable cross-platform packages
- Hooks that don't require complex build processes

```yaml
- repo: https://github.com/pre-commit/pre-commit-hooks
  rev: v4.4.0
  hooks:
    - id: trailing-whitespace
    - id: end-of-file-fixer
```

**Local hooks** (use when auto-install is problematic):

- Tools that have version lag in pre-commit mirrors
- Tools with complex build requirements (like Haskell/Cabal dependencies)
- Tools you want to version-control precisely via devenv

```yaml
- repo: local
  hooks:
    - id: your-tool
      name: your-tool
      entry: your-tool
      language: system # Uses PATH, requires manual install
      files: \.ext$
```

**D. devenv Integration**

If using devenv, include pre-commit dependencies in your `devenv.nix`:

```nix
{
  packages = with pkgs; [
    pre-commit
    python3           # Required by pre-commit for Python-based hooks
    your-local-tools  # Tools for local hooks (nixfmt, prettier, etc.)
  ];
}
```

**E. Documentation Requirements**

Make hook requirements clear in your README:

- List which tools require manual installation
- Provide install commands for both devenv and manual approaches
- Warn about "command not found" errors for local hooks

**Common Patterns:**

- **nixfmt**: Use local hook (remote requires cabal/ghc, often fails)
- **prettier**: Use local hook (mirrors lag behind official releases)
- **eslint**: Use local hook (project-specific config dependencies)
- **Python tools**: Use auto-installing hooks (reliable, fast to install)

### 6. Initial Documentation Setup

Copy the core documentation templates into your project.

```bash
# Create a docs directory
mkdir -p docs

# Copy templates
cp <path-to-kb>/templates/CHANGELOG.md ./
cp <path-to-kb>/templates/CONTRIBUTING.md ./
cp <path-to-kb>/templates/AGENTS.md ./
ln -s AGENTS.md CLAUDE.md       # Claude Code reads CLAUDE.md
ln -s AGENTS.md GEMINI.md       # Gemini reads GEMINI.md
cp <path-to-kb>/templates/GUIDELINES.md ./docs/
cp <path-to-kb>/templates/TODO.md ./docs/
cp -r <path-to-kb>/templates/decisions ./docs/
```

> **Note:** `CHANGELOG.md`, `CONTRIBUTING.md`, and `AGENTS.md` live at the repo root (GitHub convention / agent discovery), not in `docs/`.
> `CLAUDE.md` and `GEMINI.md` are symlinks to `AGENTS.md` — edit `AGENTS.md` and the others follow.

Refer to the main [Engineering Handbook (README.md)](./README.md) for the philosophy on when and how to use each of these documents.

### 7. Design Guide Setup (Optional)

If the project has a visual design component (UI, components, Figma integration), set up a `DESIGN.md` file. This follows the [DESIGN.md open spec](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md).

**Option A: Seed from an existing Figma file**

If the project already has a Figma file with defined styles and variables, use the [Figma-to-DESIGN.md plugin](https://github.com/bergside/design-md-figma) to generate a starter file:

1. Install the plugin in Figma
2. Run it on your project file — it extracts local styles into DESIGN.md format
3. Review and customize the generated file

**Option B: Start from the KB template**

```bash
cp <path-to-kb>/templates/DESIGN.md ./DESIGN.md
```

Then fill in the project-specific sections (marked with `<!-- PROJECT-SPECIFIC -->` comments):

- `## Brand & Style` — brand personality, target audience, ICP framing
- `## Colors` — semantic color palette (update YAML frontmatter tokens too)
- `## Typography` — type scale (update YAML frontmatter tokens too)
- `## Components` — project-specific component token mappings
- `## Do's and Don'ts` — project-specific guardrails

**Validation**

Use the [npm CLI](https://github.com/google-labs-code/design.md) to validate your file against the spec:

```bash
npx @google/design.md validate DESIGN.md
```

This checks YAML schema, WCAG contrast ratios, circular token references, and section ordering.

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

### First Decision Record

Copy the template and create your first decision record in `docs/decisions/`:

```bash
cp docs/decisions/0000-decision-template.md docs/decisions/0001-framework-selection.md
```

Edit the frontmatter and fill in the sections (Context, Exploration, Decision, Consequences, Confirmation). See [templates/decisions/README.md](./templates/decisions/README.md) for the full format reference and status vocabulary.

## Maintenance & Integration

For guidelines on maintaining documentation, integrating with Git, and CI/CD checks, please refer to the main [Engineering Handbook (README.md)](./README.md).

## Related Resources

- [Engineering Handbook (README.md)](./README.md)
- [Template Directory](./templates/) - All template files
