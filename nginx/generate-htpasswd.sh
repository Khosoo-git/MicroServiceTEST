#!/bin/bash

# Generate htpasswd file for Nginx Basic Authentication
# Usage: ./generate-htpasswd.sh [username] [password]

USERNAME=${1:-admin}
PASSWORD=${2:-admin123}

echo "Generating htpasswd file for user: $USERNAME"

# Check if htpasswd is available
if command -v htpasswd &> /dev/null; then
    # Use htpasswd command
    htpasswd -cb /Users/tab/Documents/MicroServiceTEST/nginx/.htpasswd $USERNAME $PASSWORD
    echo "✓ htpasswd file created successfully"
else
    # Generate using openssl
    HASH=$(openssl passwd -apr1 $PASSWORD)
    echo "$USERNAME:$HASH" > /Users/tab/Documents/MicroServiceTEST/nginx/.htpasswd
    echo "✓ htpasswd file created using openssl"
fi

echo ""
echo "Credentials:"
echo "  Username: $USERNAME"
echo "  Password: $PASSWORD"
echo ""
echo "⚠️  IMPORTANT: Change the default password in production!"
echo "   ./generate-htpasswd.sh admin your-secure-password"
