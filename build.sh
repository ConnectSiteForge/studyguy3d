#!/usr/bin/env bash
set -e

# Load environment variables from .env
if [ -f .env ]; then
  set -a
  source .env
  set +a
else
  echo "Error: .env file not found"
  exit 1
fi

# Copy template to config.js
cp config.template.js config.js

# Replace placeholders with actual values
sed -i.bak "s|%%SUPABASE_URL%%|${SUPABASE_URL}|g" config.js
sed -i.bak "s|%%SUPABASE_PUBLISHABLE_KEY%%|${SUPABASE_PUBLISHABLE_KEY}|g" config.js

# Clean up backup file created by sed -i on macOS
rm -f config.js.bak

echo "config.js generated"
