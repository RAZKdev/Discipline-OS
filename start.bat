@echo off
setlocal enabledelayedexpansion
title Discipline-OS

echo ========================================================
echo                 DISCIPLINE-OS LAUNCHER
echo      Sistem Konsistensi Bebas Rasa Bersalah (No Shame)
echo ========================================================
echo.

cd /d "%~dp0"

:: 1. Verifikasi ketersediaan Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan di PATH sistem Anda.
    echo Silakan instal Node.js terlebih dahulu dari https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Verifikasi paket dependencies
if not exist "node_modules\" (
    echo [INFO] Folder node_modules belum ditemukan. Menginstal dependensi...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Gagal menginstal dependensi.
        pause
        exit /b 1
    )
)

echo [INFO] Menyiapkan server Discipline-OS di http://localhost:3000 ...
echo [INFO] Tekan Ctrl+C di terminal ini kapan saja untuk menghentikan server.
echo.

:: 3. Buka peramban otomatis setelah jeda singkat
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

:: 4. Jalankan Next.js development server
call npm run dev

pause
