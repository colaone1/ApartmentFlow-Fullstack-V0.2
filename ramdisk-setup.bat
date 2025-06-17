@echo off
REM RAM Disk Setup Script

REM Check if ImDisk is installed
if not exist "C:\Program Files\ImDisk\imdisk.exe" (
    echo ImDisk is not installed. Please install it from:
    echo https://sourceforge.net/projects/imdisk-toolkit/
    pause
    exit /b 1
)

REM Create RAM disk
"C:\Program Files\ImDisk\imdisk.exe" -a -s 2G -m R: -p "/fs:ntfs /q /y"

REM Create directories
mkdir "R:\npm-cache"
mkdir "R:\jest-cache"
mkdir "R:\tmp"

REM Set environment variables
setx TMPDIR "R:\tmp"
setx NPM_CONFIG_CACHE "R:\npm-cache"
setx JEST_CACHE_DIR "R:\jest-cache"

echo RAM disk setup complete!
echo Please restart your terminal to apply the changes.
pause 