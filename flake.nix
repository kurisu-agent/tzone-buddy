{
  description = "tzone-buddy — terminal-based World Time Buddy TUI";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        inherit (pkgs) lib stdenv fetchurl autoPatchelfHook;

        version = (builtins.fromJSON (builtins.readFile ./package.json)).version;

        # When cutting a new release: bump `version` in package.json (the flake
        # reads it from there), then refresh all four hashes below. Get them with:
        #   nix-prefetch-url https://github.com/kurisu-agent/tzone-buddy/releases/download/v${VERSION}/tzone-buddy-<platform>
        # then `nix hash convert --hash-algo sha256 --to sri <out>`. Or set each
        # hash to lib.fakeHash and let `nix build` surface the real one.
        sources = {
          "x86_64-linux" = {
            asset = "tzone-buddy-linux-x64";
            hash = "sha256-Tp3W6AA0yf+ZkCwcyZUYe+YtVb0pp98hi1oOsxxOtfI=";
          };
          "aarch64-linux" = {
            asset = "tzone-buddy-linux-arm64";
            hash = "sha256-GFmpH6ehCf3k7YuCRHWUB9w4hG9GW1IKfNbd4CRRp04=";
          };
          "x86_64-darwin" = {
            asset = "tzone-buddy-darwin-x64";
            hash = "sha256-/np4u7hHTZPKhS+5SAFN1wLoSCHOFeTEJ1X64U/OQyY=";
          };
          "aarch64-darwin" = {
            asset = "tzone-buddy-darwin-arm64";
            hash = "sha256-N1qg3ZSP8gtMjfw3VVCNKTf6TfaZFwuIN0Lirn93iuU=";
          };
        };

        source = sources.${system}
          or (throw "tzone-buddy: unsupported system ${system}");

        tzone-buddy = stdenv.mkDerivation {
          pname = "tzone-buddy";
          inherit version;

          src = fetchurl {
            url = "https://github.com/kurisu-agent/tzone-buddy/releases/download/v${version}/${source.asset}";
            hash = source.hash;
          };

          dontUnpack = true;

          nativeBuildInputs = lib.optionals stdenv.isLinux [ autoPatchelfHook ];
          buildInputs = lib.optionals stdenv.isLinux [ stdenv.cc.cc.lib ];

          installPhase = ''
            runHook preInstall
            install -Dm755 $src $out/bin/tzone-buddy
            runHook postInstall
          '';

          meta = {
            description = "Terminal-based World Time Buddy TUI";
            homepage = "https://github.com/kurisu-agent/tzone-buddy";
            license = lib.licenses.mit;
            mainProgram = "tzone-buddy";
            platforms = builtins.attrNames sources;
          };
        };
      in {
        packages = {
          default = tzone-buddy;
          tzone-buddy = tzone-buddy;
        };

        apps = {
          default = {
            type = "app";
            program = "${tzone-buddy}/bin/tzone-buddy";
          };
        };
      });
}
