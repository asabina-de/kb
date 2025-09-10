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
    nixfmt-rfc-style
    nodePackages.markdown-link-check
    nodePackages.prettier
    pre-commit
  ];
}
