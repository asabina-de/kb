{ pkgs, lib, config, inputs, ... }:

{
  env.GREET = "developer knowledge base";

  packages = with pkgs; [
    git
    nodePackages.prettier
  ];

  # Enable Python with virtual environment for PyPI packages
  languages.python = {
    enable = true;
    version = "3.11";
    venv = {
      enable = true;
      requirements = ''
        markdown-checker
      '';
    };
  };

  # https://devenv.sh/git-hooks/
  git-hooks.hooks.prettier.enable = true;
}
