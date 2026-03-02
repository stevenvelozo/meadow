# Architecture

This document describes the internal architecture of Meadow, its component relationships, and how data flows through the system during CRUD operations.

## Module Hierarchy

Meadow sits between your application and the database, orchestrating schema management, query generation, behavior execution, and data marshalling.

```mermaid
graph TB
	Fable["Fable<br/>(Configuration, Logging, DI)"]
	Meadow["Meadow<br/>(Data Broker)"]
	Schema["Schema<br/>(Column Types, JSON Schema,<br/>Default Object, Authorizer)"]
	FoxHound["FoxHound<br/>(Query DSL)"]
	Behaviors["Behaviors<br/>(Create, Read, Reads,<br/>Update, Delete, Undelete, Count)"]
	Provider["Provider<br/>(Database Adapter)"]
	Database["Database<br/>(MySQL, MSSQL, PostgreSQL,<br/>SQLite, MongoDB, RocksDB, etc.)"]

	Fable --> Meadow
	Meadow --> Schema
	Meadow --> FoxHound
	Meadow --> Behaviors
	Meadow --> Provider
	Provider --> Database
```

## CRUD Behavior Flow

Every CRUD operation follows the same general flow: a query object enters a behavior module, which orchestrates provider calls, marshals results, and returns data through the callback.

```mermaid
flowchart TD
	A["Application calls<br/>meadow.doCreate / doRead / doReads /<br/>doUpdate / doDelete / doUndelete / doCount"]
	B["Behavior Module<br/>(async waterfall)"]
	C["Provider.Create / Read /<br/>Update / Delete / Undelete / Count"]
	D["Database Result"]
	E["Marshal Record<br/>(marshalRecordFromSourceToObject)"]
	F["Callback<br/>(pError, pQuery, pRecord)"]

	A --> B
	B --> C
	C --> D
	D --> E
	E --> F
```

## Create Waterfall

The create behavior is the most involved operation, performing multiple steps in an async waterfall to ensure GUID uniqueness and return the complete created record.

```mermaid
flowchart TD
	A["Step 0: GUID Uniqueness Check<br/>If GUID is provided and >= 5 chars,<br/>query for existing record with same GUID"]
	B{"GUID<br/>already exists?"}
	C["Error: Record with GUID already exists"]
	D["Step 1: Insert Record<br/>Merge default object with submitted record,<br/>set IDUser, call Provider.Create"]
	E{"Insert<br/>succeeded?"}
	F["Error: Creation failed"]
	G["Step 2: Read Back<br/>Query by new auto-increment ID,<br/>call Provider.Read"]
	H["Step 3: Marshal<br/>marshalRecordFromSourceToObject<br/>returns plain JavaScript object"]
	I["Callback with<br/>created record"]

	A --> B
	B -->|Yes| C
	B -->|No| D
	D --> E
	E -->|No| F
	E -->|Yes| G
	G --> H
	H --> I
```

## Provider Architecture

Every provider implements the same interface. Meadow ships with providers for multiple database engines, plus a `None` provider for testing and a `MeadowEndpoints` provider for proxying to remote REST APIs.

```mermaid
classDiagram
	class ProviderInterface {
		+Create(pQuery, fCallback)
		+Read(pQuery, fCallback)
		+Update(pQuery, fCallback)
		+Delete(pQuery, fCallback)
		+Undelete(pQuery, fCallback)
		+Count(pQuery, fCallback)
		+marshalRecordFromSourceToObject(pObject, pRecord)
		+setSchema(pScope, pSchema, pDefaultIdentifier, pDefaultGUIdentifier)
	}

	class MySQL {
		+Create()
		+Read()
		+Update()
		+Delete()
		+Undelete()
		+Count()
	}

	class MSSQL {
		+Create()
		+Read()
		+Update()
		+Delete()
		+Undelete()
		+Count()
	}

	class PostgreSQL {
		+Create()
		+Read()
		+Update()
		+Delete()
		+Undelete()
		+Count()
	}

	class SQLite {
		+Create()
		+Read()
		+Update()
		+Delete()
		+Undelete()
		+Count()
	}

	class MongoDB {
		+Create()
		+Read()
		+Update()
		+Delete()
		+Undelete()
		+Count()
	}

	class RocksDB {
		+Create()
		+Read()
		+Update()
		+Delete()
		+Undelete()
		+Count()
	}

	class ALASQL {
		+Create()
		+Read()
		+Update()
		+Delete()
		+Undelete()
		+Count()
	}

	class MeadowEndpoints {
		+Create()
		+Read()
		+Update()
		+Delete()
		+Count()
	}

	class None {
		+Create()
		+Read()
		+Update()
		+Delete()
		+Undelete()
		+Count()
	}

	ProviderInterface <|-- MySQL
	ProviderInterface <|-- MSSQL
	ProviderInterface <|-- PostgreSQL
	ProviderInterface <|-- SQLite
	ProviderInterface <|-- MongoDB
	ProviderInterface <|-- RocksDB
	ProviderInterface <|-- ALASQL
	ProviderInterface <|-- MeadowEndpoints
	ProviderInterface <|-- None
```

## Schema System

The schema drives query generation, validation, record initialization, and access control. A single schema definition feeds multiple subsystems.

```mermaid
graph LR
	Schema["Meadow Schema"]
	ColumnSchema["Column Schema<br/>(Column, Type, Size)"]
	JsonSchema["JSON Schema<br/>(Validation Rules)"]
	DefaultObject["Default Object<br/>(Initial Values)"]
	Authorizer["Authorizer<br/>(Role Permissions)"]

	QueryGen["Query Generation<br/>(FoxHound builds SQL<br/>from column definitions)"]
	Validation["Validation<br/>(is-my-json-valid<br/>checks objects)"]
	RecordInit["Record Initialization<br/>(merge defaults into<br/>new records)"]
	AccessControl["Access Control<br/>(role-based CRUD<br/>permissions)"]

	Schema --> ColumnSchema
	Schema --> JsonSchema
	Schema --> DefaultObject
	Schema --> Authorizer

	ColumnSchema --> QueryGen
	JsonSchema --> Validation
	DefaultObject --> RecordInit
	Authorizer --> AccessControl
```

## Query Lifecycle

This diagram shows the full sequence of a CRUD operation from the application through to the database and back.

```mermaid
sequenceDiagram
	participant App as Application
	participant Meadow as Meadow
	participant Behavior as Behavior Module
	participant FH as FoxHound
	participant Provider as Provider
	participant DB as Database

	App->>Meadow: meadow.query (clone FoxHound)
	Meadow-->>App: Independent query clone
	App->>App: addFilter / addRecord / setCap
	App->>Meadow: meadow.doCreate / doRead / etc.
	Meadow->>Behavior: Invoke behavior (async waterfall)
	Behavior->>FH: setDialect / buildQuery
	FH-->>Behavior: Generated SQL + parameters
	Behavior->>Provider: Provider.Create / Read / etc.
	Provider->>DB: Execute query
	DB-->>Provider: Result rows
	Provider-->>Behavior: Result on query object
	Behavior->>Behavior: Marshal records (source to POJO)
	Behavior-->>App: Callback (pError, pQuery, pRecord)
```

## Key Architectural Concepts

### Factory Pattern

Meadow uses a factory pattern for instantiation. When you `require('meadow')`, the module returns a constructor object. Calling `.new()` without a Fable instance returns a bare constructor. Calling `.new(pFable, pScope)` with a valid Fable instance returns a fully initialized Meadow DAL:

```javascript
var libMeadow = require('meadow');

// Returns a constructor (no Fable passed)
var tmpConstructor = libMeadow.new();

// Returns a fully initialized Meadow instance
var tmpBookDAL = libMeadow.new(_Fable, 'Book');
```

This same pattern is used throughout the Retold ecosystem in providers, schemas, and raw query objects.

### Behavior Modules

Each CRUD operation is encapsulated in its own behavior module under `source/behaviors/`. Behaviors use `async/waterfall` to sequence multi-step operations:

- **Meadow-Create.js** -- GUID check, insert, read back, marshal (4 steps)
- **Meadow-Read.js** -- read, marshal (2 steps)
- **Meadow-Reads.js** -- read, marshal each record, profile timing (2 steps)
- **Meadow-Update.js** -- validate, update, read back, marshal (4 steps)
- **Meadow-Delete.js** -- delete or soft-delete (1 step)
- **Meadow-Undelete.js** -- restore soft-deleted record (1 step)
- **Meadow-Count.js** -- count, validate result, profile timing (2 steps)

Each behavior receives the Meadow instance, a query object, and a callback. Errors at any waterfall step short-circuit to the final callback.

### Provider Interface

Every provider must implement six methods plus a marshaller:

| Method | Purpose |
|--------|---------|
| `Create(pQuery, fCallback)` | Insert a new record |
| `Read(pQuery, fCallback)` | Read one or more records |
| `Update(pQuery, fCallback)` | Update an existing record |
| `Delete(pQuery, fCallback)` | Delete (or soft-delete) a record |
| `Undelete(pQuery, fCallback)` | Restore a soft-deleted record |
| `Count(pQuery, fCallback)` | Count matching records |
| `marshalRecordFromSourceToObject(pObject, pRecord)` | Copy database row data into a JavaScript object |

Providers that need schema information also implement `setSchema(pScope, pSchema, pDefaultIdentifier, pDefaultGUIdentifier)`, which Meadow calls automatically when the schema or scope changes.

### Query Cloning

Every access to `meadow.query` returns an independent clone of the internal FoxHound query object. This guarantees that configuring one query never leaks state into another:

```javascript
var tmpQuery1 = tmpBookDAL.query.addFilter('Author', 'Asimov');
var tmpQuery2 = tmpBookDAL.query.addFilter('Author', 'Herbert');
// tmpQuery1 and tmpQuery2 are completely independent
```

The clone copies filters, caps, begin offsets, data elements, and sort configuration. The schema reference is set on each clone so that FoxHound has access to column type information for query generation.

### Auto-Stamping

When the schema includes special column types, Meadow automatically populates them during create, update, and delete operations:

| Column Type | Stamped During | Value |
|------------|----------------|-------|
| `CreateDate` | Create | Current timestamp (`NOW()`) |
| `CreateIDUser` | Create | Current user ID |
| `UpdateDate` | Update | Current timestamp (`NOW()`) |
| `UpdateIDUser` | Update | Current user ID |
| `DeleteDate` | Delete | Current timestamp (`NOW()`) |
| `DeleteIDUser` | Delete | Current user ID |
| `AutoIdentity` | Create | Auto-increment value from database |
| `AutoGUID` | Create | Generated UUID |

User identity comes from `meadow.setIDUser(n)` or from `pQuery.query.IDUser` on a per-query basis. Auto-stamping can be disabled per query with `disableAutoDateStamp` and `disableAutoUserStamp`.

### Soft Delete Filtering

When a schema contains a column with type `'Deleted'`, Meadow and FoxHound automatically add `WHERE Deleted = 0` to all read queries. This filters out logically deleted records without any additional code. To see deleted records, set `setDisableDeleteTracking(true)` on the query. See the [Soft Deletes](soft-deletes.md) documentation for details.
