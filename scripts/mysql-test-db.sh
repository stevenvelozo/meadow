#!/bin/bash
# MySQL Test Database Management Script
#
# Usage:
#   ./scripts/mysql-test-db.sh start   - Start MySQL container and wait for readiness
#   ./scripts/mysql-test-db.sh stop    - Stop and remove the container
#   ./scripts/mysql-test-db.sh status  - Check if the container is running
#
# The container settings match the test configuration in
# test/Meadow-Provider-MySQL_tests.js:
#   Host: localhost, Port: 3306, User: root
#   Password: 123456789, Database: bookstore

CONTAINER_NAME="meadow-mysql-test"
MYSQL_ROOT_PASSWORD="123456789"
MYSQL_DATABASE="bookstore"
MYSQL_PORT="3306"
MYSQL_IMAGE="mysql:8.0"

start_mysql() {
	# Check if container already exists
	if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
			echo "MySQL test container is already running."
			return 0
		else
			echo "Removing stopped container..."
			docker rm "${CONTAINER_NAME}" > /dev/null 2>&1
		fi
	fi

	echo "Starting MySQL test container..."
	docker run -d \
		--name "${CONTAINER_NAME}" \
		-e MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD}" \
		-e MYSQL_DATABASE="${MYSQL_DATABASE}" \
		-p "${MYSQL_PORT}:3306" \
		"${MYSQL_IMAGE}" \
		--default-authentication-plugin=mysql_native_password \
		--character-set-server=utf8mb4 \
		--collation-server=utf8mb4_unicode_ci

	if [ $? -ne 0 ]; then
		echo "ERROR: Failed to start MySQL container."
		exit 1
	fi

	echo "Waiting for MySQL to be ready..."
	RETRIES=30
	until docker exec "${CONTAINER_NAME}" mysqladmin ping -h localhost -u root -p"${MYSQL_ROOT_PASSWORD}" --silent 2>/dev/null; do
		RETRIES=$((RETRIES - 1))
		if [ $RETRIES -le 0 ]; then
			echo "ERROR: MySQL failed to become ready in time."
			docker logs "${CONTAINER_NAME}" 2>&1 | tail -20
			exit 1
		fi
		echo "  ...waiting (${RETRIES} retries left)"
		sleep 2
	done

	echo ""
	echo "MySQL test database is ready!"
	echo "  Container: ${CONTAINER_NAME}"
	echo "  Host:      localhost:${MYSQL_PORT}"
	echo "  User:      root"
	echo "  Password:  ${MYSQL_ROOT_PASSWORD}"
	echo "  Database:  ${MYSQL_DATABASE}"
	echo ""
	echo "Run tests with: npm test"
}

stop_mysql() {
	if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		echo "Stopping and removing MySQL test container..."
		docker stop "${CONTAINER_NAME}" > /dev/null 2>&1
		docker rm "${CONTAINER_NAME}" > /dev/null 2>&1
		echo "MySQL test container removed."
	else
		echo "No MySQL test container found."
	fi
}

status_mysql() {
	if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		echo "MySQL test container is running."
		docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	elif docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		echo "MySQL test container exists but is stopped."
	else
		echo "MySQL test container is not running."
	fi
}

case "${1}" in
	start)
		start_mysql
		;;
	stop)
		stop_mysql
		;;
	status)
		status_mysql
		;;
	*)
		echo "Usage: $0 {start|stop|status}"
		exit 1
		;;
esac
