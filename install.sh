#!/bin/bash
set -e

# tzone-buddy installer script
# Usage: curl -fsSL https://raw.githubusercontent.com/kurisu-agent/tzone-buddy/main/install.sh | bash

REPO="kurisu-agent/tzone-buddy"
BINARY_NAME="tzone-buddy"
INSTALL_DIR="${HOME}/.local/bin"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
info() {
    echo -e "${BLUE}[INFO]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" >&2
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

# Detect OS and architecture
detect_platform() {
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)

    case "$OS" in
        linux)
            PLATFORM="linux"
            ;;
        darwin)
            PLATFORM="darwin"
            ;;
        *)
            error "Unsupported operating system: $OS"
            ;;
    esac

    case "$ARCH" in
        x86_64|amd64)
            ARCHITECTURE="x64"
            ;;
        arm64|aarch64)
            ARCHITECTURE="arm64"
            ;;
        *)
            error "Unsupported architecture: $ARCH"
            ;;
    esac

    ASSET_NAME="${BINARY_NAME}-${PLATFORM}-${ARCHITECTURE}"
    info "Detected platform: $PLATFORM-$ARCHITECTURE"
}

# Get the latest release version
get_latest_version() {
    info "Fetching latest release version..."

    LATEST_VERSION=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" | \
                     grep '"tag_name"' | \
                     sed -E 's/.*"([^"]+)".*/\1/')

    if [ -z "$LATEST_VERSION" ]; then
        error "Failed to fetch latest version"
    fi

    info "Latest version: $LATEST_VERSION"
}

# Download the binary
download_binary() {
    local download_url="https://github.com/${REPO}/releases/download/${LATEST_VERSION}/${ASSET_NAME}"
    local temp_file="/tmp/${BINARY_NAME}-download"

    info "Downloading ${BINARY_NAME} from: $download_url"

    if ! curl -fsSL "$download_url" -o "$temp_file"; then
        error "Failed to download binary"
    fi

    # Make binary executable
    chmod +x "$temp_file"

    echo "$temp_file"
}

# Create install directory if it doesn't exist
ensure_install_dir() {
    if [ ! -d "$INSTALL_DIR" ]; then
        info "Creating install directory: $INSTALL_DIR"
        mkdir -p "$INSTALL_DIR"
    fi
}

# Check if directory is in PATH
check_path() {
    if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
        warn "$INSTALL_DIR is not in your PATH"

        # Detect shell and provide instructions
        SHELL_NAME=$(basename "$SHELL")
        case "$SHELL_NAME" in
            bash)
                RC_FILE="$HOME/.bashrc"
                ;;
            zsh)
                RC_FILE="$HOME/.zshrc"
                ;;
            fish)
                RC_FILE="$HOME/.config/fish/config.fish"
                ;;
            *)
                RC_FILE="your shell configuration file"
                ;;
        esac

        echo "" >&2
        echo "To add it to your PATH, run:" >&2
        echo "" >&2
        if [ "$SHELL_NAME" = "fish" ]; then
            echo "  echo 'set -gx PATH \$PATH $INSTALL_DIR' >> $RC_FILE" >&2
        else
            echo "  echo 'export PATH=\"\$PATH:$INSTALL_DIR\"' >> $RC_FILE" >&2
        fi
        echo "" >&2
        echo "Then reload your shell configuration:" >&2
        echo "  source $RC_FILE" >&2
        echo "" >&2
    fi
}

# Install the binary
install_binary() {
    local temp_file="$1"
    local target_path="$INSTALL_DIR/$BINARY_NAME"

    info "Installing ${BINARY_NAME} to $target_path"

    # Check if binary already exists
    if [ -f "$target_path" ]; then
        # Check if it's the same version
        if command -v "$BINARY_NAME" >/dev/null 2>&1; then
            warn "${BINARY_NAME} is already installed. Updating..."
        fi
    fi

    # Move binary to install directory
    mv "$temp_file" "$target_path"

    success "${BINARY_NAME} has been installed successfully!"
}

# Main installation flow
main() {
    echo "" >&2
    echo "================================" >&2
    echo "  tzone-buddy installer" >&2
    echo "================================" >&2
    echo "" >&2

    # Check for required tools
    for tool in curl sed grep; do
        if ! command -v "$tool" >/dev/null 2>&1; then
            error "Required tool '$tool' is not installed"
        fi
    done

    detect_platform
    get_latest_version

    # Download binary
    TEMP_BINARY=$(download_binary)

    ensure_install_dir
    install_binary "$TEMP_BINARY"
    check_path

    echo "" >&2
    success "Installation complete!"
    echo "" >&2
    echo "Run '${BINARY_NAME}' to start the application" >&2
    echo "" >&2
}

# Run main function
main "$@"