# Engineering Handbook

This repo is our go to reference for engineering instructions. With agentic
tools, you should be able to locally navigate through the relevant details
using this tool.

## Tooling

### Knowledge Base

Use this repo as the general knowledge base to keep things simple. Use
repo-specific READMEs at the right level of the repo's filetree to document
repo-specific details.

- Use [Mermaid
  diagrams](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams#creating-mermaid-diagrams)
  where you need to scribble

> [!TIP]
> In your project repos, symlink the `knowledge-base` directory to this repo, just to provide your AI tooling quick-access to this handbook. See our recommendation for [AGENTS.md](./templates/AGENTS.md) and [CLAUDE.md](./templates/CLAUDE.md) which does include references to the knowledge-base trick.

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

**Key test:** _"Does this decision affect how code is written, deployed, or maintained?"_ → GitHub. _"Is this about what to build or how to operate as a team?"_ → Linear.

**Default rule:** When in doubt, use in-repo since it's more accessible to agents and developers.

### GitHub

Use GitHub as the default forge and define GitHub Actions for every new
project where relevant. A repo is only "fit" if it has a pipeline and some automated tooling
to check the health of the repo.

#### Setup

Remember to do the following for every repo:

- Populate your local config `git config edit --local` to
  - use your work email and
  - sign your commits using your work signing key in 1Password[^git-signing-1password]
- For every piece of work, start your topic branch using the [branch name provided by Linear](https://linear.app/changelog/2020-04-13-branch-naming).
- Push your PRs to merge into `main`
- Where relevant, review PRs individually but feel free to merge stacks into
  `main` when ready. GitHub is smart enough to detect when intermediate PRs in
  a stack have been merged into mainline and will mark those as merged as well.

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

To save runner minutes on expensive operations (builds, integration tests), use the **optimize_ci pattern**:

> [!NOTE]
> Credit to whom credit is due: we learned this pattern from our short stint with Graphite and fell in love with it.

```yaml
optimize_ci:
  # Don't run expensive jobs on draft PRs to save on runner minutes.
  # On manual runs this job is skipped and expensive jobs will run.
  if: github.event_name == 'pull_request' && github.event.pull_request.draft == false
  runs-on: ubuntu-latest
  steps:
    - name: Gate for expensive CI jobs
      run: echo "Running expensive CI jobs on non-draft PR"

expensive_job:
  needs: [optimize_ci]
  # Run expensive jobs if: optimize_ci succeeded (non-draft PR) OR manual workflow dispatch
  # The always() ensures this job evaluates even when optimize_ci is skipped
  if: always() && (github.event_name == 'workflow_dispatch' || needs.optimize_ci.result == 'success')
```

**Key Benefits:**

- Saves significant runner minutes on mobile builds and integration tests
- Lightweight jobs (linting, unit tests) still provide quick feedback on drafts
- Manual workflow dispatch provides escape hatch for testing drafts
- Only gate the first expensive job in each dependency chain

**CI Skip Options:**

- **Draft PRs**: Expensive jobs automatically skipped, lightweight jobs run
- **Skip strings**: Use `[skip ci]`, `[ci skip]`, or `[no ci]` in commit messages ([GitHub docs](https://docs.github.com/en/actions/managing-workflow-runs/skipping-workflow-runs)). Note that skip strings are nuclear -- there is no way to manually trigger a CI run if a commit contains the skip string. Draft PRs are a bit more flexible in that sense.

See example pipelines and templates:

- https://github.com/asabina-de/notumo-music-school-poc/blob/main/.github/workflows/test.yml
- [CI workflow template](./templates/github-workflow-ci.yml) with optimize_ci pattern

### Devenv.sh

Optionally, use [devenv](https://devenv.sh) to manage your dev environments.

Benefits are:

- Declarative dev env. Helps us cover system deps such that folks don't end up finding in-the-heat-of-the-moment that there is a bunch of setup work they still need to do.
- Reproducible env. @vidbina uses the devenvs on Apple Silicon and Intel MBAs and spends much less time fiddling with managing packages now.
- Forces us to be more explicit about our environments and to think through tooling ergonomics issues sooner (e.g.: using miniconda over conda which adds some benefits since miniconda does less violence across the FHS to leave a lot system state that may be difficult to track)
- Parity of envs between devs to minimise "works on my machine" problems.
- Declared in Nix -- a powerful language for config definition.

Downsides:

- Declared in [Nix](https://nix.dev/tutorials/nix-language.html) -- a bit of an eccentric language which can be quite overwhelming to navigate at times.
- [Package repo (nixpkgs)](https://search.nixos.org/packages) may not contain latest-greatest of your target package and overriding this can be tricky (but probably not less tricky if brew doesn't have your target package either)
- Doesn't play ball very well with mixed approaches such as installing some things with nix and other manually, perhaps my dragging .dmgs into the Applications directory
- Removes agency from individual devs.

#### Environment Variable Management Pattern

Use the **direnv → devenv → dotenv** trifecta for comprehensive environment management:

**Tool Responsibilities:**

- **direnv**: Auto-loads project environment when entering directory + executes commands for secret retrieval
- **devenv**: Provides reproducible development environment with shared configuration
- **dotenv**: Handles local/static environment variables via `.env` files

**Setup Instructions:**

1. **Configure direnv** (`.envrc`):

   ```bash
   export DIRENV_WARN_TIMEOUT=20s

   # Watch .envrc.local for changes (auto-reload when it changes)
   [[ -f .envrc.local ]] && watch_file .envrc.local

   # Source optional user-specific secrets (gitignored)
   [[ -f .envrc.local ]] && source .envrc.local

   eval "$(devenv direnvrc)"
   use devenv
   ```

2. **Enable dotenv in devenv** (`devenv.nix`):

   ```nix
   {
     # Enable loading of .env files for local configuration
     dotenv.enable = true;

     # Shared environment variables (non-sensitive, team-wide)
     env = {
       NODE_ENV = "development";
       # Add other shared, non-sensitive variables here
       # For secrets and local overrides, use .env files
     };
   }
   ```

   > [!WARNING]
   > Devenv's dotenv implementation is basic - it only supports simple `key=value` pairs without variable substitution (`${VAR}`) or command expansion (`$(cmd)`). This differs from popular dotenv implementations in Node.js or Ruby that support variable expansion. See [devenv's dotenv source](https://github.com/cachix/devenv/blob/main/src/modules/dotenv.nix) for implementation details.

3. **Create `.env.example`** with documented variable templates:

   ```bash
   # =====================================================================
   # DEVENV DOTENV LIMITATIONS WARNING
   # =====================================================================
   # This .env file only supports simple key=value pairs.
   # Variable expansion (${VAR}) and command expansion ($(cmd)) do NOT work.
   #
   # If you need dynamic values, use .envrc.local instead:
   # - Dynamic secrets: export API_KEY=$(op read "op://vault/api/key")
   # - Variable expansion: export DATABASE_URL="postgres://user:${PASSWORD}@localhost/db"
   # =====================================================================

   # Copy this file to .env and customize for your local development
   # DATABASE_URL=postgresql://username:hardcoded_password@localhost:5432/dbname
   # API_ENDPOINT=https://api.example.com/v1/users
   # NODE_ENV=development
   ```

4. **Create `.envrc.local.example`** with dynamic secret templates:

   ```bash
   # =====================================================================
   # DYNAMIC SECRETS AND VARIABLE EXPANSION EXAMPLES
   # =====================================================================
   # Copy this file to .envrc.local and customize for your secret management setup.
   # This file demonstrates the dynamic values needed for this project.
   #
   # Choose your preferred secret management approach:
   # =====================================================================

   # Example: 1Password CLI
   export DB_PASSWORD=$(op read "op://vault/database/password")
   export API_BASE_URL="https://api.example.com"

   # Example: AWS SSM
   # export DB_PASSWORD=$(aws ssm get-parameter --name "/myapp/db-password" --with-decryption --query "Parameter.Value" --output text)
   # export API_BASE_URL=$(aws ssm get-parameter --name "/myapp/api-url" --query "Parameter.Value" --output text)

   # Example: GCP Secret Manager
   # export DB_PASSWORD=$(gcloud secrets versions access latest --secret="database-password")
   # export API_BASE_URL=$(gcloud secrets versions access latest --secret="api-base-url")

   # Example: Manual hardcoded values (least secure, but works)
   # export DB_PASSWORD="your_password_here"
   # export API_BASE_URL="https://api.example.com"
   ```

5. **Optional: Create `.envrc.local`** for your actual secrets (gitignored):
   Copy `.envrc.local.example` to `.envrc.local` and customize with your actual secret management commands.

**Choose Your Approach** (Keep it Simple):

**Recommendation: Pick ONE approach for your project to keep environment setup easy to reason about.**

**Option A: .envrc.local approach** (Recommended for dynamic secrets):

- Use `.envrc.local` for all local environment variables
- Supports command expansion: `$(op read "...")`, `$(aws ssm get-parameter ...)`
- Supports variable expansion: `${VAR}`
- More flexible for enterprise secret management

**Option B: .env approach** (Recommended for simple static values):

- Use `.env` for all local environment variables
- Simple `key=value` pairs only
- Easier for developers familiar with standard dotenv
- No command or variable expansion support

**Variable Precedence Order:**

1. **`.envrc.local`** OR **`.env`** (your chosen local config approach)
2. **`devenv.nix` env block** (shared team configuration)

**Key Guidelines:**

- **Shared, non-sensitive config**: Always use `devenv.nix` env block
- **Local config**: Choose either `.envrc.local` OR `.env` (not both)
- **Documentation**: Maintain example files for your chosen approach
- **Team consistency**: Document which approach your project uses in README
- **Security**: Add your chosen files to `.gitignore`

**When to Choose Which:**

- **Choose .envrc.local if**: You need dynamic secrets (1Password, AWS SSM, GCP Secret Manager) or variable expansion
- **Choose .env if**: You have simple static values and want standard dotenv behavior
- **Avoid mixing**: Don't use both `.envrc.local` AND `.env` in the same project

This pattern ensures consistent shared configuration while allowing secure local customization.

#### Development Tools & Pre-commit Hooks

This repository includes automated code quality tools that run via git hooks:

**Formatting & Linting:**

- **nixfmt-rfc-style**: Formats Nix code according to RFC standards
- **prettier**: Formats JavaScript, TypeScript, JSON, and Markdown files
- **markdown-link-check**: Validates all markdown links are working

**Pre-commit Commands:**

```bash
# Run all hooks on all files (recommended before pushing)
pre-commit run --all-files

# Run specific hook on all files
pre-commit run prettier --all-files
pre-commit run nixfmt-rfc-style --all-files
pre-commit run markdown-link-check --all-files

# Hooks run automatically on commit, but you can skip with --no-verify
git commit --no-verify  # Skip hooks (not recommended)
```

**Manual Commands:**

```bash
# Format specific files
prettier --write file.md
nixfmt devenv.nix
markdown-link-check README.md
```

> [!TIP]
> See [templates/README.md](./templates/README.md) for a complete project template with devenv/direnv setup instructions that you can copy for new projects.

### GCP

Use Google Cloud Platform as the default PaaS or IaaS. Reason being, we're
already in the Google ecosystem with Google Workspace. We're basically keeping
the toolbox simple.

### Vercel

Use Vercel where we need to host simple front-ends or NextJS apps (with
server-side logic).

### Sonar

- Use **Number of days** and set the days parameter to `30`. Keep in mind that
  the alternative setting as per 2025-06-26 (June) is _Preview version_ but the
  docs[^sonar-new-code] detail how it checks the version from build files like
  pom.xml and build.gradle or the `sonar.projectVersion` parameter, which we
  don't want to focus on setting. Downside and risk of the _Number of days_
  configuration is that we miss out on checks for really slow-moving projects.
- Define **Action secrets and variables** in GitHub (Settings > Secrets and variables > Actions):
  - `SONAR_ORGANIZATION` as a repository variable
  - `SONAR_PROJECT_KEY` as a repository variable
  - `SONAR_TOKEN` as a **repository secret**

Use the SonarSource/sonarqube-scan-action action to push data to SonarQube and trigger a scan and optionally refer to the block below for an scan step we had in one of our repos and highlights how we circumvented the use of sonar-project.properties:

```yaml
- name: SonarQube Scan
  uses: SonarSource/sonarqube-scan-action@v5
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
  with:
    # https://docs.sonarsource.com/sonarqube-cloud/advanced-setup/analysis-parameters/
    args: >
      -Dsonar.organization=${{ vars.SONAR_ORGANIZATION }}
      -Dsonar.projectKey=${{ vars.SONAR_PROJECT_KEY }}
      -Dsonar.javascript.lcov.reportPaths=test-reports/**/lcov.info
      -Dsonar.sources=src
      -Dsonar.tests=src,e2e
      -Dsonar.test.inclusions=src/**/*.test.ts,src/**/*.test.tsx,src/**/*.spec.ts,src/**/*.spec.tsx,e2e/**/*.test.ts,e2e/**/*.spec.ts
      -Dsonar.exclusions=src/**/*.test.ts,src/**/*.test.tsx,src/**/*.spec.ts,src/**/*.spec.tsx,src/**/*.stories.ts,src/**/*.stories.tsx,src/**/*.stories.mdx
      -Dsonar.verbose=false
```

> [!NOTE]
> The SonarQube GUI will recommend you to create a sonar-project.properties file, but for now we have just passed these details as options in our GH Actions step. Historically sonar-project.properties didn't support variables. As we didn't want to hardcode the project and project key magic strings into our codebase, we opted out of using the sonar-project.properties file but since that is no longer the limitation, there is no strong technical reason for avoiding sonar-project.properties. One pro of just doing it inline is that we just have 1 file to think about when reasoning about our sonar reporting setup, but a con is that the yaml file may not as easy to grok with all the `Dsonar.*` noise in the `with.args` block for the action.

[sonar-new-code]: https://docs.sonarsource.com/sonarqube-server/9.9/project-administration/defining-new-code/

### Graphite (deprecated)

We tried Graphite but stopped around 2025-06-26 (June) because the UI was
overwhelming. Best thing about it was the automatic restacking but with some
average git skills and the support of modern agentic dev tools, the pain around
the non-Graphite way of solving this is fairly minimal. In cases of long stacks
(trains), there is some manual effort, but it beats the Graphite DX of a top
merge, triggering the individual rebasing and merging of the PRs into main
where we actually just want to merge the top and be done with it.

## Documentation Standards

Every project should maintain consistent documentation using our **structured documentation approach**:

### Core Documentation Files

_Ordered by developer workflow relevance_

1. **README.md** (`./README.md`) - Project Foundation

   - Project overview, setup instructions, basic guidelines
   - Links to detailed documentation in `docs/` directory
   - Entry point for new developers and contributors
   - For small projects, may include basic linting/formatting setup

2. **GUIDELINES.md** (`./docs/GUIDELINES.md`) - Development Standards and Best Practices

   - Establishes coding standards and operational readiness patterns
   - Principle-first approach with practical examples
   - Testing strategy guidance and observability patterns
   - Engineering best practices and team workflows

3. **TODO.md** (`./docs/TODO.md`) - Task Management using Now/Next/Later/Never Framework

   - **Now**: Active work, being done this week/cycle
   - **Next**: Prioritized for upcoming work, next in line
   - **Later**: Important but not urgent, future consideration
   - **Never**: Decided against, with reasoning preserved
   - Repository-specific task scratchpad outside formal ticketing

4. **design-notes/** (`./docs/design-notes/`) - Design Iteration and System Models

   - **Individual design explorations** - one file per design concern to avoid git worktree conflicts
   - **Naming**: `YYYY-MM-DD.specific-topic-name.md` (e.g., `2024-01-15.user-authentication-strategy.md`)
   - **Scratchpad for evolving ideas** - iterate on designs until mature
   - Documents core system architecture using structured schemas
   - Progressive examples from basic to advanced usage
   - **Dual completion paths**:
     - **Path A**: Design-before-implementation workflow - early scribbles that mature into immutable architectural decisions
     - **Path B**: Living implementation documentation that evolves with the system (CI setups, process docs)
   - **Document nature**: Living, evolving documents (vs immutable decision records)
   - **Timing flexibility**: Can be created before OR after decisions are made to capture implementation observations
   - **Archive**: Move outdated explorations to `design-notes/ARCHIVE/`

5. **decisions/** (`./docs/decisions/`) - Architecture Decision Records (ADR)

   - **Individual decision records** - one file per decision to avoid git worktree conflicts
   - **Naming**: `YYYY-MM-DD.decision-title.md` (e.g., `2024-01-15.state-management-strategy.md`)
   - **Immutable snapshots** of formal decisions made at specific points in time
   - **Final decisions** graduated from design-notes/ exploration OR standalone formal decisions
   - Chronicles major technical decisions with full context and rationale
   - Date-stamped entries with clear decision statements
   - Includes trade-offs, benefits, and future considerations
   - **Should remain largely unchanged** once written (unlike living design notes)
   - **Archive**: Move superseded decisions to `decisions/ARCHIVE/`

#### GitHub-Native Decision Governance

**Use GitHub's built-in approval system for formal decision traceability:**

**CODEOWNERS Integration:**

```
# .github/CODEOWNERS
/docs/decisions/    @tech-lead @architect @security-team
/docs/design-notes/ @tech-lead
```

**Idiomatic GitHub Workflow:**

1. Create decision PR with status "Proposed"
2. CODEOWNERS automatically assigned as reviewers
3. Required approvals from designated decision makers
4. Update status to "Accepted" before merge
5. Merge PR via GitHub UI (creates merge commit on mainline)
6. Tag the merge commit: `git tag "decision/auth-strategy-v1" <merge-sha>`

**Decision Tags:**

```bash
# Tag mainline merge commits
git tag "decision/auth-strategy-v1" <merge-commit-sha>

# List decision tags
git tag -l "decision/*"
```

**Benefits:**

- GitHub's PR approval system provides formal sign-off
- Merge commits create immutable decision points
- Tags point to mainline (standard practice)
- Built-in audit trail via GitHub's interface
- No complex signing workflows required

6. **LINTING_FORMATTING.md** (`./docs/LINTING_FORMATTING.md`) - Code Quality Standards _(conditional)_

   - **Create only when team size or complexity demands it**
   - Tool specifications (ESLint, Prettier, etc.)
   - Configuration examples ready for copy-paste
   - For small projects: embed basics in README.md or GUIDELINES.md

### AI Guidance Files

For projects using AI development tools:

8. **AGENTS.md** (`./AGENTS.md`) - General AI agent guidelines

   - Development workflow and commit strategy
   - Documentation update patterns
   - Communication guidelines

9. **CLAUDE.md** (`./CLAUDE.md`) - Claude-specific instructions
   - References AGENTS.md for core guidelines
   - Claude-specific behaviors and tool usage

### Documentation Principles

- **Single Responsibility**: Each document has a clear, focused purpose
- **Example-Driven**: Concrete implementations alongside abstract concepts
- **Cross-Referenced**: Explicit links between related documentation
- **Living Documents**: Regular updates with TODO tracking
- **Production Focus**: Explicit attention to operational readiness

### When to Create Each Document

**Start with essentials:**

- **README.md**: Every project foundation - include basic linting setup for small projects
- **GUIDELINES.md**: When README outgrows itself or team needs coding standards

**Add as workflow demands:**

- **TODO.md**: When you need repo-specific scratchpad for gotchas/tech debt
- **design-notes/**: When exploring complex designs - create individual files to avoid git worktree conflicts
- **decisions/**: When graduating mature designs from design-notes/
- **LINTING_FORMATTING.md**: Only when team size or complexity demands separate file
- **AI Guidance**: When using AI development tools (AGENTS.md + CLAUDE.md)

See [templates/](./templates/) directory for starter templates of each document type.
