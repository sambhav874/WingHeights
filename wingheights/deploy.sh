#!/bin/bash

# Deploy script for WingHeights project

# Set the project root directory
PROJECT_ROOT="/root/lets/WingHeights/wingheights"

# Function to deploy for the development environment
deploy_development() {
    echo "Deploying for development environment..."

    # Navigate to the project root
    cd $PROJECT_ROOT

    # Rebuild and restart frontend
    echo "Rebuilding frontend..."
    cd frontend
    npm ci
    cd $PROJECT_ROOT

    # Rebuild and restart backend
    echo "Rebuilding backend..."
    cd backend
    npm ci
    npm run build
    cd $PROJECT_ROOT

    # Rebuild and restart AI agent
    echo "Rebuilding AI agent..."
    cd ai_agent/rag_chatbot
    source venv/bin/activate
    pip install -r requirements.txt
    cd $PROJECT_ROOT

    # Restart PM2 processes for the development environment
    echo "Restarting PM2 processes..."
    pm2 restart frontend-deve backend-deve ai-agent-deve --update-env

    echo "Deployment for development environment completed!"
}

# Check the argument passed to the script
if [ "$1" = "development" ]; then
    deploy_development
else
    echo "Usage: ./deploy.sh development"
    exit 1
fi
