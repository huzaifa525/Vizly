@echo off
REM =============================================================================
REM Vizly Environment Setup Script (Windows)
REM This script helps you set up all required environment variables
REM =============================================================================

setlocal enabledelayedexpansion

echo ========================================================================
echo                   Vizly Environment Setup
echo ========================================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3 first.
    pause
    exit /b 1
)

echo [OK] Python is installed
echo.

REM =============================================================================
REM Generate SECRET_KEY
REM =============================================================================

echo Generating SECRET_KEY...
for /f "delims=" %%i in ('python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"') do set SECRET_KEY=%%i
echo [OK] SECRET_KEY generated
echo.

REM =============================================================================
REM Generate ENCRYPTION_SALT
REM =============================================================================

echo Generating ENCRYPTION_SALT...
for /f "delims=" %%i in ('python -c "import os, base64; print(base64.b64encode(os.urandom(32)).decode())"') do set ENCRYPTION_SALT=%%i
echo [OK] ENCRYPTION_SALT generated
echo.

REM =============================================================================
REM Update .env files
REM =============================================================================

echo Setting up environment files...
echo.

REM Root .env
if exist .env (
    echo Updating root .env file...
    powershell -Command "(gc .env) -replace '^SECRET_KEY=.*', 'SECRET_KEY=%SECRET_KEY%' | Out-File -encoding ASCII .env"
    powershell -Command "(gc .env) -replace '^ENCRYPTION_SALT=.*', 'ENCRYPTION_SALT=%ENCRYPTION_SALT%' | Out-File -encoding ASCII .env"
    echo [OK] Root .env updated
) else (
    echo Root .env not found, copying from .env.example...
    copy .env.example .env >nul
    powershell -Command "(gc .env) -replace '^SECRET_KEY=.*', 'SECRET_KEY=%SECRET_KEY%' | Out-File -encoding ASCII .env"
    powershell -Command "(gc .env) -replace '^ENCRYPTION_SALT=.*', 'ENCRYPTION_SALT=%ENCRYPTION_SALT%' | Out-File -encoding ASCII .env"
    echo [OK] Root .env created
)

REM Backend .env
if exist backend\.env (
    echo Updating backend\.env file...
    powershell -Command "(gc backend\.env) -replace '^SECRET_KEY=.*', 'SECRET_KEY=%SECRET_KEY%' | Out-File -encoding ASCII backend\.env"
    powershell -Command "(gc backend\.env) -replace '^ENCRYPTION_SALT=.*', 'ENCRYPTION_SALT=%ENCRYPTION_SALT%' | Out-File -encoding ASCII backend\.env"
    echo [OK] Backend .env updated
) else (
    echo Backend .env not found, copying from .env.example...
    copy backend\.env.example backend\.env >nul
    powershell -Command "(gc backend\.env) -replace '^SECRET_KEY=.*', 'SECRET_KEY=%SECRET_KEY%' | Out-File -encoding ASCII backend\.env"
    powershell -Command "(gc backend\.env) -replace '^ENCRYPTION_SALT=.*', 'ENCRYPTION_SALT=%ENCRYPTION_SALT%' | Out-File -encoding ASCII backend\.env"
    echo [OK] Backend .env created
)

REM Frontend .env
if not exist frontend\.env (
    echo Frontend .env not found, copying from .env.example...
    copy frontend\.env.example frontend\.env >nul
    echo [OK] Frontend .env created
)

echo.
echo ========================================================================
echo                    Setup Complete!
echo ========================================================================
echo.

REM =============================================================================
REM Display next steps
REM =============================================================================

echo Generated Credentials (save these securely):
echo.
echo SECRET_KEY:
echo %SECRET_KEY%
echo.
echo ENCRYPTION_SALT:
echo %ENCRYPTION_SALT%
echo.

echo Next Steps:
echo.
echo 1. Review your .env files:
echo    - Root: .env
echo    - Backend: backend\.env
echo    - Frontend: frontend\.env
echo.
echo 2. Run database migrations:
echo    cd backend
echo    python manage.py makemigrations
echo    python manage.py migrate
echo.
echo 3. Create a superuser:
echo    python manage.py createsuperuser
echo.
echo 4. Start the development servers:
echo    # Backend (from backend directory)
echo    python manage.py runserver
echo.
echo    # Frontend (from frontend directory)
echo    npm run dev
echo.
echo Your environment is now configured and secure!
echo.
echo WARNING: Never commit .env files to version control!
echo.

pause
