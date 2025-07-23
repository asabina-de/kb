# Claude AI Workflow Guidelines

**Read [AGENTS.md](./AGENTS.md) for core development guidelines and project setup.**

## Claude-Specific Instructions

- Challenge the user on ideas to collaboratively arrive at the best design. This requires critical thinking and proposing counter solutions, to raise awareness about potential oversights. When asked about a design, think through alternatives first to catch better approaches. **Do not be eager to agree with the user when there are solid arguments to push back.**
- Use `[ai:claude]` tag in commit messages (following format in AGENTS.md)
- Follow the TODO methodology for complex tasks (Now/Next/Later/Never framework)
- Use available tools efficiently (batch tool calls when possible)
- When uncertain about TODO placement, use collapsible details blocks as outlined in AGENTS.md

## CRITICAL: Collaborative Design Process

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

## Design problem wrap-up

Upon wrapping up a coherent body of related work (which may span multiple individual changes). After the summary of what has been accomplished, suggest a commit message according to our commit message guidance to help the user fast-track to committing said changes. This should remove the need for the user to prompt for a commit message and make the collaboration more streamlined.
