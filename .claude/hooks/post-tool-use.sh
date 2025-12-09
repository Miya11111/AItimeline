#!/bin/bash
# Post tool use hook - runs after Claude uses tools
# This hook runs npm run check after file modifications

TOOL_NAME="$1"

# List of tools that modify files
FILE_MODIFICATION_TOOLS=("Edit" "Write" "NotebookEdit")

# Check if the tool modifies files
for tool in "${FILE_MODIFICATION_TOOLS[@]}"; do
  if [[ "$TOOL_NAME" == "$tool" ]]; then
    echo "🔍 Running format and lint check..."
    npm run check
    exit 0
  fi
done