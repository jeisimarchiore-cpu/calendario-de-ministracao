@echo off
setlocal

rem Inicia o servidor local (backend + frontend) e abre o navegador.

set "PORT=8787"
set "URL=http://localhost:%PORT%/"

pushd "%~dp0"

if not exist ".env" (
  echo.
  echo ================================================
  echo  PRIMEIRA CONFIGURACAO
  echo ================================================
  echo.
  echo Crie o arquivo .env na pasta do projeto.
  echo Voce pode copiar o .env.example e colar sua chave nova.
  echo.
  echo Exemplo:
  echo   GEMINI_API_KEY=COLE_SUA_CHAVE_AQUI
  echo   PORT=%PORT%
  echo.
  pause
)

if not exist "node_modules" (
  echo Instalando dependencias (npm install)...
  call npm install
  if errorlevel 1 (
    echo.
    echo ERRO: falha ao instalar dependencias.
    pause
    exit /b 1
  )
)

echo.
echo Iniciando servidor em %URL%
echo.

start "Pregador" cmd /c "timeout /t 1 >nul & start "" "%URL%""

call npm start
