# Agent Development Guidelines

This file provides AI agents with guidance for working within this knowledge base repository. It follows the [agents.md](https://agents.md/) specification for AI coding agents.

## Project Overview

This is the **engineering knowledge base** for Asabina. It centralizes documentation standards, templates, and engineering practices across all projects.

## Setup Commands

- Clone repository: `git clone <repo-url>`
- Install dependencies: Follow project-specific README.md instructions
- Development workflow: Reference Linear + GitHub integration in README.md

## Key Files to Understand

- **[README.md](./README.md)** - Documentation standards, tooling overview (Linear, GitHub, Sonar, etc.)
- **[PROJECT_SETUP_GUIDE.md](./PROJECT_SETUP_GUIDE.md)** - Step-by-step guide for implementing documentation in new projects
- **[templates/](./templates/)** - Template files for copying into new projects

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

## Development Practices

### Commit Strategy

- Use conventional commit format
- Add `[ai:${AI_NAME}]` tag at end of commit titles
- Example: `feat: add user auth [ai:claude]`
- Break work into focused, single-concern commits
- Keep commit titles short and try hard to not exceed 80 chars (including the ai tag)

### Tool Integration

- Follow Linear + GitHub workflow as documented in README.md
- Reference existing documentation before creating new patterns
- Update relevant docs when making significant changes
- **ALWAYS use `git rm` for file removals and `git mv` for file renames** - never use plain `rm` or `mv` for tracked files

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
