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
    # haskellPackages.cabal-install
    # haskellPackages.ghc_9_12_1
    husky
    lint-staged
    nixfmt-rfc-style
    nodePackages.markdown-link-check
    nodePackages.prettier
    pre-commit
    python3
  ];
}
