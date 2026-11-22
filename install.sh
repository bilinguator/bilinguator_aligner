#!/usr/bin/env bash
set -e

export UV_HTTP_TIMEOUT=300
export UV_HTTP_RETRIES=15

REPO_API_URL="https://api.github.com/repos/bilinguator/bilinguator_aligner/zipball"
APP_DIR="$HOME/bilinguator_aligner"
VENV_DIR="$APP_DIR/bilinguator_aligner"
BIN_DIR="$HOME/.local/bin"
LAUNCHER="$BIN_DIR/bilinguator_aligner"
TMP_ZIP="/tmp/bilinguator_aligner.zip"

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
        if 'requirements.txt' in files:
            src_dir = root
            break
    if not src_dir:
        raise FileNotFoundError('requirements.txt not found in downloaded archive')
    shutil.copytree(src_dir, '$APP_DIR', dirs_exist_ok=True)
"
rm -f "$TMP_ZIP"

echo "[4/5] Installing dependencies from requirements.txt..."
uv pip install --python "$VENV_DIR/bin/python" -r "$APP_DIR/requirements.txt"

echo "[5/5] Setting up global command, alias, and uninstaller..."
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
        echo "Removing application files and virtual environment..."
        rm -rf "$APP_DIR"
        rm -f "$LAUNCHER"
        if [ -L "/usr/local/bin/bilinguator_aligner" ]; then
            rm -f /usr/local/bin/bilinguator_aligner 2>/dev/null || sudo rm -f /usr/local/bin/bilinguator_aligner
        fi
        for RC_FILE in "\$HOME/.bashrc" "\$HOME/.zshrc"; do
            if [ -f "\$RC_FILE" ]; then
                sed -i.bak '/alias bilinguator_aligner=/d' "\$RC_FILE" && rm -f "\${RC_FILE}.bak"
                sed -i.bak '/alias bilinguator=/d' "\$RC_FILE" && rm -f "\${RC_FILE}.bak"
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
        sed -i.bak '/alias bilinguator=/d' "$RC_FILE" && rm -f "${RC_FILE}.bak"
        echo "alias bilinguator_aligner='$LAUNCHER'" >> "$RC_FILE"
        echo "alias bilinguator='$LAUNCHER'" >> "$RC_FILE"
    fi
done

echo ""
echo "Installation complete! Installed to: $APP_DIR"
echo "To start the app, run: bilinguator_aligner"
echo "To view help, run: bilinguator_aligner --help"
echo "To check version, run: bilinguator_aligner --version"
echo "To uninstall the app, run: bilinguator_aligner --uninstall"

# Reload current shell so alias and PATH work immediately
if [ -t 1 ] && [ -n "$SHELL" ]; then
    exec "$SHELL" -l
fi