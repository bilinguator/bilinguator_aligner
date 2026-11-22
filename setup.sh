#!/usr/bin/env bash
set -e

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
curl -fL --progress-bar -A "bilinguator-setup" "$REPO_API_URL" -o "$TMP_ZIP"

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

echo "[5/5] Setting up global command and alias 'bilinguator_aligner'..."
mkdir -p "$BIN_DIR"

cat << EOF > "$LAUNCHER"
#!/usr/bin/env bash
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

# Unconditionally register PATH and alias in bash and zsh configs
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

echo ""
echo "Installation complete! Installed to: $APP_DIR"
echo "You can now run: bilinguator_aligner"

# Reload current shell so alias and PATH work immediately
if [ -t 1 ] && [ -n "$SHELL" ]; then
    exec "$SHELL" -l
fi