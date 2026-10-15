---
name: comment
description: "Use this skill when another skill or the user needs to post a structured comment to a Linear issue. This skill owns the commenting protocol: numbered threads (T1, T2, …), routing each comment to the right open thread, provenance markers, formatting, and closing a thread with a summary. Trigger when a skill wants to post an assessment, finding, plan, status update, or session summary to a Linear issue. Also trigger when the user invokes `/comment`. Do NOT use this skill for reading comments for their content (use list_comments directly) or for creating/updating issues (use save_issue directly). This skill only handles comment creation with proper formatting and threading."
api_description: "Post structured comments to Linear issues following a uniform protocol: numbered resolvable threads, routing to the best-fitting open thread, provenance markers, and summary-on-close. Handles formatting and threading so calling skills don't have to."
allowed-tools: mcp__claude_ai_Linear__save_comment mcp__claude_ai_Linear__list_comments mcp__claude_ai_Linear__get_issue
---

# comment

Post structured comments to Linear issues. This skill owns the **how** of commenting — formatting, provenance, threading. Calling skills own the **what** — when to comment and what content to include.

> **Why this protocol exists.** An issue page shows every top-level comment expanded. One top-level comment per event (assessment, spike, plan, CI result) turns the page into a wall the reader has to scroll through to make sense of. Replies fold under their thread, and a resolved thread folds away entirely. So: few top-level comments, each a thread that can be closed, and everything else a reply.

> **Sync note:** Every skill that posts comments delegates here and must not contradict this protocol: `pair`, `issue`, `align`, `design`, `pr`. When the protocol changes, check those skills for wording that still describes the old shape.

## Protocol

```
Issue comments:
├── T1: redesign the auth flow          ← current thread: general work
│   ├── Assessment
│   ├── Plan
│   ├── Step 1 complete
│   └── ✅ Summary: what was tried, how it ended   → human resolves
├── T2 Spike: does the SDK support PKCE ← typed thread: its own question
│   └── ✅ Answer                                  → human resolves
└── T3: rework after review             ← next current thread
    └── …
```

### Vocabulary

- **Description** — the issue's own text. Not a comment.
- **Thread** — a top-level comment plus the replies under it.
- **Top-level comment** — the comment that starts a thread. Its first line is the thread's title.
- **Reply** — a comment posted under a top-level comment, via `parentId`.

### Thread titles

Every top-level comment is titled `T{n}[ {Type}]: {one-line summary}`:

- **`T{n}`** — one sequence per issue, shared by all threads. The next thread takes the highest existing number + 1, counting resolved threads too. `T`, not `#`, because a bare `#85` already reads as a PR number.
- **Type** — optional. General work has none. Anything else names what the thread is, e.g. `Spike`, `Fix`, `Refactor`. These are examples, not an enforced list.
- **Summary** — one line saying what the thread is about, not what happened in it.

Example titles: `T1: redesign the auth flow`, `T2 Spike: does the SDK support PKCE`, `T3 Fix: token refresh drops the session`. These are the title alone; the heading line wraps it in bold and appends `(skill: {caller-skill})` (see **Comment anatomy**).

**The current thread** is the highest-numbered unresolved thread with no type. It is where anything without a better home goes.

Issues that predate this protocol have top-level comments without a `T{n}` title. Treat unresolved ones as routing candidates, never as the current thread, and start numbering at `T1`.

### Comment anatomy

Every comment has three parts:

1. **Heading line:** for a top-level comment, `**T{n}[ {Type}]: {summary}** (skill: {caller-skill})`; for a reply, `**{Title}** (skill: {caller-skill})`. Spell out `skill:` — a bare `(pair)` means nothing to a reader who doesn't know the skill names
2. **Provenance line:** `*[ai:claude-code]*`
3. **Body:** the content, in markdown

Example top-level comment, with every part present — number, type, summary, caller skill, provenance and body:

```markdown
**T2 Spike: does the SDK support PKCE** (skill: pair)

*[ai:claude-code]*

**Verdict:** Feasible, with caveats.
```

Example reply:

```markdown
**Assessment** (skill: pair)

*[ai:claude-code]*

**Clear and ready:**
- Add Google OAuth callback endpoint
- Store refresh tokens in existing session table
```

### Reading the threads

Routing needs to know which threads exist and which are open. `list_comments` returns every comment with its `parentId` (`null` for a top-level comment) and `resolvedAt` (`null` while open). Read it in full:

- **At session start, read greedily.** One full `list_comments` read of the issue, before the first comment. Prefer spending the tokens over misreading the situation.
- **Within a session, trust the context.** Once the threads and their IDs are in view, reuse them. Read again only if the context was compacted and the IDs are gone. Parallel sessions on one issue are rare by design, so no re-read before each post.

**Where the tokens go.** `list_comments` cannot filter to top-level comments: it returns every reply with its full body, and long bodies make the read expensive on a busy issue. When that cost matters, hand the read to a subagent and have it return only an index: number, title, comment ID, resolved or not, date of the last reply. The default is still the greedy read.

### Routing a comment

Before posting, decide where the comment goes. This is one self-contained choice, so a fast judgment model (e.g. a System One model such as TypeSafe's Jev) could take it over later:

- **Input:** the draft comment, and the unresolved threads (title plus a line of their latest content).
- **Output:** one thread, or **none of the above**.

Then:

| Outcome | Action |
|---|---|
| A thread fits the topic | **Reply** in that thread |
| Nothing fits, and the content is routine progress | **Reply** in the current thread |
| Nothing fits, and the topic may deserve its own conversation | **Ask the user** whether to open `T{n+1} {Type}: …` or reply in the current thread. With no user present (walk-away, managed agent), reply in the current thread and say in the body that it may deserve its own thread |
| No current thread exists (new issue, or all resolved) | **Open** `T{n+1}: …` as the new current thread |

Open a typed thread only for a topic that can be resolved on its own: a spike that answers one question, a fix pulled out of the main work. Assessments, plans, step completions, PRs and CI results are routine progress and belong in the current thread.

### Closing a thread

A thread closes with a reply whose heading starts with ✅ and whose body is its summary: what was tried, how it concluded, and what (if anything) carries over. Then ask a human to resolve it. The Linear MCP can read `resolvedAt` but cannot set it, so resolving is a human action. Until it happens, the thread stays a routing candidate.

A resolved thread folds away, so the list of resolved threads becomes the issue's history: each one's ✅ reply is the tl;dr.

### Provenance

The provenance marker identifies the authoring surface:

- `*[ai:claude-code]*` — comment authored by Claude Code (interactive session)
- `*[ai:managed-agent]*` — comment authored by a managed agent (walk-away)

The marker always appears on line 3 (after heading + blank line), never inline or at the end.

### Mid-thread events

When something changes mid-thread (plan adjusted, step skipped, blocker found), use these emoji prefixes on the reply's heading:

- 🚨 — plan change
- ⏭️ — step skipped
- 🌟 — step added
- 🚧 — blocker discovered
- ⚠️ — conflict between plan and reality, or a correction to an earlier reply

### Constraints of the Linear MCP

- `save_comment` accepts `parentId` only when creating a comment. A reply posted in the wrong thread cannot be moved; post a short pointer in the right thread instead.
- `save_comment` with `id` can edit a comment's body, e.g. to retitle a top-level comment. Post a reply quoting the old text so the change stays reconstructable.

## Interface

Calling skills invoke this skill via `Skill("comment", args)` where `args` is a natural-language instruction. The caller states what the comment is; this skill routes it, formats it and calls `save_comment`.

### Examples

```
Post to VID-123 titled "Assessment" from skill "pair" with body:

**Clear and ready:**
- Item 1

**Unclear:**
- Question 1
```

Routine progress: lands in the current thread, or opens `T1` if there is none.

```
Post to VID-123 titled "Spike: does the SDK support PKCE" from skill "pair" as its own thread, with body:

**Verdict:** Feasible, with caveats.
```

The caller asked for a typed thread: opens `T{n+1} Spike: does the SDK support PKCE`.

```
Reply in thread {comment-id} on VID-123 titled "🚨 Plan adjusted" from skill "pair" with body:

Step 3 replaced with Step 3a: explicit re-login flow.
Reason: navigator decided silent refresh adds complexity.
```

The caller already holds the thread ID from context: no routing needed.

```
Close thread {comment-id} on VID-123 from skill "pair" with summary:

**Tried:** OAuth callback, token storage, re-login flow.
**Concluded:** shipped in #47; silent refresh dropped in favour of explicit re-login.
**Carries over:** nothing.
```

Posts the ✅ reply and asks the user to resolve the thread.

## Return value

After posting, return the comment ID and where it landed:

```
Opened T2 Spike {comment-id} on VID-123.
```

or

```
Replied in T1 ({parent-id}) on VID-123.
```

The calling skill keeps thread IDs in context for the rest of the session.

## Anti-patterns

- **Don't open a top-level comment per event.** An assessment, a plan, a CI result is a reply in the current thread. A new thread is for a topic that can be resolved on its own.
- **Don't post without reading the threads first.** The first comment of a session follows a full `list_comments` read; routing without it guesses.
- **Don't keep a copy of the thread list** in the description or anywhere else. Read it from Linear, which cannot go stale.
- **Don't post without a heading.** Every comment needs a heading on line 1, and every top-level comment a `T{n}` title.
- **Don't skip provenance.** Every comment needs `*[ai:claude-code]*` on line 3.
- **Don't post "starting X" comments.** Wait until X is done, then post findings. One comment per completed unit, not a running log.
- **Don't interleave parallel results.** When multiple subagents complete, post one combined reply rather than separate ones that fragment the thread.
- **Don't leave a finished thread open without a summary.** Close it with a ✅ reply, then ask a human to resolve it.
- **Don't post empty closing replies.** If there's nothing to say beyond "done", fold it into the last substantive reply with the ✅ prefix.
