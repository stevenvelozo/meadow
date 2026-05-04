#!/bin/bash
# MSSQL Test Database Management Script
#
# Usage:
#   ./scripts/mssql-test-db.sh start   - Start MSSQL container and wait for readiness
#   ./scripts/mssql-test-db.sh stop    - Stop and remove the container
#   ./scripts/mssql-test-db.sh status  - Check if the container is running
#
# The container settings match the test configuration in
# test/Meadow-Provider-MSSQL_tests.js:
#   Host: 127.0.0.1, Port: 31433, User: sa
#   Password: 1234567890abc., Database: bookstore

CONTAINER_NAME="meadow-mssql-test"
SA_PASSWORD="1234567890abc."
MSSQL_DATABASE="bookstore"
MSSQL_PORT="31433"
# Azure SQL Edge — multi-arch (amd64 + arm64). The full SQL Server image
# (mcr.microsoft.com/mssql/server) ships amd64 only, which crashes on
# Apple Silicon under Colima/QEMU because of address-layout assumptions
# the SQL Server binary makes. Azure SQL Edge speaks the same wire
# protocol and T-SQL surface the meadow tests need.
MSSQL_IMAGE="mcr.microsoft.com/azure-sql-edge:latest"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEED_GENERATOR="${SCRIPT_DIR}/bookstore-seed.js"
# Host-side TDS runner — replaces `docker exec <ctn> sqlcmd ...`. Recent
# Azure SQL Edge images strip the in-container sqlcmd binary, and the
# stand-alone `mcr.microsoft.com/mssql-tools` image is amd64-only (crashes
# under Colima/QEMU on Apple Silicon). Going host-side via tedious sidesteps
# both — connection works against the mapped port regardless of image arch.
MSSQL_RUNNER="${SCRIPT_DIR}/mssql-runner.js"

# Connection params for the runner (and matched by the test config).
export MSSQL_HOST="127.0.0.1"
export MSSQL_PORT
export MSSQL_USER="sa"
export MSSQL_PASSWORD="${SA_PASSWORD}"

start_mssql() {
	# Check if container already exists
	if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
			echo "MSSQL test container is already running."
			return 0
		else
			echo "Removing stopped container..."
			docker rm "${CONTAINER_NAME}" > /dev/null 2>&1
		fi
	fi

	echo "Starting MSSQL test container..."
	docker run -d \
		--name "${CONTAINER_NAME}" \
		-e ACCEPT_EULA=Y \
		-e "MSSQL_SA_PASSWORD=${SA_PASSWORD}" \
		-p "${MSSQL_PORT}:1433" \
		"${MSSQL_IMAGE}"

	if [ $? -ne 0 ]; then
		echo "ERROR: Failed to start MSSQL container."
		exit 1
	fi

	echo "Waiting for MSSQL to be ready..."
	if ! node "${MSSQL_RUNNER}" --readiness; then
		echo "ERROR: MSSQL failed to become ready in time."
		docker logs "${CONTAINER_NAME}" 2>&1 | tail -20
		exit 1
	fi

	# Create the bookstore database
	echo "Creating database '${MSSQL_DATABASE}'..."
	node "${MSSQL_RUNNER}" --db master --query \
		"IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = '${MSSQL_DATABASE}') BEGIN CREATE DATABASE [${MSSQL_DATABASE}] END"

	# Load bookstore schema and seed data (GUIDs minted at generation time via fable-uuid)
	if [ -f "${SEED_GENERATOR}" ]; then
		echo "Loading bookstore schema and seed data..."
		node "${SEED_GENERATOR}" --dialect mssql | \
			node "${MSSQL_RUNNER}" --db "${MSSQL_DATABASE}"
		if [ $? -ne 0 ]; then
			echo "WARNING: Failed to load seed data. Tests requiring pre-populated data may fail."
		else
			echo "Bookstore schema and seed data loaded successfully."
		fi
	else
		echo "WARNING: Seed generator not found at ${SEED_GENERATOR}. Skipping schema/data loading."
	fi

	echo ""
	echo "MSSQL test database is ready!"
	echo "  Container: ${CONTAINER_NAME}"
	echo "  Host:      127.0.0.1:${MSSQL_PORT}"
	echo "  User:      sa"
	echo "  Password:  ${SA_PASSWORD}"
	echo "  Database:  ${MSSQL_DATABASE}"
	echo ""
	echo "Run tests with: npm test"
}

stop_mssql() {
	if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		echo "Stopping and removing MSSQL test container..."
		docker stop "${CONTAINER_NAME}" > /dev/null 2>&1
		docker rm "${CONTAINER_NAME}" > /dev/null 2>&1
		echo "MSSQL test container removed."
	else
		echo "No MSSQL test container found."
	fi
}

status_mssql() {
	if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		echo "MSSQL test container is running."
		docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	elif docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		echo "MSSQL test container exists but is stopped."
	else
		echo "MSSQL test container is not running."
	fi
}

case "${1}" in
	start)
		start_mssql
		;;
	stop)
		stop_mssql
		;;
	status)
		status_mssql
		;;
	*)
		echo "Usage: $0 {start|stop|status}"
		exit 1
		;;
esac
