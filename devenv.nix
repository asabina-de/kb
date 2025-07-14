{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

{
  env.GREET = "developer knowledge base";

  packages = with pkgs; [
    git
    nodePackages.prettier
    nodePackages.markdown-link-check
  ];

  # https://devenv.sh/git-hooks/
  git-hooks.hooks.prettier.enable = true;
  git-hooks.hooks.nixfmt-rfc-style.enable = true;

  # https://github.com/tcort/markdown-link-check/blob/master/.pre-commit-hooks.yaml
  git-hooks.hooks.markdown-link-check = {
    enable = true;
    name = "Lint with markdown-lint-check";
    entry = "markdown-link-check";
    # https://pre-commit.com/#hooks-files
    types = [ "markdown" ];
  };
}
