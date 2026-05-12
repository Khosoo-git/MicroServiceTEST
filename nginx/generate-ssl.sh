#!/bin/bash

# Generate Self-Signed SSL Certificates for Development
# For production, use Let's Encrypt or a commercial CA

CERT_DIR=/Users/tab/Documents/MicroServiceTEST/nginx/ssl
mkdir -p $CERT_DIR

echo "Generating self-signed SSL certificates..."

# Generate private key
openssl genrsa -out $CERT_DIR/privkey.pem 4096

# Generate certificate signing request
openssl req -new -key $CERT_DIR/privkey.pem -out $CERT_DIR/cert.csr \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=monitoring.local"

# Generate self-signed certificate (valid for 365 days)
openssl x509 -req -days 365 -in $CERT_DIR/cert.csr -signkey $CERT_DIR/privkey.pem \
    -out $CERT_DIR/fullchain.pem

# Set permissions
chmod 600 $CERT_DIR/privkey.pem
chmod 644 $CERT_DIR/fullchain.pem

echo ""
echo "✓ SSL certificates generated successfully!"
echo ""
echo "Certificate files:"
echo "  - $CERT_DIR/fullchain.pem (certificate)"
echo "  - $CERT_DIR/privkey.pem (private key)"
echo ""
echo "⚠️  NOTE: This is a self-signed certificate for development."
echo "   For production, use Let's Encrypt:"
echo "   certbot certonly --standalone -d your-domain.com"
echo ""

# Clean up CSR
rm -f $CERT_DIR/cert.csr
