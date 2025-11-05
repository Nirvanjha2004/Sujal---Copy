#!/bin/bash

# Docker management script for Real Estate Portal

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Help function
show_help() {
    echo "Real Estate Portal Docker Management Script"
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  dev         Start development environment"
    echo "  prod        Start production environment"
    echo "  build       Build the application"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  logs        Show logs for all services"
    echo "  logs-api    Show logs for backend API only"
    echo "  logs-db     Show logs for database only"
    echo "  clean       Remove all containers and volumes"
    echo "  migrate     Run database migrations"
    echo "  seed        Run database seed"
    echo "  shell       Open shell in backend container"
    echo "  db-shell    Open PostgreSQL shell"
    echo "  redis-cli   Open Redis CLI"
    echo "  status      Show status of all services"
    echo "  tools       Start development tools (PgAdmin, Redis Commander)"
    echo "  help        Show this help message"
    echo ""
}

# Development environment
start_dev() {
    print_status "Starting development environment..."
    check_docker
    
    # Copy environment file if it doesn't exist
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.docker template..."
        cp .env.docker .env
        print_warning "Please review and update .env file with your settings"
    fi
    
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
    print_success "Development environment started!"
    print_status "API: http://localhost:3000"
    print_status "Database: localhost:5432"
    print_status "Redis: localhost:6379"
}

# Production environment
start_prod() {
    print_status "Starting production environment..."
    check_docker
    
    if [ ! -f .env ]; then
        print_error ".env file not found. Please create it from .env.docker template"
        exit 1
    fi
    
    docker-compose up --build -d
    print_success "Production environment started!"
}

# Build application
build_app() {
    print_status "Building application..."
    check_docker
    docker-compose build --no-cache
    print_success "Build completed!"
}

# Stop services
stop_services() {
    print_status "Stopping all services..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    print_success "All services stopped!"
}

# Restart services
restart_services() {
    print_status "Restarting services..."
    stop_services
    sleep 2
    start_dev
}

# Show logs
show_logs() {
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
}

# Show API logs only
show_api_logs() {
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend
}

# Show database logs only
show_db_logs() {
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f postgres
}

# Clean up everything
clean_all() {
    print_warning "This will remove all containers, volumes, and images. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_status "Cleaning up..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v --rmi all
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Run migrations
run_migrations() {
    print_status "Running database migrations..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml run --rm migrations
    print_success "Migrations completed!"
}

# Run database seed
run_seed() {
    print_status "Running database seed..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npm run seed
    print_success "Seed completed!"
}

# Open shell in backend container
open_shell() {
    print_status "Opening shell in backend container..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend sh
}

# Open PostgreSQL shell
open_db_shell() {
    print_status "Opening PostgreSQL shell..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec postgres psql -U postgres -d real_estate_portal
}

# Open Redis CLI
open_redis_cli() {
    print_status "Opening Redis CLI..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec redis redis-cli
}

# Show status
show_status() {
    print_status "Service Status:"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps
}

# Start development tools
start_tools() {
    print_status "Starting development tools..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml --profile tools up -d pgadmin redis-commander
    print_success "Development tools started!"
    print_status "PgAdmin: http://localhost:5050 (admin@admin.com / admin)"
    print_status "Redis Commander: http://localhost:8081"
}

# Main command handling
case "${1:-help}" in
    dev)
        start_dev
        ;;
    prod)
        start_prod
        ;;
    build)
        build_app
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    logs-api)
        show_api_logs
        ;;
    logs-db)
        show_db_logs
        ;;
    clean)
        clean_all
        ;;
    migrate)
        run_migrations
        ;;
    seed)
        run_seed
        ;;
    shell)
        open_shell
        ;;
    db-shell)
        open_db_shell
        ;;
    redis-cli)
        open_redis_cli
        ;;
    status)
        show_status
        ;;
    tools)
        start_tools
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac