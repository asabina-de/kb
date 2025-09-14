# Engineering Handbook

This repo is our go to reference for engineering instructions. With agentic
tools, you should be able to locally navigate through the relevant details
using this tool.

> [!IMPORTANT]
> This README is the authoritative source for engineering standards and knowledge base usage. It contains comprehensive guidance for development workflow, tooling, and documentation standards that all projects should follow.

## Tooling

### Knowledge Base

Use this repo as the general knowledge base to keep things simple. Use
repo-specific READMEs at the right level of the repo's filetree to document
repo-specific details.

- Use [Mermaid
  diagrams](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams#creating-mermaid-diagrams)
  where you need to scribble

> [!TIP]
> In your project repos, symlink the `knowledge-base` directory to this repo, just to provide your AI tooling quick-access to this handbook. See our recommendation for [AGENTS.md](./templates/AGENTS.md) (with CLAUDE.md as a symlink) which includes references to the knowledge-base pattern.

#### Setting Up New Projects

**For new project documentation setup:** Follow the [PROJECT_SETUP_GUIDE.md](./PROJECT_SETUP_GUIDE.md) for step-by-step instructions on implementing our documentation standards and environment patterns in new repositories.

### Git

For the sake of convenience, **use git workspaces** such that you can make hotfixes without having to disrupt current work. Note that even stashing changes may be suboptimal at times since it requires a few manual actions to complete (especially if you don't want to stash everything).

> [!TIP]
> My first checkout goes to `$WORKFOLDER/${REPO_NAME}/worktree-NN` where `NN` is a number starting at `00`. This allows me to just start new workspaces by simply doing something like `git workspace add ../worktree-01 [-b] ${TARGET_BRANCH}` and be done with it. You just need to track what your next `NN` is when you are doing this on your setup but git should yell at you if the folder is already occupied.

Use **branch names from Linear** to allow for a consistent DX of auto-association of your branch to Linear tickets.

Prefer to merge stacks (multiple successive branches and their PRs) by merging the `HEAD` (tip). GitHub knows how to auto-mark the affected PRs as resolved.

### Linear

Use Linear for work tracking and planning.

#### Issue and Task Management

**Preferred: Use Linear for all tickets and tasks**

- File work items in [Linear](https://linear.app/asabina)
- Better delivery metrics, reporting, and team visibility
- Supports proper sprint planning and project tracking
- Use branch names from Linear for consistent linking

**GitHub Issues Integration**

- GitHub Issues can sync to Linear via [GitHub Issues Sync](https://linear.app/docs/github)
- **Requirement**: GitHub Issues Sync must be configured for the repository
- Only use GitHub Issues if Linear integration is properly set up
- Verify [Linear integration](https://linear.app/asabina/settings/integrations/github) has synchronization configured for relevant repos

**TODO.md Files - Emergency Escape Hatch**

- Use repository TODO.md files only for quick jot-and-forget tasks
- Intended to keep developers unblocked and maintain fast development flow
- **Important**: Migrate important tasks from TODO.md to Linear for proper tracking
- TODO files are not a substitute for formal project management

#### Linear vs GitHub Documentation Decision Framework

**Use Linear when:**

- Business strategy/positioning decisions
- Marketing/go-to-market decisions
- Team process/workflow choices
- Product prioritization rationale
- Cross-project organizational decisions

**Use GitHub/in-repo when:**

- Implementation-related (architecture, tech stack, APIs)
- Code-adjacent (deployment, testing, security patterns)
- Developer-facing (contributing guidelines, setup docs)
- Needs version control with code changes
- Agents/automation need access

**Key test:** _"Does this decision affect how code is written, deployed, or maintained?"_ -> GitHub. _"Is this about what to build or how to operate as a team?"_ -> Linear.

**Default rule:** When in doubt, use in-repo since it's more accessible to agents and developers.

### GitHub

Use GitHub as the default forge and define GitHub Actions for every new
project where relevant. A repo is only "fit" if it has a pipeline and some automated tooling
to check the health of the repo.

#### Setup

Remember to do the following for every repo:

- Populate your local config `git config edit --local` to
  - use your work email by setting `user.email` and
  - sign your commits using your work signing key in 1Password[^git-signing-1password]
- For every piece of work, start your topic branch using the [branch name provided by Linear](https://linear.app/changelog/2020-04-13-branch-naming).
- Push your PRs to merge into `main`
- Where relevant, review PRs individually but feel free to merge stacks into
  `main` when ready. GitHub is smart enough to detect when intermediate PRs in
  a stack have been merged into mainline and will mark those as merged as well.

For my personal config, I may configure the following:

```ini
[user]
  email = david@asabina.de

# Copied From 1Password snippet on YYYY-MM-DD
[user]
  signingkey = ssh-ed25519 [REDACTED]

[gpg]
  format = ssh

[gpg "ssh"]
  program = "/Applications/1Password.app/Contents/MacOS/op-ssh-sign"

[commit]
  gpgsign = true
```

[^git-signing-1password]: https://developer.1password.com/docs/ssh/git-commit-signing/#step-1-configure-git-commit-signing-with-ssh

#### GitHub Actions

We should seek to **answer the following in every pipeline**:

- **Does it read?** Is the code solid in terms of matching a standard?
- **Does it build?** Is the code valid as-in, does it compile or run?
- **Does it pass?** Are tests passing?

At a bare minimum this means that we have automated code quality scanning (like
static analysis or linting) set up to provide a basic stamp of approval that is
visible at the PR level for other reviewers. **Reviewers should not have to
check out the code and run some commands before they get feedback** on the
compliance of the code to some basic standards.

Regarding testing, even if you don't focus on coverage, make sure that the
tooling is at least present for others to write tests for things they
implement.

#### CI Optimization for Draft PRs

To save runner minutes on expensive operations, we use an **optimize_ci pattern** that prevents expensive jobs from running on draft PRs.

See the [CI workflow template](./templates/github-workflow-ci.yml) for a complete example with the `optimize_ci` pattern.

### Devenv.sh

Optionally, use [devenv](https://devenv.sh) to manage your dev environments.

#### Environment Variable Management Pattern

We use a **direnv -> devenv** pattern to manage environment variables. This provides a consistent, reproducible development environment while keeping secrets secure and local.

- **`devenv.nix`** defines shared, non-sensitive variables for the team.
- **`.envrc` and `.envrc.local`** (loaded by direnv) manage local configuration and secrets, with support for dynamic values from tools like 1Password.

For a complete, step-by-step guide to setting this up in a new project, see the **[Project Setup Guide](./PROJECT_SETUP_GUIDE.md#1-environment-setup-recommended-first-step)**.

#### Development Tools & Pre-commit Hooks

This repository includes automated code quality tools that run via git hooks:

**Formatting & Linting:**

- **nixfmt-rfc-style**: Formats Nix code according to RFC standards
- **prettier**: Formats JavaScript, TypeScript, JSON, and Markdown files
- **markdown-link-check**: Validates all markdown links are working
- **pre-commit-hooks**: Checks YAML, fixes end-of-file and removes trailing whitespace

**Pre-commit Commands:**

```bash
# Run all hooks on all files (recommended before pushing)
pre-commit run --all-files

# Run specific hook on all files
pre-commit run prettier --all-files
pre-commit run nixfmt --all-files
pre-commit run markdown-link-check --all-files
pre-commit run pre-commit-hooks --all-files

# Hooks run automatically on commit, but you can skip with --no-verify
git commit --no-verify  # Skip hooks (not recommended)
```

**Manual Commands:**

```bash
# Format specific files
prettier --write file.md
nixfmt devenv.nix
```

> [!NOTE]
> Since we don't manage markdown-link-check through our devenv, you have to install markdown-link-check yourself to use its CLI tool. Using `pre-commit run markdown-link-check` would be the recommended way without having to think about installing it yourself.

**Setup Architecture:**

Our pre-commit setup uses a **hybrid approach** balancing accessibility and reliability:

- **Auto-installing hooks** (YAML check, markdown link validation) - work for everyone out-of-the-box
- **Local hooks** (nixfmt, prettier) - require tools to be available in PATH:
  - **devenv users**: Tools provided automatically by `devenv.nix`
  - **non-devenv users**: Must install tools manually

**For non-devenv users:** Install required tools:

- `nixfmt`: `nix-env -iA nixpkgs.nixfmt-rfc-style` (or `brew install nixfmt` if available)
- `prettier`: `npm install -g prettier`

**Without these tools installed, the local hooks will fail** with "command not found" errors.

See the [Project Setup Guide](./PROJECT_SETUP_GUIDE.md) for instructions on including these in your project.

### GCP, Vercel, Sonar

- **GCP**: Default PaaS or IaaS.
- **Vercel**: For simple front-ends or NextJS apps.
- **Sonar**: For static analysis and code quality monitoring.

## Documentation Standards

Every project should maintain consistent documentation using our **structured and pragmatic documentation approach**. Create documents only when you actually need them.

### Core Documentation Files

_Ordered by developer workflow relevance_

- **README.md** (`./README.md`) - Project Foundation
- **GUIDELINES.md** (`./docs/GUIDELINES.md`) - Development Standards and Best Practices
- **TODO.md** (`./docs/TODO.md`) - Task Management using Now/Next/Later/Never Framework
- **design-notes/** (`./docs/design-notes/`) - Design Iteration and System Models
  - **Filename Convention**: `YYYY-MM-DD.STATE.description.md` (e.g. `2025-09-08.WIP.api-design.md`)
  - **Front Matter**: Each file includes a `title` and a list of `tags` to aid discovery for cross-cutting concerns.
  - **Status Log**: Table-based tracking of status changes with date, author, tickets, and notes
  - Used as a scratchpad for evolving ideas. The `STATE` in the filename and Status Log table track lifecycle changes.
- **decisions/** (`./docs/decisions/`) - Architecture Decision Records (ADR)
  - **Filename Convention**: `YYYY-MM-DD.STATE.description.md`
  - **Front Matter**: Includes `title` and `tags`.
  - Immutable snapshots of final decisions, often graduated from a `DONE` design note.
- **LINTING_FORMATTING.md** (`./docs/LINTING_FORMATTING.md`) - Code Quality Standards _(conditional)_
- **AGENTS.md** (`./AGENTS.md`) - AI agent guidelines _(conditional)_

### When to Create Each Document

- **Start with essentials**:
  - **README.md**: Every project foundation.
  - **GUIDELINES.md**: When README outgrows itself or team needs coding standards.
- **Add as workflow demands**:
  - **TODO.md**: When you need a repo-specific scratchpad.
  - **design-notes/**: When exploring complex designs.
  - **decisions/**: When graduating mature designs from `design-notes/`.
  - **LINTING_FORMATTING.md**: Only when team size or complexity demands a separate file.
  - **AI Guidance**: When using AI development tools (`AGENTS.md`).

See [templates/](./templates/) directory for starter templates of each document type.

### Documentation Principles

- **Single Responsibility**: Each document has a clear, focused purpose
- **Example-Driven**: Concrete implementations alongside abstract concepts
- **Cross-Referenced**: Explicit links between related documentation
- **Living Documents**: Regular updates with TODO tracking
- **Production Focus**: Explicit attention to operational readiness

## FAQ

### Why not use a wiki?

- **Version control**: Docs live with code, evolve together
- **Accessibility**: Plain text, readable in any editor
- **Discoverability**: Searchable with standard code tools
- **Automation**: Easy to lint, validate, and process with scripts
- **Agent-friendly**: Simple for AI tools to parse and understand

### How to handle diagrams?

- **Embed Mermaid syntax** directly in markdown files
- GitHub renders them automatically
- Keeps diagrams version-controlled with related documentation

### How to avoid documentation rot?

- **Integrate into workflow**: Update docs as part of feature development
- **Regular reviews**: Weekly TODO updates, monthly guideline reviews
- **PR templates**: Include documentation update checklists
- **CI checks**: Validate links and diagram syntax automatically

## Contributing

See [GUIDELINES.md](./templates/GUIDELINES.md) for detailed contribution standards.

---

[^1]: https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams#creating-mermaid-diagrams

[^2]: https://linear.app/changelog/2020-04-13-branch-naming

[^3]: https://developer.1password.com/docs/ssh/git-commit-signing/#step-1-configure-git-commit-signing-with-ssh

[^4]: https://devenv.sh

[^5]: https://nix.dev/tutorials/nix-language.html

[^6]: https://search.nixos.org/packages

[^7]: https://docs.sonarsource.com/sonarqube-server/9.9/project-administration/defining-new-code/

[^8]: https://docs.github.com/en/actions/managing-workflow-runs/skipping-workflow-runs

[^9]: https://linear.app/docs/github

[^10]: https://linear.app/asabina/settings/integrations/github

[^11]: https://github.com/asabina-de/notumo-music-school-poc/blob/main/.github/workflows/test.yml

[^12]: ./templates/github-workflow-ci.yml

[^13]: ./templates/AGENTS.md

[^14]: ./templates/README.md

[^15]: ./PROJECT_SETUP_GUIDE.md

[^16]: ./templates/

[^17]: ./templates/GUIDELINES.md
