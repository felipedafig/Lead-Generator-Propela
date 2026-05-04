#!/bin/bash

# Propela Deployment Script
# This script automates the deployment process

set -e

echo "=========================================="
echo "Propela Docker Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker Compose is installed${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found. Creating from .env.production...${NC}"
    cp .env.production .env
    echo -e "${RED}⚠ IMPORTANT: Please edit .env and update the following:${NC}"
    echo "  - DB_PASSWORD"
    echo "  - JWT_SECRET"
    echo "  - VITE_API_URL"
    echo ""
    read -p "Have you edited .env with your production values? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please edit .env and run the script again."
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}Building Docker images...${NC}"
docker-compose build

echo ""
echo -e "${GREEN}Starting services...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}Waiting for services to be ready...${NC}"
sleep 10

# Check if services are running
echo ""
echo -e "${GREEN}Service Status:${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}Testing connectivity...${NC}"

# Test backend
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
fi

# Test frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend health check failed${NC}"
fi

# Test database
if docker-compose exec -T mysql mysql -u propela_user -p$(grep DB_PASSWORD .env | cut -d= -f2) propela -e "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database is running${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo "Access your application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  Database: localhost:3306"
echo ""
echo "Important commands:"
echo "  View logs:     docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart:       docker-compose restart"
echo ""
echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
