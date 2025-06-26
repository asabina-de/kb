# Engineering Handbook

This repo is our go to reference for engineering instructions. With agentic
tools, you should be able to locally navigate through the relevant details
using this tool.

## Tooling

### Knowledge Base

Use this repo as the general knowledge base to keep things simple. Use
repo-specific READMEs at the right level of the repo's filetree to document
repo-specific details.

- Use [Mermaid
  diagrams](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams#creating-mermaid-diagrams)
  where you need to scribble
- 

### Linear

Use Linear for work tracking and planning.

- File work items in [Linear](https://linear.app/asabina)
- File repo issues directly into GitHub and verify that the [Linear
  integration](https://linear.app/asabina/settings/integrations/github) has
  synchronization set up for the relevant repos).

### GitHub

Use GitHub as the default forge and define GitHub Actions for every new
project. A repo is only "fit" if it has a pipeline and some automated tooling
to check the health of the repo.

#### Setup

Remember to do the following for every repo:

- Populate your local config `git config edit --local` to
  - use your work email and 
  - sign your commits using your work signing key in 1Password[^git-signing-1password]
- For every piece of work, start your topic branch using the [branch name provided by Linear](https://linear.app/changelog/2020-04-13-branch-naming).
- Push your PRs to merge into `main`
- Where relevant, review PRs individually but feel free to merge stacks into
  `main` when ready. GitHub is smart enough to detect when intermediate PRs in
  a stack have been merged into mainline and will mark those as merged as well.

[^git-signing-1password]: https://developer.1password.com/docs/ssh/git-commit-signing/#step-1-configure-git-commit-signing-with-ssh

#### GitHub Actions

We should seek to **answer the following in every pipeline**:

- **Does it read?** Is the code solid in terms of matching a standard?
- **Does it build?** Is the code valid as-in, does it compile or run?
- **Does it pass?** Are tests passing?

At a bare minimum this means that we have automated code quality scanning (like
static analysis or linting) set up to provide a basic stamp of approval that is
visible at the PR level for other reviewers. **Reviewers should not have to
check out the code and run some commands before they get feedback** on the
compliance of the code to some basic standards.

Regarding testing, even if you don't focus on coverage, make sure that the
tooling is at least present for others to write tests for things they
implement.

### Devenv.sh

Optionally, use [devenv](https://devenv.sh) to manage your dev environments.

Benefits are:

- Declarative dev env. Helps us cover system deps such that folks don't end up finding in-the-heat-of-the-moment that there is a bunch of setup work they still need to do.
- Reproducible env. @vidbina uses the devenvs on Apple Silicon and Intel MBAs and spends much less time fiddling with managing packages now.
- Forces us to be more explicit about our environments and to think through tooling ergonomics issues sooner (e.g.: using miniconda over conda which adds some benefits since miniconda does less violence across the FHS to leave a lot system state that may be difficult to track)
- Parity of envs between devs to minimise "works on my machine" problems.
- Declared in Nix -- a powerful language for config definition.

Downsides:

- Declared in [Nix](https://nix.dev/tutorials/nix-language.html) -- a bit of an eccentric language which can be quite overwhelming to navigate at times.
- [Package repo (nixpkgs)](https://search.nixos.org/packages) may not contain latest-greatest of your target package and overriding this can be tricky (but probably not less tricky if brew doesn't have your target package either)
- Doesn't play ball very well with mixed approaches such as installing some things with nix and other manually, perhaps my dragging .dmgs into the Applications directory
- Removes agency from individual devs.

### GCP

Use Google Cloud Platform as the default PaaS or IaaS. Reason being, we're
already in the Google ecosystem with Google Workspace. We're basically keeping
the toolbox simple.


### Vercel

Use Vercel where we need to host simple front-ends or NextJS apps (with
server-side logic).

### Sonar

- Use **Number of days** and set the days parameter to `30`. Keep in mind that
  the alternative setting as per 2025-06-26 (June) is *Preview version* but the
  docs[^sonar-new-code] detail how it checks the version from build files like
  pom.xml and build.gradle  or the `sonar.projectVersion` parameter, which we
  don't want to focus on setting. Downside and risk of the *Number of days*
  configuration is that we miss out on checks for really slow-moving projects.

[sonar-new-code]: https://docs.sonarsource.com/sonarqube-server/9.9/project-administration/defining-new-code/

### Graphite (deprecated)

We tried Graphite but stopped around 2025-06-26 (June) because the UI was
overwhelming. Best thing about it was the automatic restacking but with some
average git skills and the support of modern agentic dev tools, the pain around
the non-Graphite way of solving this is fairly minimal. In cases of long stacks
(trains), there is some manual effort, but it beats the Graphite DX of a top
merge, triggering the individual rebasing and merging of the PRs into main
where we actually just want to merge the top and be done with it.
