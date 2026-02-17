#!/bin/bash
# Meadow Test Database Cleanup Script
#
# Stops and removes both MySQL and MSSQL test containers.
#
# Usage:
#   ./scripts/meadow-test-cleanup.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Cleaning up meadow test database containers..."
echo ""

"${SCRIPT_DIR}/mysql-test-db.sh" stop
"${SCRIPT_DIR}/mssql-test-db.sh" stop

echo ""
echo "Cleanup complete."
