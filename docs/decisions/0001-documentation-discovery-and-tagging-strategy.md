---
title: "Documentation Discovery and Tagging Strategy"
tags: [documentation, discovery, meta, tagging]
status: decided
decision: "Use YAML frontmatter tags with grep-based discovery in a flat file structure."
review_date: 2026-09-08
related_to: ["0002"]
supersedes: ""
---

# Documentation Discovery and Tagging Strategy

## Status Log

| Status | Date       | Author | Related Tickets | Notes                                                     |
| :----- | :--------- | :----- | :-------------- | :-------------------------------------------------------- |
| TODO   | 2025-09-08 | human  |                 | Initial creation                                          |
| DONE   | 2025-09-08 | human  |                 | Decision finalized                                        |
| AMEND  | 2026-06-05 | claude | [KB-8](https://linear.app/asabina/issue/KB-8) | Filename convention superseded by 0002; migrated to docs/decisions/ |

## Context

This knowledge base relies on a set of markdown files for documentation, including `design-notes/` and `decisions/`. A key challenge is the discovery of related documents, especially for topics that are cross-cutting concerns (e.g., a design that impacts both API design and authentication).

The goal is to establish a system that allows both human developers and automated agents to easily find contextually related documents with minimal friction for content creators.

## Exploration

Several strategies were considered to solve the discovery problem:

### Strategy 1: Thematic Subdirectories

- **Description:** Organize notes into topic-specific subdirectories (e.g., `docs/design-notes/authentication/`).
- **Pros:** Provides a clear, browsable hierarchy.
- **Cons:** "Taxonomy is hard." It forces a single category onto a note, which is problematic for cross-cutting concerns. This friction could discourage documentation creation.

### Strategy 2: Symlinks or a README Index

- **Description:** Keep a flat file structure and create a separate index, either using symlinks in a `tags/` directory or by maintaining a list of links in a `README.md` file.
- **Pros:** Allows a note to be listed under multiple categories.
- **Cons:** Brittle. Renaming a file (e.g., changing its `[STATE]`) would break all symlinks or index entries pointing to it, creating a maintenance nightmare.

### Strategy 3: In-File Metadata (Front Matter)

- **Description:** Keep a flat file structure but embed metadata directly into the top of each markdown file using a YAML "front matter" block.
- **Pros:**
  - **Flexible Tagging:** A single note can have multiple tags, perfectly handling cross-cutting concerns.
  - **Robust:** The metadata lives with the content. Renaming the file does not break the taxonomy.
  - **Low Friction:** Creating a note remains simple. Adding tags is an easy, optional step.
  - **Agent & Tooling Friendly:** The metadata is structured and can be reliably parsed by scripts or tools like `grep`.
- **Cons:** Requires tools to parse the metadata for discovery (though `grep` is a very simple and ubiquitous tool).

## Decision

Use YAML frontmatter tags with grep-based discovery in a flat file structure.

We adopt **Strategy 3: In-File Metadata (Front Matter)** combined with a descriptive filename convention.

### A. Filename Convention

> **Superseded (2026-06-05).** The filename convention below has been replaced by MADR-style serial numbering (`nnnn-slug.md`) with status in YAML frontmatter instead of the filename. The `docs/design-notes/` directory has been consolidated into `docs/decisions/`. See the [decisions/ consolidation design note](./2026-06-04.TODO.decisions-dir-consolidation.md) for the full rationale.

~~All documents in `docs/design-notes/` and `docs/decisions/` will follow this pattern:~~

~~`YYYY-MM-DD.[STATE].description.md`~~

- ~~**`YYYY-MM-DD`**: The date of creation, for chronological sorting.~~
- ~~**`[STATE]`**: The current status of the document.~~
- ~~**`description.md`**: A kebab-case description of the topic.~~

### B. Front Matter Convention

Each file will contain a YAML front matter block at the top.

- **`title`**: A human-readable title for the document.
- **`tags`**: A list of relevant tags (in lowercase) to aid discovery.
- **`status`**: `exploring | decided | superseded | deprecated` (replaces filename state token)
- **`decision`**: One-line TL;DR, filled when status becomes `decided`
- **`review_date`**: When this record should be revisited
- **`related_to`**: Serial numbers of related records
- **`supersedes`**: Serial number of the superseded record

**Example:**

```markdown
---
title: "Documentation Discovery and Tagging Strategy"
tags: [documentation, discovery, meta, tagging]
---
```

### C. Discovery Mechanism

The primary discovery mechanism will be using `grep` to search the front matter across all files.

### D. Template Content

To ensure high-quality content, the templates for design notes and decisions should include italicized guiding questions under each heading to prompt the author for the required information.

**Example (Find notes tagged `authentication` and `api-design`):**

A simple `grep` can be used for single-tag searches, but a more robust `git grep` command is recommended for searching multiple tags, especially when they are on different lines.

```bash
git grep -l -z --all-match -e 'tags:' -e 'authentication' -e 'api-design' -- ':(glob)**/decisions/*.md' | xargs -0 -n 1
```

- `-l`: Only print the filenames of matching files.
- `-z`: Separates file contents with a null character, allowing searches across multiple lines.
- `--all-match`: Ensures that a file is only listed if it matches all patterns.
- `-e`: Specifies a pattern to search for.
- `| xargs -0 -n 1`: Formats the output to be one filename per line.

To make this easier, you can create a Git alias. Add the following to your `~/.gitconfig` file:

```ini
[alias]
    greptags = "!f() { \
        git grep -l -z --all-match -e 'tags:' -- $(for tag in \"$@\"; do echo \"-e '$tag'\"; done) -- ':(glob)**/decisions/*.md' | xargs -0 -n 1; \
    }; f"
```

You can then run `git greptags authentication api-design` to get a clean, newline-separated list of matching files.

This approach provides a robust, flexible, and low-friction system for creating and discovering knowledge base documents.

## Consequences

- All records carry structured metadata that agents and humans can query without opening each file
- Cross-cutting concerns are handled naturally via multi-tag assignment
- Discovery depends on grep (ubiquitous, no special tooling required)
- Tag vocabulary must be managed by convention to avoid drift (see `templates/decisions/README.md`)

## Confirmation

- The decision template (`templates/decisions/0000-decision-template.md`) includes frontmatter with tags as a required field
- Grep patterns are documented in `templates/decisions/README.md`
