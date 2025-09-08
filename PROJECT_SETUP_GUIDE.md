# Project Setup & Documentation Process

This guide provides a step-by-step process for setting up documentation in new projects using our standardized 6-document structure.

## Quick Start Checklist

For every new project, copy the appropriate [templates](./templates/) and customize them:

### Environment Setup (Recommended First Step)

Before diving into documentation, set up environment templates for your project:

1. **Copy environment example files**:

   ```bash
   cp knowledge-base/templates/.envrc.example .envrc.example
   cp knowledge-base/templates/.envrc.local.example .envrc.local.example
   ```

2. **Set up .gitignore** to ignore working environment files:

   ```bash
   echo ".envrc" >> .gitignore
   echo ".envrc.local" >> .gitignore
   ```

3. **Customize examples**: Edit the `.example` files to document your project's specific environment variables

**For contributors**: Individual developers will copy these `.example` files to create their working environment files during project setup following the **direnv -> devenv pattern**.

See [knowledge-base/README.md#environment-variable-management-pattern](./README.md#environment-variable-management-pattern) for complete environment management documentation.

### Setup Verification

Include setup verification instructions in your project README to ensure developers properly configure their environment. Key verification points:

1. **Git configuration** - Verify commits are properly signed and attributed
2. **Development environment** - Verify devenv/direnv is active and tools are available
3. **Quality tools** - Verify linting, testing, and build commands work

See the [README template](./templates/README.md#setup-verification) for complete setup verification examples that you can customize for your project.

### Pragmatic Approach: Create What You Need

**Start Simple:**

- Use your **README.md** for basic setup instructions and initial guidelines
- Create docs only when you actually need them

**Common Progression (by developer workflow relevance):**

1. **README.md** -> Project foundation, setup, basic guidelines (include linting for small projects)
2. **GUIDELINES.md** -> When README outgrows itself or team needs formal engineering standards
3. **TODO.md** -> When you need a scratchpad for repo-specific gotchas/tasks
4. **DESIGN_NOTES.md** -> When exploring complex designs (iteration scratchpad)
5. **DECISIONS.md** -> When graduating mature designs from DESIGN_NOTES.md exploration
6. **LINTING_FORMATTING.md** -> Only when team size or complexity demands separate file
7. **AI Guidance** -> When using AI development tools (AGENTS.md with CLAUDE.md symlink)
8. **Visual diagrams** -> When system relationships become complex

## When to Create Each Document

### Start Every Project With:

**README.md** - The authoritative source of truth

- Include comprehensive setup instructions with verification steps
- Document environment management (direnv -> devenv pattern)
- Include development quality standards and pre-commit requirements
- Reference other documentation files but remain self-contained for basic setup

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

**DESIGN_NOTES.md** - When exploring complex designs

- **Use as iteration scratchpad** for evolving ideas and alternatives
- Core data models and schemas (draft versions)
- API design patterns exploration
- **Graduate mature designs to DECISIONS.md** with full rationale

**Visual Diagrams** - When relationships become complex

- Entity relationship diagrams (embed Mermaid syntax in markdown files)
- System architecture diagrams (embed Mermaid syntax in markdown files)
- Flow charts for complex processes (embed Mermaid syntax in markdown files)
- Use inline Mermaid blocks for GitHub integration

### Add When Team Grows:

**LINTING_FORMATTING.md** - Only when team size or complexity demands it

- **For small projects**: Embed basic linting setup in README.md or GUIDELINES.md
- **For larger teams**: Create separate file to prevent GUIDELINES.md bloat
- Prevents style inconsistencies and automates code quality checks

### Add When Using AI Development Tools:

**AGENTS.md** - AI agent guidelines (single source of truth)

- Development workflow and commit strategy
- Environment verification and setup commands
- Pre-commit quality requirements
- Documentation update patterns
- Communication guidelines
- Project-specific context for AI agents

**CLAUDE.md** - Symlink to AGENTS.md

- Create symlink: `ln -s AGENTS.md CLAUDE.md`
- Maintains backward compatibility with Claude-specific tooling
- Single file to maintain (AGENTS.md is the canonical source)

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
# Note: Mermaid diagrams should be embedded inline in relevant .md files
# GitHub doesn't support including separate .mmd files
```

### Root Level Files

```
project-root/
├── .envrc.example         # Environment template
├── .envrc.local.example   # Local environment template
├── .eslintrc.json         # From LINTING_FORMATTING.md (if applicable)
├── .prettierrc            # From LINTING_FORMATTING.md (if applicable)
├── AGENTS.md              # AI agent guidelines (when using AI development tools)
├── CLAUDE.md -> AGENTS.md # Symlink for backward compatibility
├── README.md              # Project overview, setup, and development guide
├── docs/                  # All documentation
└── [source code]          # Your application code
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
- [ ] Updated AGENTS.md (if AI workflow changes)
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
