#!/bin/bash
# DGraph Test Database Management Script
#
# Usage:
#   ./scripts/dgraph-test-db.sh start   - Start DGraph container, apply schema, and wait for readiness
#   ./scripts/dgraph-test-db.sh stop    - Stop and remove the container
#   ./scripts/dgraph-test-db.sh status  - Check if the container is running
#
# The container settings match the test configuration in
# test/Meadow-Provider-DGraph_tests.js:
#   Host: 127.0.0.1, Port: 38080 (HTTP), 39080 (gRPC)

CONTAINER_NAME="meadow-dgraph-test"
DGRAPH_HTTP_PORT="38080"
DGRAPH_GRPC_PORT="39080"
DGRAPH_IMAGE="dgraph/standalone:latest"

start_dgraph() {
	# Check if container already exists
	if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
			echo "DGraph test container is already running."
			return 0
		else
			echo "Removing stopped container..."
			docker rm "${CONTAINER_NAME}" > /dev/null 2>&1
		fi
	fi

	echo "Starting DGraph test container..."
	docker run -d \
		--name "${CONTAINER_NAME}" \
		-p "${DGRAPH_HTTP_PORT}:8080" \
		-p "${DGRAPH_GRPC_PORT}:9080" \
		"${DGRAPH_IMAGE}"

	if [ $? -ne 0 ]; then
		echo "ERROR: Failed to start DGraph container."
		exit 1
	fi

	echo "Waiting for DGraph to be ready..."
	RETRIES=30
	until curl -sf "http://localhost:${DGRAPH_HTTP_PORT}/health" > /dev/null 2>&1; do
		RETRIES=$((RETRIES - 1))
		if [ $RETRIES -le 0 ]; then
			echo "ERROR: DGraph failed to become ready in time."
			docker logs "${CONTAINER_NAME}" 2>&1 | tail -20
			exit 1
		fi
		echo "  ...waiting (${RETRIES} retries left)"
		sleep 2
	done

	# Apply schema predicates for the FableTest type and MeadowCounter type
	# Note: FableTest fields use unscoped predicate names to match FoxHound DGraph dialect output
	echo "Applying DGraph schema..."
	curl -sf "http://localhost:${DGRAPH_HTTP_PORT}/alter" -d '
IDAnimal: int @index(int) .
GUIDAnimal: string .
CreateDate: string .
CreatingIDUser: int .
UpdateDate: string .
UpdatingIDUser: int .
Deleted: int @index(int) .
DeleteDate: string .
DeletingIDUser: int .
Name: string @index(exact, term) .
Type: string @index(exact, term) .
MeadowCounter.scope: string @index(exact) .
MeadowCounter.sequence: int .

type FableTest {
	IDAnimal
	GUIDAnimal
	CreateDate
	CreatingIDUser
	UpdateDate
	UpdatingIDUser
	Deleted
	DeleteDate
	DeletingIDUser
	Name
	Type
}

type MeadowCounter {
	MeadowCounter.scope
	MeadowCounter.sequence
}
' > /dev/null 2>&1

	if [ $? -ne 0 ]; then
		echo "WARNING: Failed to apply DGraph schema. Tests may fail."
	else
		echo "DGraph schema applied successfully."
	fi

	echo ""
	echo "DGraph test instance is ready!"
	echo "  Container: ${CONTAINER_NAME}"
	echo "  HTTP:      127.0.0.1:${DGRAPH_HTTP_PORT}"
	echo "  gRPC:      127.0.0.1:${DGRAPH_GRPC_PORT}"
	echo ""
	echo "Run tests with: npm run test-dgraph"
}

stop_dgraph() {
	if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		echo "Stopping and removing DGraph test container..."
		docker stop "${CONTAINER_NAME}" > /dev/null 2>&1
		docker rm "${CONTAINER_NAME}" > /dev/null 2>&1
		echo "DGraph test container removed."
	else
		echo "No DGraph test container found."
	fi
}

status_dgraph() {
	if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		echo "DGraph test container is running."
		docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	elif docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
		echo "DGraph test container exists but is stopped."
	else
		echo "DGraph test container is not running."
	fi
}

case "${1}" in
	start)
		start_dgraph
		;;
	stop)
		stop_dgraph
		;;
	status)
		status_dgraph
		;;
	*)
		echo "Usage: $0 {start|stop|status}"
		exit 1
		;;
esac
