@echo off
chcp 65001 >nul

set "UV_HTTP_TIMEOUT=300"
set "UV_HTTP_RETRIES=15"

set "REPO_API_URL=https://api.github.com/repos/bilinguator/bilinguator_aligner/zipball"
set "APP_DIR=%USERPROFILE%\bilinguator_aligner"
set "VENV_DIR=%APP_DIR%\bilinguator_aligner"
set "BIN_DIR=%USERPROFILE%\.local\bin"
set "LAUNCHER=%BIN_DIR%\bilinguator_aligner.cmd"
set "START_MENU_LNK=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Bilinguator Aligner.lnk"
set "TMP_ZIP=%TEMP%\bilinguator_aligner.zip"
set "TMP_EXTRACT=%TEMP%\bilinguator_extract"

echo [1/5] Downloading repository from GitHub...
powershell -NoProfile -ExecutionPolicy ByPass -Command ^
    "$ErrorActionPreference = 'Stop';" ^
    "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;" ^
    "Invoke-WebRequest -Uri '%REPO_API_URL%' -Headers @{'User-Agent'='bilinguator-install'} -OutFile '%TMP_ZIP%';" ^
    "if (Test-Path '%TMP_EXTRACT%') { Remove-Item -Recurse -Force '%TMP_EXTRACT%' };" ^
    "Expand-Archive -Path '%TMP_ZIP%' -DestinationPath '%TMP_EXTRACT%' -Force;" ^
    "$reqFile = Get-ChildItem -Path '%TMP_EXTRACT%' -Filter 'requirements.txt' -Recurse | Select-Object -First 1;" ^
    "if (-not $reqFile) { throw 'requirements.txt not found inside downloaded archive.' }" ^
    "if (!(Test-Path '%APP_DIR%')) { New-Item -ItemType Directory -Path '%APP_DIR%' | Out-Null };" ^
    "Copy-Item -Path \"$($reqFile.DirectoryName)\*\" -Destination '%APP_DIR%' -Recurse -Force;" ^
    "Remove-Item -Force '%TMP_ZIP%';" ^
    "Remove-Item -Recurse -Force '%TMP_EXTRACT%'"

if %errorlevel% neq 0 (
    echo Error during download or extraction. Check internet connection or repository visibility.
    pause
    exit /b 1
)

cd /d "%APP_DIR%"

echo [2/5] Checking for uv...
where uv >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing uv...
    powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
    set "PATH=%BIN_DIR%;%USERPROFILE%\.cargo\bin;%PATH%"
)

echo [3/5] Downloading Python 3.10 and creating virtual environment 'bilinguator_aligner'...
if exist "%VENV_DIR%" rmdir /s /q "%VENV_DIR%"
uv venv "%VENV_DIR%" --python 3.10 --seed --clear

echo [4/5] Installing dependencies from requirements.txt...
uv pip install --python "%VENV_DIR%\Scripts\python.exe" -r "%APP_DIR%\requirements.txt"

echo [5/5] Creating global command, Start Menu shortcut, and uninstaller...
if not exist "%BIN_DIR%" mkdir "%BIN_DIR%"

(
echo @echo off
echo if "%%~1"=="--help" goto :show_help
echo if "%%~1"=="-h" goto :show_help
echo if "%%~1"=="--version" goto :show_version
echo if "%%~1"=="-v" goto :show_version
echo if "%%~1"=="--uninstall" goto :uninstall
echo cd /d "%APP_DIR%"
echo "%VENV_DIR%\Scripts\python.exe" "%APP_DIR%\bilinguator_aligner.py" %%*
echo exit /b %%errorlevel%%
echo.
echo :show_help
echo chcp 65001 ^>nul
echo set "APP_VER=1.0"
echo if exist "%APP_DIR%\VERSION" set /p APP_VER=^<"%APP_DIR%\VERSION"
echo if exist "%APP_DIR%\HELP" ^(
echo     powershell -NoProfile -Command "(Get-Content -Raw -Encoding UTF8 '%APP_DIR%\HELP') -replace '\{\{VERSION\}\}', '%%APP_VER%%' | Write-Host"
echo ^) else ^(
echo     echo Bilinguator Aligner v%%APP_VER%%
echo     echo Usage: bilinguator_aligner [--version ^| --help ^| --uninstall]
echo ^)
echo exit /b 0
echo.
echo :show_version
echo if exist "%APP_DIR%\VERSION" ^(
echo     type "%APP_DIR%\VERSION"
echo     echo.
echo ^) else ^(
echo     echo 1.0
echo ^)
echo exit /b 0
echo.
echo :uninstall
echo set /p "confirm=Are you sure you want to uninstall bilinguator_aligner? [y/N]: "
echo if /i "%%confirm%%"=="y" ^(
echo     echo Removing application files, shortcut, and virtual environment...
echo     if exist "%START_MENU_LNK%" del /f /q "%START_MENU_LNK%"
echo     rmdir /s /q "%APP_DIR%"
echo     echo bilinguator_aligner has been uninstalled.
echo     echo Note: 'uv' cache was kept. Run 'uv cache clean' to free disk space.
echo     ^(goto^) 2^>nul ^& del "%LAUNCHER%"
echo ^) else ^(
echo     echo Uninstallation cancelled.
echo ^)
echo exit /b 0
) > "%LAUNCHER%"

:: Register BIN_DIR in User PATH and create Start Menu shortcut with .ico converted from static\icon.png
powershell -NoProfile -ExecutionPolicy ByPass -Command ^
    "$bin = '%BIN_DIR%';" ^
    "$userPath = [Environment]::GetEnvironmentVariable('Path', 'User');" ^
    "if ($userPath -notlike \"*$bin*\") {" ^
    "    [Environment]::SetEnvironmentVariable('Path', \"$userPath;$bin\", 'User');" ^
    "}" ^
    "$pngPath = '%APP_DIR%\static\icon.png';" ^
    "$icoPath = '%APP_DIR%\static\icon.ico';" ^
    "if (Test-Path $pngPath) {" ^
    "    Add-Type -AssemblyName System.Drawing;" ^
    "    $img = [System.Drawing.Image]::FromFile($pngPath);" ^
    "    $bmp = New-Object System.Drawing.Bitmap($img, 256, 256);" ^
    "    $fs = [System.IO.File]::Create($icoPath);" ^
    "    $bw = New-Object System.IO.BinaryWriter($fs);" ^
    "    $bw.Write([uint16]0); $bw.Write([uint16]1); $bw.Write([uint16]1);" ^
    "    $ms = New-Object System.IO.MemoryStream;" ^
    "    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png);" ^
    "    $bytes = $ms.ToArray();" ^
    "    $bw.Write([byte]0); $bw.Write([byte]0); $bw.Write([byte]0); $bw.Write([byte]0);" ^
    "    $bw.Write([uint16]1); $bw.Write([uint16]32);" ^
    "    $bw.Write([uint32]$bytes.Length); $bw.Write([uint32]22);" ^
    "    $bw.Write($bytes);" ^
    "    $bw.Close(); $fs.Close(); $ms.Close(); $bmp.Dispose(); $img.Dispose();" ^
    "}" ^
    "$ws = New-Object -ComObject WScript.Shell;" ^
    "$sc = $ws.CreateShortcut('%START_MENU_LNK%');" ^
    "$sc.TargetPath = '%LAUNCHER%';" ^
    "$sc.WorkingDirectory = '%APP_DIR%';" ^
    "$sc.Description = 'Parallel text alignment and bilingual ebook creator';" ^
    "if (Test-Path $icoPath) { $sc.IconLocation = $icoPath };" ^
    "$sc.Save()"

echo.
echo Installation complete! Installed to: %APP_DIR%
echo Please restart your terminal or launch 'Bilinguator Aligner' from the Start Menu.
echo   bilinguator_aligner             - Start the application
echo   bilinguator_aligner --help      - View help
echo   bilinguator_aligner --version   - Check version
echo   bilinguator_aligner --uninstall - Uninstall the application

echo %cmdcmdline% | find /i "/c" >nul
if not errorlevel 1 pause