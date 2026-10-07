#!/bin/bash
set -e

SERVER="root@46.8.226.36"
PASS="h8I8odYa5fzi"

echo "=== Deploying Cafe UI to all tenants ==="

echo "1. Building cafe-ui..."
npm run build

echo "2. Creating latest.tar.gz..."
cd dist
tar -czvf ../latest.tar.gz .
cd ..

echo "3. Uploading to caffe-registry..."
sshpass -p "$PASS" scp -o StrictHostKeyChecking=no latest.tar.gz $SERVER:/opt/caffe-registry/releases/ui/latest.tar.gz

echo "4. Patching all existing tenants..."
sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no $SERVER << 'EOF'
  for dir in /opt/cafe-azzura/tenants/*/backend/public/ui; do
    if [ -d "$dir" ]; then
      echo "Patching UI for $dir"
      rm -rf "$dir"/*
      tar -xzf /opt/caffe-registry/releases/ui/latest.tar.gz -C "$dir"
    fi
  done
  echo "All tenants patched successfully!"
EOF

echo "✅ Deploy complete!"
