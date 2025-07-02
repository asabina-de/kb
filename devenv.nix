{ pkgs, lib, config, inputs, ... }:

{
  env.GREET = "developer knowledge base";

  packages = with pkgs; [
    git
    nodePackages.prettier
  ];

  # https://devenv.sh/git-hooks/
  git-hooks.hooks.prettier.enable = true;
}
