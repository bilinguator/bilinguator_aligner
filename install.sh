#!/usr/bin/env bash
set -e

export UV_HTTP_TIMEOUT=300
export UV_HTTP_RETRIES=15

REPO_API_URL="https://api.github.com/repos/bilinguator/bilinguator_aligner/zipball"
APP_DIR="$HOME/bilinguator_aligner"
VENV_DIR="$APP_DIR/bilinguator_aligner"
BIN_DIR="$HOME/.local/bin"
LAUNCHER="$BIN_DIR/bilinguator_aligner"
ICON_PATH="$APP_DIR/static/icon.png"
TMP_ZIP="/tmp/bilinguator_aligner.zip"
OS_TYPE="$(uname -s)"

echo "[1/5] Checking for uv..."
if ! command -v uv &> /dev/null; then
    echo "Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$BIN_DIR:$HOME/.cargo/bin:$PATH"
fi

echo "[2/5] Downloading Python 3.10 and creating virtual environment 'bilinguator_aligner'..."
mkdir -p "$APP_DIR"
cd "$APP_DIR"
uv venv "$VENV_DIR" --python 3.10 --seed --clear

echo "[3/5] Downloading repository from GitHub..."
rm -f "$TMP_ZIP"
curl -fL --progress-bar -A "bilinguator-install" "$REPO_API_URL" -o "$TMP_ZIP"

"$VENV_DIR/bin/python" -c "
import zipfile, shutil, os, tempfile

if not zipfile.is_zipfile('$TMP_ZIP'):
    raise RuntimeError('Downloaded file is not a valid ZIP archive. Check if the repository is public.')

with tempfile.TemporaryDirectory() as tmpdir:
    with zipfile.ZipFile('$TMP_ZIP', 'r') as zf:
        zf.extractall(tmpdir)
    src_dir = None
    for root, dirs, files in os.walk(tmpdir):
        if 'pyproject.toml' in files:
            src_dir = root
            break
    if not src_dir:
        raise FileNotFoundError('pyproject.toml not found in downloaded archive')
    shutil.copytree(src_dir, '$APP_DIR', dirs_exist_ok=True)
"
rm -f "$TMP_ZIP"

echo "[4/5] Installing dependencies from pyproject.toml..."
uv pip install --python "$VENV_DIR/bin/python" -r "$APP_DIR/pyproject.toml"

echo "[5/5] Setting up global command, desktop shortcut, and uninstaller..."
mkdir -p "$BIN_DIR"

cat << EOF > "$LAUNCHER"
#!/usr/bin/env bash

# Support both 'bilinguator_aligner <flag>' and 'bilinguator aligner <flag>'
if [[ "\$1" == "aligner" ]]; then
    shift
fi

if [[ "\$1" == "--help" || "\$1" == "-h" ]]; then
    APP_VER="1.0"
    if [ -f "$APP_DIR/VERSION" ]; then
        APP_VER=\$(tr -d '[:space:]' < "$APP_DIR/VERSION")
    fi
    if [ -f "$APP_DIR/HELP" ]; then
        sed "s/{{VERSION}}/\$APP_VER/g" "$APP_DIR/HELP"
        echo ""
    else
        echo "Bilinguator Aligner v\$APP_VER"
        echo "Usage: bilinguator_aligner [--version | --help | --uninstall]"
    fi
    exit 0
fi

if [[ "\$1" == "--version" || "\$1" == "-v" ]]; then
    if [ -f "$APP_DIR/VERSION" ]; then
        tr -d '[:space:]' < "$APP_DIR/VERSION"
        echo ""
    else
        echo "1.0"
    fi
    exit 0
fi

if [[ "\$1" == "--uninstall" ]]; then
    read -p "Are you sure you want to uninstall bilinguator_aligner? [y/N] " confirm
    if [[ "\$confirm" =~ ^[Yy]$ ]]; then
        echo "Removing application files, icon, and virtual environment..."
        rm -rf "$APP_DIR"
        rm -f "$LAUNCHER"

        # Remove Linux desktop entry
        rm -f "\$HOME/.local/share/applications/bilinguator_aligner.desktop"
        if command -v update-desktop-database &> /dev/null; then
            update-desktop-database "\$HOME/.local/share/applications" 2>/dev/null || true
        fi

        # Remove macOS .app bundle (including AppIcon.icns)
        rm -rf "\$HOME/Applications/Bilinguator Aligner.app"

        if [ -L "/usr/local/bin/bilinguator_aligner" ]; then
            rm -f /usr/local/bin/bilinguator_aligner 2>/dev/null || sudo rm -f /usr/local/bin/bilinguator_aligner
        fi
        for RC_FILE in "\$HOME/.bashrc" "\$HOME/.zshrc"; do
            if [ -f "\$RC_FILE" ]; then
                sed -i.bak '/alias bilinguator_aligner=/d' "\$RC_FILE" && rm -f "\${RC_FILE}.bak"
            fi
        done
        echo "bilinguator_aligner has been uninstalled."
        echo "Note: 'uv' and its global cache (~/.cache/uv) were kept. Run 'uv cache clean' to free disk space."
        if [ -t 1 ] && [ -n "\$SHELL" ]; then
            exec "\$SHELL" -l
        fi
    else
        echo "Uninstallation cancelled."
    fi
    exit 0
fi

cd "$APP_DIR"
exec "$VENV_DIR/bin/python" "$APP_DIR/bilinguator_aligner.py" "\$@"
EOF
chmod +x "$LAUNCHER"

# Create system-wide symlink if /usr/local/bin is writable or sudo is available
if [ -w "/usr/local/bin" ]; then
    ln -sf "$LAUNCHER" /usr/local/bin/bilinguator_aligner
elif command -v sudo &> /dev/null && sudo -n true 2>/dev/null; then
    sudo ln -sf "$LAUNCHER" /usr/local/bin/bilinguator_aligner
fi

# Unconditionally register PATH and aliases in bash and zsh configs
for RC_FILE in "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile"; do
    touch "$RC_FILE"
    if ! grep -q 'export PATH="$HOME/.local/bin:$PATH"' "$RC_FILE"; then
        printf '\nexport PATH="$HOME/.local/bin:$PATH"\n' >> "$RC_FILE"
    fi
    if [[ "$RC_FILE" != "$HOME/.profile" ]]; then
        sed -i.bak '/alias bilinguator_aligner=/d' "$RC_FILE" && rm -f "${RC_FILE}.bak"
        echo "alias bilinguator_aligner='$LAUNCHER'" >> "$RC_FILE"
    fi
done

# Create application menu entry depending on OS
if [[ "$OS_TYPE" == "Linux" ]]; then
    DESKTOP_DIR="$HOME/.local/share/applications"
    DESKTOP_FILE="$DESKTOP_DIR/bilinguator_aligner.desktop"
    mkdir -p "$DESKTOP_DIR"

    cat << EOF > "$DESKTOP_FILE"
[Desktop Entry]
Version=1.0
Type=Application
Name=Bilinguator Aligner
Comment=Parallel text alignment and bilingual ebook creator
Exec=$LAUNCHER
Icon=$ICON_PATH
Terminal=true
Categories=Office;Education;Utility;
StartupNotify=true
EOF

    chmod +x "$DESKTOP_FILE"
    if command -v update-desktop-database &> /dev/null; then
        update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
    fi

elif [[ "$OS_TYPE" == "Darwin" ]]; then
    MAC_APP_DIR="$HOME/Applications/Bilinguator Aligner.app"
    MAC_CONTENTS="$MAC_APP_DIR/Contents"
    mkdir -p "$MAC_CONTENTS/MacOS" "$MAC_CONTENTS/Resources"

    cat << EOF > "$MAC_CONTENTS/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>Bilinguator Aligner</string>
    <key>CFBundleIdentifier</key>
    <string>com.bilinguator.aligner</string>
    <key>CFBundleName</key>
    <string>Bilinguator Aligner</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
</dict>
</plist>
EOF

    cat << EOF > "$MAC_CONTENTS/MacOS/Bilinguator Aligner"
#!/usr/bin/env bash
osascript -e 'tell application "Terminal" to activate' -e 'tell application "Terminal" to do script "$LAUNCHER"'
EOF
    chmod +x "$MAC_CONTENTS/MacOS/Bilinguator Aligner"

    # Convert static/icon.png to native macOS .icns
    if [ -f "$ICON_PATH" ] && command -v sips &> /dev/null && command -v iconutil &> /dev/null; then
        ICONSET_DIR="/tmp/BilinguatorAligner.iconset"
        rm -rf "$ICONSET_DIR"
        mkdir -p "$ICONSET_DIR"
        sips -z 16 16     "$ICON_PATH" --out "$ICONSET_DIR/icon_16x16.png"      >/dev/null 2>&1 || true
        sips -z 32 32     "$ICON_PATH" --out "$ICONSET_DIR/icon_16x16@2x.png"   >/dev/null 2>&1 || true
        sips -z 32 32     "$ICON_PATH" --out "$ICONSET_DIR/icon_32x32.png"      >/dev/null 2>&1 || true
        sips -z 64 64     "$ICON_PATH" --out "$ICONSET_DIR/icon_32x32@2x.png"   >/dev/null 2>&1 || true
        sips -z 128 128   "$ICON_PATH" --out "$ICONSET_DIR/icon_128x128.png"    >/dev/null 2>&1 || true
        sips -z 256 256   "$ICON_PATH" --out "$ICONSET_DIR/icon_128x128@2x.png" >/dev/null 2>&1 || true
        sips -z 256 256   "$ICON_PATH" --out "$ICONSET_DIR/icon_256x256.png"    >/dev/null 2>&1 || true
        sips -z 512 512   "$ICON_PATH" --out "$ICONSET_DIR/icon_256x256@2x.png" >/dev/null 2>&1 || true
        iconutil -c icns "$ICONSET_DIR" -o "$MAC_CONTENTS/Resources/AppIcon.icns" >/dev/null 2>&1 || true
        rm -rf "$ICONSET_DIR"
    fi
fi

echo ""
echo "Installation complete! Installed to: $APP_DIR"
echo "You can launch 'Bilinguator Aligner' from your Applications menu or run:"
echo "  bilinguator_aligner             - Start the application"
echo "  bilinguator_aligner --help      - View help"
echo "  bilinguator_aligner --version   - Check version"
echo "  bilinguator_aligner --uninstall - Uninstall the application"

# Reload current shell so alias and PATH work immediately
if [ -t 1 ] && [ -n "$SHELL" ]; then
    exec "$SHELL" -l
fi