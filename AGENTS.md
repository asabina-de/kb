# Agent Development Guidelines

This file provides AI agents with guidance for working within this knowledge base repository.

## Repository Context

This is the **engineering knowledge base** for Asabina. It centralizes documentation standards, templates, and engineering practices across all projects.

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
7. **Visual diagrams (.mmd)** - Update when system relationships change

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

## Communication

- Challenge ideas collaboratively to arrive at better solutions
- Ask for clarification when context is unclear
- Reference documentation files when discussing changes
- Keep the user informed of significant decisions or blockers
