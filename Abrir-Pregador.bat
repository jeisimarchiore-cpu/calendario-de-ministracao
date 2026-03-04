@echo off
setlocal

rem Inicia um servidor HTTP local e abre o sistema no navegador.
rem (Abrir o index.html direto por file:// pode falhar por causa de ES Modules.)

set "PORT=8000"
set "URL=http://localhost:%PORT%/"

pushd "%~dp0"

echo.
echo ================================================
echo  Pregador - Abrir Sistema
echo ================================================
echo.
echo Pasta: %CD%
echo URL:   %URL%
echo.

rem Abre o navegador apos iniciar o servidor
start "Pregador" cmd /c "timeout /t 1 >nul & start "" "%URL%""

rem Tenta iniciar com o launcher do Python (Windows)
where py >nul 2>nul
if %errorlevel%==0 (
  echo Iniciando servidor com: py -m http.server %PORT%
  py -m http.server %PORT%
  goto :eof
)

rem Fallback: python no PATH
where python >nul 2>nul
if %errorlevel%==0 (
  echo Iniciando servidor com: python -m http.server %PORT%
  python -m http.server %PORT%
  goto :eof
)

echo.
echo ERRO: Nao encontrei Python instalado (comandos 'py' ou 'python').
echo Para usar este atalho, instale o Python 3:
echo https://www.python.org/downloads/
echo.
echo Depois, execute este arquivo novamente.
echo.
pause
