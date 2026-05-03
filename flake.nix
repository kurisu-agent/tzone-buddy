{
  description = "tzone-buddy — terminal-based World Time Buddy TUI";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    bun2nix = {
      url = "github:nix-community/bun2nix?tag=2.0.8";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, flake-utils, bun2nix }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        inherit (pkgs) lib stdenv;

        bun2nixPkg = bun2nix.packages.${system}.default;

        version = (builtins.fromJSON (builtins.readFile ./package.json)).version;

        tzone-buddy = stdenv.mkDerivation {
          pname = "tzone-buddy";
          inherit version;

          src = ./.;

          nativeBuildInputs = [
            bun2nixPkg.hook
            pkgs.makeWrapper
          ];

          bunDeps = bun2nixPkg.fetchBunDeps {
            bunNix = ./bun.nix;
          };

          # bun2nix defaults to `--linker=isolated` with hardlinks on Linux; the nix
          # sandbox refuses link() across the cache copy. Force symlink backend (same
          # trick bun2nix uses on darwin).
          bunInstallFlags = "--linker=isolated --backend=symlink";

          # `bun build --compile` is broken in the nix sandbox: it silently produces
          # a copy of the bun binary itself with no JS embedded (output runs as plain
          # bun, exit 0, no error). Bundling without --compile and wrapping with
          # `pkgs.bun` at runtime works correctly and is more idiomatic for nix anyway.
          bunBuildFlags = "--target=bun --minify src/cli.tsx --outfile cli.js";

          # ink statically imports `react-devtools-core` in its devtools.js even
          # though it's only loaded dynamically when DEV=true (peer-optional dep).
          # Bun's bundler resolves it at build time, so stub it out — same trick
          # used in .github/workflows/release.yml.
          preBuild = ''
            mkdir -p node_modules/react-devtools-core
            cat > node_modules/react-devtools-core/package.json <<'EOF'
            {"name":"react-devtools-core","version":"0.0.0","main":"index.js"}
            EOF
            cat > node_modules/react-devtools-core/index.js <<'EOF'
            module.exports = { initialize: () => {}, connectToDevTools: () => {} };
            EOF
          '';

          doCheck = false;
          dontUseBunCheck = true;
          dontUseBunInstall = true;

          installPhase = ''
            runHook preInstall

            install -Dm644 cli.js $out/share/tzone-buddy/cli.js

            makeWrapper ${pkgs.bun}/bin/bun $out/bin/tzone-buddy \
              --add-flags "$out/share/tzone-buddy/cli.js"

            runHook postInstall
          '';

          meta = {
            description = "Terminal-based World Time Buddy TUI";
            homepage = "https://github.com/kurisu-agent/tzone-buddy";
            license = lib.licenses.mit;
            mainProgram = "tzone-buddy";
            platforms = lib.platforms.unix;
          };
        };
      in {
        packages = {
          default = tzone-buddy;
          tzone-buddy = tzone-buddy;
        };

        apps.default = {
          type = "app";
          program = "${tzone-buddy}/bin/tzone-buddy";
        };

        devShells.default = pkgs.mkShell {
          packages = [ pkgs.bun bun2nixPkg ];
        };
      });
}
