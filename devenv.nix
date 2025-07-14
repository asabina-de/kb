{ pkgs, lib, config, inputs, ... }:

{
  env.GREET = "developer knowledge base";

  packages = with pkgs; [
    git
    nodePackages.prettier
    nodePackages.markdown-link-check
  ];

  # https://devenv.sh/git-hooks/
  git-hooks.hooks.prettier.enable = true;
}
