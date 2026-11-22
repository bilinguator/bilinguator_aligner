# bilinguator_aligner
Browser-based tool for easy aligning two texts in two languages.

## Installation

### Linux / MacOS

```bash
curl -fsSL https://raw.githubusercontent.com/bilinguator/bilinguator_aligner/refs/heads/main/install.sh | bash
```

### Windows

CMD:

```bash
powershell -NoProfile -ExecutionPolicy Bypass -Command "$f = [IO.Path]::Combine($env:TEMP, 'install.bat'); irm 'https://raw.githubusercontent.com/bilinguator/bilinguator_aligner/main/install.bat' -OutFile $f; & $f; Remove-Item $f -Force"
```