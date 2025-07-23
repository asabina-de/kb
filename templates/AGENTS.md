# Agent Development Guidelines

Follow the tooling and design guidance outlined in the README.

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

## Commit Strategy

- Use conventional commit format
- Add `[ai:${AI_NAME}]` tag at end of commit titles
- Example: `feat: add user auth [ai:claude]`
- Break work into focused, single-concern commits
- Stick to short commit titles that are less than 80 characters long
- Add a "Co-authored by:" line in suggested commit messages

## Communication

- Challenge ideas collaboratively to arrive at better solutions
- Ask for clarification when context is unclear
- Reference documentation files when discussing changes
