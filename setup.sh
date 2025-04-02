#!/bin/bash

# Create necessary directories
mkdir -p src/components src/utils src/types public

# Install dependencies
npm install

# Install additional type definitions
npm install --save-dev @types/js-yaml @types/styled-components

# Create a basic favicon.ico if it doesn't exist
if [ ! -f public/favicon.ico ]; then
    touch public/favicon.ico
fi

# Create basic logo files if they don't exist
if [ ! -f public/logo192.png ]; then
    touch public/logo192.png
fi
if [ ! -f public/logo512.png ]; then
    touch public/logo512.png
fi

echo "Setup complete! You can now run 'npm start' to start the development server." 