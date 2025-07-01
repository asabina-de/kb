# Agent Development Guidelines

This file provides AI agents with guidance for working within this knowledge base repository.

## Repository Context

This is the **engineering knowledge base** for Asabina. It centralizes documentation standards, templates, and engineering practices across all projects.

## Key Files to Understand

- **[README.md](./README.md)** - Documentation standards, tooling overview (Linear, GitHub, Sonar, etc.)
- **[PROJECT_SETUP_GUIDE.md](./PROJECT_SETUP_GUIDE.md)** - Step-by-step guide for implementing documentation in new projects
- **[templates/](./templates/)** - Template files for copying into new projects

## Documentation Workflow

### Our 6-Document Structure

When working on projects that follow our standards, understand these documents and when to update them:

1. **DECISIONS.md** - Update when making architectural decisions or documenting trade-offs
2. **DESIGN_NOTES.md** - Update when working with data models, system architecture, or API design
3. **GUIDELINES.md** - Update when establishing or modifying coding standards and best practices
4. **LINTING_FORMATTING.md** - Update when configuring code quality tools
5. **TODO.md** - **Frequently updated** - Use for task tracking with Now/Next/Later/Never framework
6. **Visual diagrams (.mmd)** - Update when system relationships change

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

1. Start with README.md for basic guidelines
2. Create TODO.md when you need a task scratchpad
3. Create other docs only when actually needed

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

## Communication

- Challenge ideas collaboratively to arrive at better solutions
- Ask for clarification when context is unclear
- Reference documentation files when discussing changes
- Keep the user informed of significant decisions or blockers
