#!/bin/bash
# =============================================================================
# Vizly Environment Setup Script
# This script helps you set up all required environment variables
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  Vizly Environment Setup                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to generate SECRET_KEY
generate_secret_key() {
    python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
}

# Function to generate ENCRYPTION_SALT
generate_encryption_salt() {
    python3 -c 'import os, base64; print(base64.b64encode(os.urandom(32)).decode())'
}

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed. Please install Python 3 first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python 3 is installed${NC}"
echo ""

# =============================================================================
# Generate SECRET_KEY
# =============================================================================

echo -e "${YELLOW}Generating SECRET_KEY...${NC}"
SECRET_KEY=$(generate_secret_key)
echo -e "${GREEN}✓ SECRET_KEY generated${NC}"
echo ""

# =============================================================================
# Generate ENCRYPTION_SALT
# =============================================================================

echo -e "${YELLOW}Generating ENCRYPTION_SALT...${NC}"
ENCRYPTION_SALT=$(generate_encryption_salt)
echo -e "${GREEN}✓ ENCRYPTION_SALT generated${NC}"
echo ""

# =============================================================================
# Update .env files
# =============================================================================

echo -e "${YELLOW}Setting up environment files...${NC}"

# Root .env
if [ -f .env ]; then
    echo -e "${BLUE}Updating root .env file...${NC}"
    # Update SECRET_KEY
    if grep -q "^SECRET_KEY=" .env; then
        sed -i.bak "s|^SECRET_KEY=.*|SECRET_KEY=${SECRET_KEY}|" .env
    else
        echo "SECRET_KEY=${SECRET_KEY}" >> .env
    fi
    # Update ENCRYPTION_SALT
    if grep -q "^ENCRYPTION_SALT=" .env; then
        sed -i.bak "s|^ENCRYPTION_SALT=.*|ENCRYPTION_SALT=${ENCRYPTION_SALT}|" .env
    else
        echo "ENCRYPTION_SALT=${ENCRYPTION_SALT}" >> .env
    fi
    rm -f .env.bak
    echo -e "${GREEN}✓ Root .env updated${NC}"
else
    echo -e "${YELLOW}Root .env not found, copying from .env.example...${NC}"
    cp .env.example .env
    sed -i.bak "s|^SECRET_KEY=.*|SECRET_KEY=${SECRET_KEY}|" .env
    sed -i.bak "s|^ENCRYPTION_SALT=.*|ENCRYPTION_SALT=${ENCRYPTION_SALT}|" .env
    rm -f .env.bak
    echo -e "${GREEN}✓ Root .env created${NC}"
fi

# Backend .env
if [ -f backend/.env ]; then
    echo -e "${BLUE}Updating backend/.env file...${NC}"
    if grep -q "^SECRET_KEY=" backend/.env; then
        sed -i.bak "s|^SECRET_KEY=.*|SECRET_KEY=${SECRET_KEY}|" backend/.env
    else
        echo "SECRET_KEY=${SECRET_KEY}" >> backend/.env
    fi
    if grep -q "^ENCRYPTION_SALT=" backend/.env; then
        sed -i.bak "s|^ENCRYPTION_SALT=.*|ENCRYPTION_SALT=${ENCRYPTION_SALT}|" backend/.env
    else
        echo "ENCRYPTION_SALT=${ENCRYPTION_SALT}" >> backend/.env
    fi
    rm -f backend/.env.bak
    echo -e "${GREEN}✓ Backend .env updated${NC}"
else
    echo -e "${YELLOW}Backend .env not found, copying from .env.example...${NC}"
    cp backend/.env.example backend/.env
    sed -i.bak "s|^SECRET_KEY=.*|SECRET_KEY=${SECRET_KEY}|" backend/.env
    sed -i.bak "s|^ENCRYPTION_SALT=.*|ENCRYPTION_SALT=${ENCRYPTION_SALT}|" backend/.env
    rm -f backend/.env.bak
    echo -e "${GREEN}✓ Backend .env created${NC}"
fi

# Frontend .env
if [ ! -f frontend/.env ]; then
    echo -e "${YELLOW}Frontend .env not found, copying from .env.example...${NC}"
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✓ Frontend .env created${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    Setup Complete! ✓                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# =============================================================================
# Display next steps
# =============================================================================

echo -e "${BLUE}Generated Credentials (save these securely):${NC}"
echo ""
echo -e "${YELLOW}SECRET_KEY:${NC}"
echo "${SECRET_KEY}"
echo ""
echo -e "${YELLOW}ENCRYPTION_SALT:${NC}"
echo "${ENCRYPTION_SALT}"
echo ""

echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1. Review your .env files:"
echo "   - Root: .env"
echo "   - Backend: backend/.env"
echo "   - Frontend: frontend/.env"
echo ""
echo "2. Run database migrations:"
echo -e "   ${YELLOW}cd backend${NC}"
echo -e "   ${YELLOW}python manage.py makemigrations${NC}"
echo -e "   ${YELLOW}python manage.py migrate${NC}"
echo ""
echo "3. Create a superuser:"
echo -e "   ${YELLOW}python manage.py createsuperuser${NC}"
echo ""
echo "4. Start the development servers:"
echo -e "   ${YELLOW}# Backend (from backend directory)${NC}"
echo -e "   ${YELLOW}python manage.py runserver${NC}"
echo ""
echo -e "   ${YELLOW}# Frontend (from frontend directory)${NC}"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo -e "${GREEN}Your environment is now configured and secure! 🎉${NC}"
echo ""
echo -e "${RED}⚠️  IMPORTANT: Never commit .env files to version control!${NC}"
echo ""
