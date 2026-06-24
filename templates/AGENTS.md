# Agent Development Guidelines

> **Canonical source.** `CLAUDE.md` and `GEMINI.md` are symlinks to this file.
> Edit `AGENTS.md` — the others follow automatically.

This file provides AI agents with guidance for working within this project. It follows the [agents.md](https://agents.md/) specification for AI coding agents.

> [!IMPORTANT]
> This is a concise summary for AI agents - the README.md is the authoritative source of truth. For detailed setup instructions, troubleshooting, and comprehensive development guidance, always reference the README.md. This file provides high-level verification checklists and AI-specific workflow guidance.

## Project Overview

[Brief description of the project and its purpose]

## Setup Commands

- Install dependencies: [Add project-specific commands]
- Start development server: [Add start command]
- Run tests: [Add test command]
- Build: [Add build command]

## Environment Verification

**CRITICAL: Verify the development environment before starting any work**

### Pre-Flight Checklist

Run these verification commands (detailed instructions in README.md):

```bash
# 1. Git Configuration Check
git config --list --local | grep -E "(user\.|commit\.|gpg\.)"
# Expected: user.email, user.signingkey, commit.gpgsign=true

# 2. Development Environment Check
echo $DIRENV_WARN_TIMEOUT  # Should return: 20s
which [your-main-tool] && [your-main-tool] --version

# 3. Project Commands Check
[Add your project-specific commands, examples:]
npm run lint --help && npm run test --help && npm run build --help
```

**If any verification fails:**

- **STOP and refer user to README.md setup section**
- Do not proceed with code changes until environment is properly configured
- For git config issues: Direct to README.md git configuration section
- For environment issues: Direct to README.md environment setup section

## Development Environment

- [Environment setup instructions]
- [Package manager and build commands]
- [Testing framework details]

## Development Workflow

- [Project-specific workflow guidelines]
- [Commit strategy and branching]
- [Code review process]

- Reference existing documentation before creating new patterns
- Update relevant docs when making significant changes
- **ALWAYS use `git rm` for file removals and `git mv` for file renames** - never use plain `rm` or `mv` for tracked files
- **HITL — Git is human-in-the-loop.** Never create commits, push branches, or open/merge PRs unless the user has explicitly asked you to do so. Default to checking with a human operator before work is locked into the record.

## Design Work

**Before starting or continuing any design work** (UI implementation, component creation, visual changes, Figma collaboration), read these resources:

1. **`DESIGN.md`** — the project's visual design specification. Follows the [DESIGN.md open spec](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md). Contains color tokens, typography scale, spacing system, component token mappings, and design rationale. The YAML frontmatter is machine-readable; the Markdown body explains the "why."
2. **Figma workflow conventions** — if the project uses Figma, consult the team's Figma workflow guidance for patterns on variable architecture, component editing discipline (always edit the base component, not instances), and visual verification after changes.

If `DESIGN.md` does not exist yet, consult the [KB template](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md) and the project lead before creating one. A DESIGN.md can be seeded from an existing Figma file using the [Figma-to-DESIGN.md plugin](https://github.com/bergside/design-md-figma) or authored manually following the spec.

Sections marked `<!-- PROJECT-SPECIFIC -->` must be authored per project (brand personality, color palette, ICP framing, component inventory). Sections marked `<!-- CROSS-PROJECT -->` carry reusable structure — customize values but keep the structure.

## Documentation Workflow

> [!TIP]
> Note that some working documents in a repo will be located in the docs
> subdirectory.

**When making significant changes:**

1. **Check existing decisions** in `docs/decisions/` — grep frontmatter: `grep -E "^(status|decision):" docs/decisions/*.md`
2. **Follow established patterns** in GUIDELINES.md if implementing features
3. **Update TODO.md** when completing tasks or discovering new ones
4. **Document new decisions** in `docs/decisions/` using the `nnnn-slug.md` template

**For TODO.md updates:**

- Use Now/Next/Later/Never framework for task prioritization
- When adding uncertain TODOs, use collapsible details blocks:

```markdown
<details>
<summary>AI-generated TODOs to be reviewed</summary>

- [ ] Your uncertain TODO items here
</details>
```

## Code Quality Requirements

**MANDATORY: Run these commands before committing any changes**

### Pre-Commit Quality Checklist

Execute these commands (detailed explanations in README.md):

```bash
# Quality pipeline - ALL must pass:
[Add your project-specific commands, examples:]
npm run format && npm run lint && npm run type-check && npm run test && npm run build

# Or if pre-commit hooks are configured:
pre-commit run --all-files
```

**Critical Rules:**

- **NEVER commit code that fails these checks**
- If any command fails: fix issues before proceeding
- If stuck: ask user for help with specific error messages
- Reference README.md "Development Quality Standards" section for detailed troubleshooting

## Commit Strategy

> **Read `CONTRIBUTING.md` before drafting or making any commit.** It is the canonical source of truth for the commit format, the full scope list, prohibited scope patterns, and the subject line self-check protocol.

Summary:

- Conventional commit format: `<type>(<scope>): <subject> [ai:<agent>]`
- Subject lines ≤80 characters — run the self-check in CONTRIBUTING.md
- Break work into focused, single-concern commits
- Add a `Co-Authored-By:` line when an AI agent co-authored the commit

### Pre-Commit Workflow

See CONTRIBUTING.md for the full workflow. Quick reference:

1. **Complete your changes**
2. **Run all quality checks** (formatting, linting, type checking, tests, build)
3. **Fix any issues** that arise from quality checks
4. **Stage specific files**: `git add <file1> <file2>` — never `git add .` or `git add -A`
5. **Run subject line self-check** (see CONTRIBUTING.md)
6. **Commit with proper message format**
7. **Verify commit was signed**: `git log --show-signature -1`

### Pre-PR Checklist

Before opening a pull request, verify:

1. **CHANGELOG.md** — if the branch changes templates, conventions, or anything downstream repos consume, add a dated entry to `CHANGELOG.md` with what changed and migration steps. The CHANGELOG is how downstream repos discover what to sync. Forgetting it means the change is invisible to other projects.
2. **CONTRIBUTING.md** — if commit or PR conventions changed, verify `CONTRIBUTING.md` reflects the new rules.

## AI Provenance

All AI contributions must be clearly identifiable:

- **Commits:** append `[ai:<agent>]` to the subject line (e.g. `[ai:claude]`, `[ai:gemini]`)
- **GitHub/Linear comments:** open every AI-posted comment with `*[ai:<agent>]*` on its own line so reviewers can instantly distinguish AI-authored content from human-authored content
- **Co-authorship:** add a `Co-Authored-By:` trailer when an AI agent co-authored a commit

## Communication

- Challenge ideas collaboratively to arrive at better solutions
- Ask for clarification when context is unclear
- Reference documentation files when discussing changes

## Claude-Specific Instructions

- Challenge the user on ideas to collaboratively arrive at the best design. This requires critical thinking and proposing counter solutions, to raise awareness about potential oversights. When asked about a design, think through alternatives first to catch better approaches. **Do not be eager to agree with the user when there are solid arguments to push back.**
- Use `[ai:claude]` tag in commit messages (following format above)
- Follow the TODO methodology for complex tasks (Now/Next/Later/Never framework)
- Use available tools efficiently (batch tool calls when possible)
- When uncertain about TODO placement, use collapsible details blocks as outlined above

### CRITICAL: Collaborative Design Process

**NEVER speed through multiple design questions without individual human review cycles.**

When working through systematic design questions:

1. **Use todo lists when multiple questions are discovered** to avoid forgetting questions as we proceed with our work. Make the user aware of multiple questions in bulk when they pop up or emerge through analysis (could be serendipitous discovery, could be through sparring with the user or otherwise) since it will help all parties to have early awareness of the issues, even if the resolution will not follow immediatelly. Always see to it that discovered questions are added to a todo list for systemic follow-up after the intial reveal.
2. **Present ONE question resolution at a time**
3. **Wait for user feedback** before proceeding to next question
4. **Update existing sections** to maintain consistency with resolved decisions
5. **Highlight changes** clearly for review
6. **Use Claude's internal todo mechanism** but for redundancy also write them to disk into the TODO.md file if this is available. This should allow us to resume TODO in previous sessions if we had to terminate those sessions before resolving all points.
7. **Never mark TODOs preemptively as done** only mark them done when the work is done. For the copy in fs, this may mean opening up the file multiple times and re-reading it again throughout the course of a session.

**If you catch yourself about to resolve multiple questions in one response, STOP and ask for guidance.**

### Design Problem Wrap-up

Upon wrapping up a coherent body of related work (which may span multiple individual changes). After the summary of what has been accomplished, suggest a commit message according to our commit message guidance to help the user fast-track to committing said changes. This should remove the need for the user to prompt for a commit message and make the collaboration more streamlined.
