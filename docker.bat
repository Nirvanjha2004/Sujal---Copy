@echo off
setlocal enabledelayedexpansion

REM Colors for Windows (limited support)
set "GREEN=echo"
set "YELLOW=echo"  
set "RED=echo"
set "BLUE=echo"

REM Function to print messages
:print_color
%GREEN% [SUCCESS] %1
goto :eof

:print_warning  
%YELLOW% [WARNING] %1
goto :eof

:print_error
%RED% [ERROR] %1
goto :eof

:print_info
%BLUE% [INFO] %1
goto :eof

REM Main script
if "%1"=="" goto help

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not running. Please start Docker Desktop."
    exit /b 1
)

REM Setup environment if not exists
if not exist ".env" (
    call :print_info "Setting up environment file..."
    copy ".env.docker" ".env" >nul 2>&1
    if errorlevel 1 (
        call :print_error "Failed to copy .env.docker to .env"
        exit /b 1
    )
    call :print_color "Environment file created successfully!"
)

REM Handle commands
if "%1"=="dev" goto dev
if "%1"=="prod" goto prod  
if "%1"=="stop" goto stop
if "%1"=="logs" goto logs
if "%1"=="migrate" goto migrate
if "%1"=="seed" goto seed
if "%1"=="shell" goto shell
if "%1"=="db-shell" goto db_shell
if "%1"=="clean" goto clean
if "%1"=="help" goto help
goto help

:dev
call :print_color "Starting development environment with MySQL..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
if errorlevel 1 (
    call :print_error "Failed to start development environment"
    call :print_info "Check logs with: docker-compose logs"
    exit /b 1
)
call :print_color "Development environment started!"
call :print_info "Waiting for services to be ready..."

REM Wait for services to be healthy
:wait_loop
timeout /t 5 /nobreak >nul
docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps --filter "status=running" | find "real-estate-backend" >nul
if errorlevel 1 (
    call :print_info "Waiting for backend to start..."
    goto wait_loop
)

call :print_info "Running database migrations..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npm run migrate
if errorlevel 1 (
    call :print_warning "Migrations may have failed - check backend logs"
)

call :print_color "=== DEVELOPMENT ENVIRONMENT READY ==="
call :print_color "Backend API: http://localhost:3000"
call :print_color "API Docs: http://localhost:3000/api/docs" 
call :print_color "PhpMyAdmin: http://localhost:8080"
call :print_color "Redis Commander: http://localhost:8081"
call :print_info "Run '.\docker.bat logs' to see service logs"
goto :eof

:prod
call :print_color "Starting production environment..."
docker-compose up --build -d
if errorlevel 1 (
    call :print_error "Failed to start production environment"
    exit /b 1
)
call :print_info "Running database migrations..."
docker-compose exec backend npm run migrate
call :print_color "Production environment ready at http://localhost:3000"
goto :eof

:stop
call :print_warning "Stopping all services..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
docker-compose down
call :print_color "All services stopped!"
goto :eof

:logs  
if "%2"=="" (
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
) else (
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f %2
)
goto :eof

:migrate
call :print_info "Running database migrations..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npm run migrate
if errorlevel 1 (
    call :print_error "Migration failed"
    exit /b 1
)
call :print_color "Migrations completed successfully!"
goto :eof

:seed
call :print_info "Seeding database..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npm run seed
if errorlevel 1 (
    call :print_error "Seeding failed"
    exit /b 1
)
call :print_color "Database seeded successfully!"
goto :eof

:shell
call :print_info "Opening backend shell..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend /bin/sh
goto :eof

:db_shell
call :print_info "Opening MySQL database shell..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec mysql mysql -u root -p real_estate_portal_dev
goto :eof

:clean
call :print_warning "This will remove all containers, networks, and volumes!"
set /p "confirm=Are you sure? (y/N): "
if /i "!confirm!"=="y" (
    call :print_info "Cleaning up..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans
    docker-compose down -v --remove-orphans
    docker system prune -f
    call :print_color "Cleanup completed!"
) else (
    call :print_info "Cleanup cancelled."
)
goto :eof

:help
echo.
call :print_color "Real Estate Portal - Docker Management (MySQL)"
echo.
echo Usage: %0 [COMMAND]
echo.
echo Commands:
echo   dev        Start development environment with MySQL
echo   prod       Start production environment
echo   stop       Stop all services  
echo   logs       Show logs [service]
echo   migrate    Run database migrations
echo   seed       Seed database with sample data
echo   shell      Open backend container shell
echo   db-shell   Open MySQL database shell
echo   clean      Remove all containers and volumes
echo   help       Show this help
echo.
echo Examples:
echo   %0 dev                 # Start development with MySQL
echo   %0 logs backend        # Show backend logs
echo   %0 stop                # Stop services
echo.
echo Services:
echo   Backend API: http://localhost:3000
echo   PhpMyAdmin: http://localhost:8080
echo   Redis Commander: http://localhost:8081
echo.
goto :eof