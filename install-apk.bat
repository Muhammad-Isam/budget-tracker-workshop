@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo          Budget Expense Tracker - Android ADB Sideload Utility
echo ======================================================================
echo.

:: 1. Verify ADB availability
where adb >nul 2>nul
if %ERRORLEVEL% equ 0 (
    set "ADB_CMD=adb"
) else (
    if exist "%USERPROFILE%\platform-tools\adb.exe" (
        set "ADB_CMD=%USERPROFILE%\platform-tools\adb.exe"
    ) else if exist "C:\Users\isamb\platform-tools\adb.exe" (
        set "ADB_CMD=C:\Users\isamb\platform-tools\adb.exe"
    ) else (
        echo [ERROR] ADB not found in PATH or standard platform-tools directory.
        echo Please ensure Android Platform Tools are installed.
        pause
        exit /b 1
    )
)

echo [INFO] Using ADB at: %ADB_CMD%
%ADB_CMD% version
echo.

:: 2. Check for connected Android devices
echo [INFO] Checking for connected Android devices...
%ADB_CMD% devices -l
echo.

:: Check if at least one authorized device is connected
for /f "skip=1 tokens=1,2" %%A in ('%ADB_CMD% devices') do (
    if "%%B"=="device" (
        set "DEVICE_FOUND=%%A"
    )
)

if "%DEVICE_FOUND%"=="" (
    echo [WARNING] No authorized Android device detected!
    echo Please make sure:
    echo  1. Your Android phone is connected via USB.
    echo  2. "USB Debugging" is enabled in Developer Options.
    echo  3. You accepted the "Allow USB debugging" prompt on your phone screen.
    echo.
    echo Press any key to retry detection...
    pause >nul
    for /f "skip=1 tokens=1,2" %%A in ('%ADB_CMD% devices') do (
        if "%%B"=="device" (
            set "DEVICE_FOUND=%%A"
        )
    )
    if "%DEVICE_FOUND%"=="" (
        echo [ERROR] Still no device detected. Aborting.
        pause
        exit /b 1
    )
)

echo [SUCCESS] Device detected: %DEVICE_FOUND%
echo.

:: 3. Locate compiled APK file
set "APK_PATH="
if exist "%~dp0BudgetTracker-Release.apk" (
    set "APK_PATH=%~dp0BudgetTracker-Release.apk"
) else if exist "%~dp0app-release.apk" (
    set "APK_PATH=%~dp0app-release.apk"
) else if exist "%~dp0android\app\build\outputs\apk\release\app-release.apk" (
    set "APK_PATH=%~dp0android\app\build\outputs\apk\release\app-release.apk"
)

if "%APK_PATH%"=="" (
    echo [ERROR] No release APK found in workspace root or android build outputs!
    echo Looked for:
    echo  - %~dp0BudgetTracker-Release.apk
    echo  - %~dp0app-release.apk
    echo  - %~dp0android\app\build\outputs\apk\release\app-release.apk
    echo.
    echo Please trigger the GitHub Actions workflow to build the APK,
    echo or download the compiled artifact and place it here as BudgetTracker-Release.apk.
    pause
    exit /b 1
)

echo [INFO] Found APK at: %APK_PATH%
echo.

:: 4. Push APK directly to device storage (/storage/emulated/0/Download/ and /storage/emulated/0/)
echo [STEP 1/3] Copying APK directly to device internal storage...
%ADB_CMD% push "%APK_PATH%" /storage/emulated/0/Download/BudgetTracker.apk
%ADB_CMD% push "%APK_PATH%" /storage/emulated/0/BudgetTracker.apk

:: Broadcast media scanner so Downloads app indexes it immediately
%ADB_CMD% shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d "file:///storage/emulated/0/Download/BudgetTracker.apk" >nul 2>nul
echo [SUCCESS] APK copied to /storage/emulated/0/Download/BudgetTracker.apk
echo.

:: 5. Install APK via ADB
echo [STEP 2/3] Installing APK onto device...
%ADB_CMD% install -r -d "%APK_PATH%"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [NOTICE] Direct ADB install was blocked by device security policy.
    echo On Xiaomi / Redmi / HyperOS devices:
    echo   - Go to Settings ^> Additional Settings ^> Developer Options.
    echo   - Enable "Install via USB" (and accept security prompt).
    echo.
    echo OPTION B (INSTANT 1-TAP INSTALL ON PHONE):
    echo   The APK has ALREADY been transferred to your phone's Downloads folder!
    echo   Simply open the "Downloads" or "File Manager" app on your phone,
    echo   tap "BudgetTracker.apk", and tap "Install".
    echo.
) else (
    :: 6. Launch Application
    echo [STEP 3/3] Launching Budget Tracker application...
    %ADB_CMD% shell am start -n com.budgettracker/.MainActivity
    echo.
    echo ======================================================================
    echo [SUCCESS] Budget Tracker APK installed and launched successfully!
    echo ======================================================================
)

echo.
pause
