# Agent Development Guidelines

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

## Documentation Workflow

> [!TIP]
> Note that some working documents in a repo will be located in the docs
> subdirectory.

**When making significant changes:**

1. **Check existing decisions** in DECISIONS.md if modifying core architecture
2. **Follow established patterns** in GUIDELINES.md if implementing features
3. **Update TODO.md** when completing tasks or discovering new ones
4. **Document new decisions** in DECISIONS.md with rationale and trade-offs

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
