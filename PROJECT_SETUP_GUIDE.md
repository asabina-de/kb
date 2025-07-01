# Project Setup & Documentation Process

This guide provides a step-by-step process for setting up documentation in new projects using our standardized 6-document structure.

## Quick Start Checklist

For every new project, copy the appropriate templates and customize them:

### Pragmatic Approach: Create What You Need

**Start Simple:**

- Use your **README.md** for basic setup instructions and initial guidelines
- Create docs only when you actually need them

**Common Progression:**

1. **README.md** → Basic project info, setup, initial coding guidelines
2. **TODO.md** → When you need a scratchpad for repo-specific gotchas
3. **GUIDELINES.md** → When README gets too long or team needs formal standards
4. **DECISIONS.md** → When making significant architectural choices
5. **AI Guidance** → When using AI development tools (AGENTS.md + CLAUDE.md)
6. **Others** → Only when complexity demands it

## When to Create Each Document

### Start Every Project With:

**GUIDELINES.md** - Immediately

- Essential for code consistency from day one
- Customize the tech stack sections (React/Vue/etc.)
- Remove irrelevant sections
- Add project-specific standards

**TODOs.md** - Immediately

- Capture initial project scope and requirements
- Track setup tasks (CI/CD, deployments, etc.)
- Plan feature development roadmap

### Add When Making Major Decisions:

**DECISIONS.md** - When you make your first architectural choice

- Framework selection (React vs Vue vs Svelte)
- State management approach (Context vs Redux vs Zustand)
- Database choice and schema design
- Authentication strategy
- Deployment architecture

### Add When System Complexity Grows:

**DESIGN_NOTES.md** - When you have 3+ entities or complex relationships

- Core data models and schemas
- API design patterns
- System architecture overview
- Business logic documentation

**Visual Diagrams (.mmd files)** - When relationships become complex

- Entity relationship diagrams
- System architecture diagrams
- Flow charts for complex processes
- Use Mermaid syntax for GitHub integration

### Add When Team Grows:

**LINTING_FORMATTING.md** - When multiple developers join

- Prevents style inconsistencies
- Automates code quality checks
- Establishes tool configurations

### Add When Using AI Development Tools:

**AGENTS.md** - General AI agent guidelines

- Development workflow and commit strategy
- Documentation update patterns
- Communication guidelines
- Project-specific environment setup

**CLAUDE.md** - Claude-specific instructions

- References AGENTS.md for core guidelines
- Claude-specific behaviors and tool usage
- Should be minimal, pointing to AGENTS.md for most guidance

## Template Customization Guide

### 1. GUIDELINES.md Customization

**For React Projects:**

```bash
# Keep: React/TypeScript sections
# Remove: Vue/Angular specific content
# Add: Your specific React patterns (hooks, context usage)
```

**For Node.js Backend:**

```bash
# Keep: Error handling, logging, security sections
# Remove: Frontend-specific content
# Add: API design patterns, database patterns
```

**For Full-Stack Projects:**

```bash
# Keep: All sections
# Customize: Each section for your specific stack
```

### 2. TODO.md Initial Setup

Replace template tasks with your project needs:

```markdown
## Now (Active Work)

- [ ] Initialize project structure
- [ ] Set up CI/CD pipeline
- [ ] Configure development environment
- [ ] Implement basic authentication
- [ ] Create initial database schema

## Next (Up Coming)

- [ ] Set up error monitoring (like Sentry)
- [ ] IaC
- [ ] Configure logging infrastructure
- [ ] Set up health check endpoints
- [ ] Implement security headers
- [ ] Configure backup strategy

## Later (Future Consideration)

- [ ] Profit!

## Never (Decided Against)

- [ ] Collect tech debt... just kidding... no winning without a couple of bruises
```

### 3. DECISIONS.md First Entry

Document your first major decision:

```markdown
### 2024-01-15 - Framework Selection

**Decision**: Use Next.js with TypeScript for the web application.

**Context**: Need to build a full-stack web application with both static and dynamic content...

**Rationale**:

- Built-in SSR/SSG capabilities
- Excellent TypeScript support
- Large ecosystem and community
- Team familiarity

[Continue with Benefits, Trade-offs, etc.]
```

## Project Structure Recommendations

### Docs Directory Layout

```
docs/
├── DECISIONS.md           # Architecture decisions
├── DESIGN_NOTES.md        # System design
├── GUIDELINES.md          # Development standards
├── LINTING_FORMATTING.md  # Code quality rules
├── TODOs.md               # Task tracking
└── diagrams/              # Visual documentation
    ├── architecture.mmd   # System architecture
    ├── data-model.mmd     # Entity relationships
    └── user-flow.mmd      # User journey flows
```

### Root Level Files

```
project-root/
├── docs/                  # All documentation
├── .eslintrc.json        # From LINTING_FORMATTING.md
├── .prettierrc           # From LINTING_FORMATTING.md
├── README.md             # Project overview + link to docs/
└── [source code]         # Your application code
```

## Maintenance Guidelines

### Keep Documentation Current

**Weekly Review:**

- Update TODOs.md with completed tasks and new items
- Move completed items to the ✅ section
- Reprioritize pending tasks

**After Major Changes:**

- Update DECISIONS.md with new architectural choices
- Revise DESIGN_NOTES.md if data models change
- Update diagrams if system architecture evolves

**Monthly Review:**

- Review GUIDELINES.md for outdated practices
- Update LINTING_FORMATTING.md with new tools
- Archive old TODOs that are no longer relevant

### Documentation Quality Checks

**Before Each Release:**

- [ ] All documents are current and accurate
- [ ] TODOs reflect actual project status
- [ ] Decision rationales are still valid
- [ ] Design notes match current implementation
- [ ] Visual diagrams reflect current architecture

## Integration with Development Workflow

### Git Workflow Integration

**Branch Naming:**

- `docs/update-architecture-decisions` for documentation updates
- `feat/user-auth-docs/implementation` for feature + docs

**Pull Request Template:**

```markdown
## Changes

- [ ] Code changes
- [ ] Documentation updates
- [ ] Tests added/updated

## Documentation Impact

- [ ] Updated DECISIONS.md (if architectural change)
- [ ] Updated DESIGN_NOTES.md (if data model change)
- [ ] Updated TODOs.md (task completion/new tasks)
- [ ] Updated diagrams (if system change)
```

### CI/CD Integration

**Documentation Checks:**

```yaml
# Add to GitHub Actions
- name: Check Documentation
  run: |
    # Ensure all decision entries have required sections
    # Validate Mermaid diagrams syntax
    # Check for broken internal links
```

## Examples from Real Projects

### Successful Implementation: notumo-react-app

- **Started with:** GUIDELINES.md, TODOs.md
- **Added early:** DECISIONS.md for state management choice
- **Evolved to:** Full 6-document structure as system complexity grew
- **Key success:** Each document had clear, distinct purpose

### Common Pitfalls to Avoid

**Don't:**

- Create all documents at once (overwhelming)
- Copy templates without customization
- Let documents become stale/outdated
- Duplicate information across documents

**Do:**

- Start small with essential documents
- Customize templates for your specific context
- Update documents as part of development workflow
- Keep each document focused on its specific purpose

## Related Resources

- [Documentation Standards in README.md](./README.md#documentation-standards)
- [Template Directory](./templates/) - All template files
- [notumo Example](../notumo/notumo-react-app/worktree-00/docs/) - Real-world implementation

## Questions & Support

For questions about documentation standards or template usage:

1. Review existing examples in notumo project
2. Check this guide for specific scenarios
3. Create documentation following templates and iterate based on team feedback
