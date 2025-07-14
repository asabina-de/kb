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

### Environment Activation

Once you have devenv and direnv installed:

1. **Automatic activation**: Direnv will automatically activate the devenv shell when you `cd` into the project directory
2. **Manual activation**: If automatic activation doesn't work, you can manually enter the development shell:
   ```bash
   devenv shell
   ```

> [!Important] > **Recommended**: Use `.envrc.local` for local configuration when using devenv. This supports dynamic secrets and variable expansion, which devenv handles better than `.env` files.

> [!Note]
> If you prefer `.env` files, copy `.env.example` if it exists and customize for your local setup. However, devenv's dotenv only supports simple `key=value` pairs.

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
