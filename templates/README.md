# Project Name

Brief description of what this project does.

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

This project uses the **direnv → devenv → dotenv pattern** for environment management. Once you have devenv and direnv installed:

1. **Set up your local environment** by copying the example files:

   ```bash
   cp .envrc.example .envrc
   direnv allow
   ```

2. **Configure environment variables** (choose the approach this project uses):

   **If this project uses .envrc.local approach**:

   ```bash
   cp .envrc.local.example .envrc.local
   # Edit .envrc.local with your actual secrets/dynamic values
   ```

   **If this project uses .env approach**:

   ```bash
   cp .env.example .env
   # Edit .env with your actual static values
   ```

3. **Environment activation**:
   - **Automatic**: Direnv activates the devenv shell when you `cd` into the project
   - **Manual**: If needed, run `devenv shell`

> [!NOTE]
> This project uses [**specify: .envrc.local OR .env approach**] for local environment variables. Your working files (`.envrc.local` or `.env`) contain personal configuration and are gitignored. Only the `.example` files are committed to help teammates understand what variables are needed.

For complete environment management documentation, see [knowledge-base environment setup guide](./knowledge-base/README.md#environment-variable-management-pattern).

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

> [!IMPORTANT] > **Recommendation**: Use devenv/direnv for consistency, but manual management is a valid choice if you prefer to avoid Nix complexity.

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

## License

MIT
