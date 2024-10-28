#!/bin/bash

# Function to deploy a specific service
deploy_service() {
    service_name=$1
    env=$2
    
    echo "Deploying $service_name for $env environment..."
    
    # Stop the current service
    pm2 stop $service_name-$env || true
    
    if [[ $service_name == "ai-agent" ]]; then
        cd ./wingheights/ai_agent/rag_chatbot
        
        # Install dependencies
        pip install -r requirements.txt

        # Copy the correct .env file
        if [[ $env == "devl" ]]; then
            cp .env.development .env
        else
            cp .env.production .env
        fi
    else
        cd ./$service_name
        
        # Install dependencies
        npm install
        
        # Delete existing build folder
        if [[ $service_name == "frontend" ]]; then
            rm -rf .next
        elif [[ $service_name == "backend" ]]; then
            rm -rf build
        fi
        
        # Run build
        npm run build
    fi
    
    # Start the service
    pm2 start ecosystem.config.js --only $service_name-$env
    
    cd ..
}

# Check if an environment argument is provided
if [ "$1" != "development" ] && [ "$1" != "production" ]; then
    echo "Please specify an environment: development or production"
    exit 1
fi

ENV=$1
ENV_SHORT=${ENV:0:4}  # 'dev' or 'prod'

# Deploy each service
deploy_service "frontend" $ENV_SHORT
deploy_service "backend" $ENV_SHORT
deploy_service "ai-agent" $ENV_SHORT

echo "Deployment completed for $ENV environment."
