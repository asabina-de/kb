# Agent Development Guidelines

This file provides AI agents with guidance for working within this knowledge base repository. It follows the [agents.md](https://agents.md/) specification for AI coding agents.

> [!IMPORTANT]
> This is a concise summary for AI agents - the README.md is the authoritative source of truth. For detailed setup instructions, troubleshooting, and comprehensive development guidance, always reference the README.md. This file provides high-level verification checklists and AI-specific workflow guidance.

## Project Overview

This is the **engineering knowledge base** for Asabina. It centralizes documentation standards, templates, and engineering practices across all projects.

## Setup Commands

- Clone repository: `git clone <repo-url>`
- Install dependencies: Follow project-specific README.md instructions
- Development workflow: Reference Linear + GitHub integration in README.md

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
which direnv && direnv --version
which nix && nix --version

# 3. Project Commands Check
# This project is primarily documentation-based and does not have typical build/test commands.
# Refer to README.md for any specific tooling or setup.
```

**If any verification fails:**

- **STOP and refer user to README.md setup section**
- Do not proceed with code changes until environment is properly configured
- For git config issues: Direct to README.md git configuration section
- For environment issues: Direct to README.md environment setup section

## Development Environment

This repository is a knowledge base primarily consisting of Markdown files.

- **Environment setup:** Managed via `devenv.nix` and `direnv`.
- **Package manager and build commands:** Not applicable for a pure documentation repository.
- **Testing framework details:** Not applicable.

## Key Files to Understand

- **[README.md](./README.md)** - Documentation standards, tooling overview (Linear, GitHub, Sonar, etc.)
- **[PROJECT_SETUP_GUIDE.md](./PROJECT_SETUP_GUIDE.md)** - Step-by-step guide for implementing documentation in new projects
- **[templates/](./templates/)** - Template files for copying into new projects

## Development Workflow

- Reference existing documentation before creating new patterns
- Update relevant docs when making significant changes
- **ALWAYS use `git rm` for file removals and `git mv` for file renames** - never use plain `rm` or `mv` for tracked files
- Don't automatically make commits yourself unless instructed to do so. Always default to prioritizing to check with a human operator before work is locked into the record.

## Documentation Workflow

### Our Documentation Structure

When working on projects that follow our standards, understand these documents and when to update them _(ordered by workflow relevance)_:

1. **README.md** - Project foundation, entry point for new developers
2. **GUIDELINES.md** - Engineering standards and best practices (most frequently referenced)
3. **TODO.md** - **Most frequently updated** - Task tracking with Now/Next/Later/Never framework
4. **DESIGN_NOTES.md** - **Iteration scratchpad** for exploring designs and alternatives
5. **DECISIONS.md** - **Final decisions** graduated from DESIGN_NOTES.md exploration
6. **LINTING_FORMATTING.md** - Code quality tools (create only when team size demands it)
7. **Knowledge base** - use the `knowledge-base` directory, where available for our engineering handbook which includes tooling recommendations and project setup instructions/guidelines.

Raise concerns and suggest improvements or fixes, when you stumble into topics that are not documented but should be on the record to help future developers (human or machine) fast-track to results.

### TODO.md Usage (Important for AI Agents)

**When adding uncertain TODOs**, use collapsible details blocks:

```markdown
<details>
<summary>AI-generated TODOs to be reviewed</summary>

- [ ] Your uncertain TODO items here
</details>
```

This prevents pollution of main TODO sections with items that need human review.

### Documentation Creation Flow

Follow the pragmatic approach from PROJECT_SETUP_GUIDE.md:

1. **Start with README.md** for basic guidelines (include basic linting for small projects)
2. **Add GUIDELINES.md** when README outgrows itself or team needs engineering standards
3. **Create TODO.md** when you need a task scratchpad
4. **Use DESIGN_NOTES.md** as iteration scratchpad for complex designs
5. **Graduate to DECISIONS.md** when designs mature with full rationale
6. **Create other docs** only when actually needed

## Code Quality Requirements

**MANDATORY: Run these commands before committing any changes**

### Pre-Commit Quality Checklist

Execute these commands (detailed explanations in README.md):

```bash
# Quality pipeline - ALL must pass:
# For this documentation-focused project, ensure Markdown linting and formatting.
# Add your project-specific commands here if any are introduced for linting/formatting Markdown.
# Example (if markdownlint-cli is installed):
# markdownlint --config .markdownlint.json .

# Or if pre-commit hooks are configured:
# pre-commit run --all-files
```

**Critical Rules:**

- **NEVER commit code that fails these checks**
- If any command fails: fix issues before proceeding
- If stuck: ask user for help with specific error messages
- Reference README.md "Development Quality Standards" section for detailed troubleshooting

## Commit Strategy

- Use conventional commit format
- Add `[ai:${AI_NAME}]` tag at end of commit titles
- Example: `feat: add user auth [ai:claude]`
- Break work into focused, single-concern commits
- Stick to short commit titles that are less than 80 characters long
- Add a "Co-authored by:" line in suggested commit messages

### Pre-Commit Workflow

1. **Complete your changes**
2. **Run all quality checks** (formatting, linting, type checking, tests, build)
3. **Fix any issues** that arise from quality checks
4. **Stage your changes**: `git add .`
5. **Commit with proper message format**
6. **Verify commit was signed**: `git log --show-signature -1`

## Communication

- Challenge ideas collaboratively to arrive at better solutions
- Ask for clarification when context is unclear
- Reference documentation files when discussing changes
- Keep the user informed of significant decisions or blockers

## Claude-Specific Instructions

- Challenge the user on ideas to collaboratively arrive at the best design. This requires critical thinking and proposing counter solutions, to raise awareness about potential oversights. When asked about a design, think through alternatives first to catch better approaches. **Do not be eager to agree with the user when there are solid arguments to push back.**
- Use `[ai:claude]` tag in commit messages (following format above)
- Follow the TODO methodology for complex tasks (break into Now/Next/Later/Never)
- Use available tools efficiently (batch tool calls when possible)
- Reference documentation standards from README.md when suggesting improvements
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
