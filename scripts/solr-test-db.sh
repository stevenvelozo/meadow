#!/bin/bash
# Solr Test Database Management Script
#
# Usage:
#   ./scripts/solr-test-db.sh start   - Start Solr container, create core, and wait for readiness
#   ./scripts/solr-test-db.sh stop    - Stop and remove the container
#   ./scripts/solr-test-db.sh status  - Check if the container is running
#
# The container settings match the test configuration in
# test/Meadow-Provider-Solr_tests.js:
#   Host: 127.0.0.1, Port: 38983, Core: meadow_test

CONTAINER_NAME="meadow-solr-test"
SOLR_PORT="38983"
SOLR_CORE="meadow_test"
SOLR_IMAGE="solr:9"

start_solr() {
	# Check if container already exists
	if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
			echo "Solr test container is already running."
			return 0
		else
			echo "Removing stopped container..."
			docker rm "${CONTAINER_NAME}" > /dev/null 2>&1
		fi
	fi

	echo "Starting Solr test container..."
	docker run -d \
		--name "${CONTAINER_NAME}" \
		-p "${SOLR_PORT}:8983" \
		"${SOLR_IMAGE}"

	if [ $? -ne 0 ]; then
		echo "ERROR: Failed to start Solr container."
		exit 1
	fi

	echo "Waiting for Solr to be ready..."
	RETRIES=30
	until curl -sf "http://localhost:${SOLR_PORT}/solr/admin/info/system" > /dev/null 2>&1; do
		RETRIES=$((RETRIES - 1))
		if [ $RETRIES -le 0 ]; then
			echo "ERROR: Solr failed to become ready in time."
			docker logs "${CONTAINER_NAME}" 2>&1 | tail -20
			exit 1
		fi
		echo "  ...waiting (${RETRIES} retries left)"
		sleep 2
	done

	# Create the test core
	echo "Creating Solr core '${SOLR_CORE}'..."
	docker exec "${CONTAINER_NAME}" solr create_core -c "${SOLR_CORE}" > /dev/null 2>&1
	if [ $? -ne 0 ]; then
		# Core might already exist, check if it's accessible
		if curl -sf "http://localhost:${SOLR_PORT}/solr/${SOLR_CORE}/admin/ping" > /dev/null 2>&1; then
			echo "Solr core '${SOLR_CORE}' already exists."
		else
			echo "WARNING: Failed to create Solr core '${SOLR_CORE}'."
		fi
	else
		echo "Solr core '${SOLR_CORE}' created successfully."
	fi

	# Define schema fields as single-valued types for proper sorting and filtering
	echo "Configuring Solr schema..."
	curl -sf -X POST "http://localhost:${SOLR_PORT}/solr/${SOLR_CORE}/schema" \
		-H 'Content-type: application/json' \
		-d '{
			"add-field": [
				{"name": "IDAnimal", "type": "plong", "stored": true, "indexed": true, "multiValued": false},
				{"name": "GUIDAnimal", "type": "string", "stored": true, "indexed": true, "multiValued": false},
				{"name": "CreateDate", "type": "pdate", "stored": true, "indexed": true, "multiValued": false},
				{"name": "CreatingIDUser", "type": "plong", "stored": true, "indexed": true, "multiValued": false},
				{"name": "UpdateDate", "type": "pdate", "stored": true, "indexed": true, "multiValued": false},
				{"name": "UpdatingIDUser", "type": "plong", "stored": true, "indexed": true, "multiValued": false},
				{"name": "Deleted", "type": "plong", "stored": true, "indexed": true, "multiValued": false},
				{"name": "DeletingIDUser", "type": "plong", "stored": true, "indexed": true, "multiValued": false},
				{"name": "DeleteDate", "type": "string", "stored": true, "indexed": true, "multiValued": false},
				{"name": "Name", "type": "string", "stored": true, "indexed": true, "multiValued": false},
				{"name": "Type", "type": "string", "stored": true, "indexed": true, "multiValued": false},
				{"name": "seq", "type": "plong", "stored": true, "indexed": true, "multiValued": false}
			]
		}' > /dev/null 2>&1
	echo "Solr schema configured."

	echo ""
	echo "Solr test instance is ready!"
	echo "  Container: ${CONTAINER_NAME}"
	echo "  Host:      127.0.0.1:${SOLR_PORT}"
	echo "  Core:      ${SOLR_CORE}"
	echo ""
	echo "Run tests with: npm run test-solr"
}

stop_solr() {
	if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		echo "Stopping and removing Solr test container..."
		docker stop "${CONTAINER_NAME}" > /dev/null 2>&1
		docker rm "${CONTAINER_NAME}" > /dev/null 2>&1
		echo "Solr test container removed."
	else
		echo "No Solr test container found."
	fi
}

status_solr() {
	if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		echo "Solr test container is running."
		docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	elif docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		echo "Solr test container exists but is stopped."
	else
		echo "Solr test container is not running."
	fi
}

case "${1}" in
	start)
		start_solr
		;;
	stop)
		stop_solr
		;;
	status)
		status_solr
		;;
	*)
		echo "Usage: $0 {start|stop|status}"
		exit 1
		;;
esac
