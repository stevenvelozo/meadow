#!/bin/bash
# PostgreSQL Test Database Management Script
#
# Usage:
#   ./scripts/postgresql-test-db.sh start   - Start PostgreSQL container, load schema and seed data
#   ./scripts/postgresql-test-db.sh stop    - Stop and remove the container
#   ./scripts/postgresql-test-db.sh status  - Check if the container is running
#
# The container settings match the test configuration in
# test/Meadow-Provider-PostgreSQL_tests.js and meadow-connection-postgresql:
#   Host: 127.0.0.1, Port: 35432, User: postgres
#   Password: testpassword, Database: bookstore

CONTAINER_NAME="meadow-postgresql-test"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="testpassword"
POSTGRES_DATABASE="bookstore"
POSTGRES_PORT="35432"
POSTGRES_IMAGE="postgres:16"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEED_SQL="${SCRIPT_DIR}/bookstore-seed-postgresql.sql"

start_postgresql() {
	# Check if container already exists
	if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
			echo "PostgreSQL test container is already running."
			return 0
		else
			echo "Removing stopped container..."
			docker rm "${CONTAINER_NAME}" > /dev/null 2>&1
		fi
	fi

	echo "Starting PostgreSQL test container..."
	docker run -d \
		--name "${CONTAINER_NAME}" \
		-e POSTGRES_USER="${POSTGRES_USER}" \
		-e POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
		-e POSTGRES_DB="${POSTGRES_DATABASE}" \
		-p "${POSTGRES_PORT}:5432" \
		"${POSTGRES_IMAGE}"

	if [ $? -ne 0 ]; then
		echo "ERROR: Failed to start PostgreSQL container."
		exit 1
	fi

	echo "Waiting for PostgreSQL to be ready..."
	RETRIES=30
	until docker exec "${CONTAINER_NAME}" pg_isready -U "${POSTGRES_USER}" 2>/dev/null; do
		RETRIES=$((RETRIES - 1))
		if [ $RETRIES -le 0 ]; then
			echo "ERROR: PostgreSQL failed to become ready in time."
			docker logs "${CONTAINER_NAME}" 2>&1 | tail -20
			exit 1
		fi
		echo "  ...waiting (${RETRIES} retries left)"
		sleep 2
	done

	# Load bookstore schema and seed data
	if [ -f "${SEED_SQL}" ]; then
		echo "Loading bookstore schema and seed data..."
		docker cp "${SEED_SQL}" "${CONTAINER_NAME}:/tmp/bookstore-seed.sql"
		docker exec "${CONTAINER_NAME}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DATABASE}" -f /tmp/bookstore-seed.sql
		if [ $? -ne 0 ]; then
			echo "WARNING: Failed to load seed data. Tests requiring pre-populated data may fail."
		else
			echo "Bookstore schema and seed data loaded successfully."
		fi
	else
		echo "WARNING: Seed file not found at ${SEED_SQL}. Skipping schema/data loading."
	fi

	echo ""
	echo "PostgreSQL test database is ready!"
	echo "  Container: ${CONTAINER_NAME}"
	echo "  Host:      127.0.0.1:${POSTGRES_PORT}"
	echo "  User:      ${POSTGRES_USER}"
	echo "  Password:  ${POSTGRES_PASSWORD}"
	echo "  Database:  ${POSTGRES_DATABASE}"
	echo ""
	echo "Run tests with: npm test"
}

stop_postgresql() {
	if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		echo "Stopping and removing PostgreSQL test container..."
		docker stop "${CONTAINER_NAME}" > /dev/null 2>&1
		docker rm "${CONTAINER_NAME}" > /dev/null 2>&1
		echo "PostgreSQL test container removed."
	else
		echo "No PostgreSQL test container found."
	fi
}

status_postgresql() {
	if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		echo "PostgreSQL test container is running."
		docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	elif docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		echo "PostgreSQL test container exists but is stopped."
	else
		echo "PostgreSQL test container is not running."
	fi
}

case "${1}" in
	start)
		start_postgresql
		;;
	stop)
		stop_postgresql
		;;
	status)
		status_postgresql
		;;
	*)
		echo "Usage: $0 {start|stop|status}"
		exit 1
		;;
esac
