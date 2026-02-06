# Meadow

> A data access layer providing magic where you want it, programmability where you don't

Meadow is a JavaScript data broker that handles repetitive CRUD operations through a consistent, provider-agnostic interface. It doesn't care whether your data lives in MySQL, MSSQL, SQLite, or an in-browser IndexedDB store -- Meadow provides the schema management, query building, and data marshalling while you provide the business logic.

## Features

- **Provider-Agnostic Design** - Pluggable database backends through a consistent interface
- **Schema-Driven** - Define your data model once, get validation, default objects, and audit tracking for free
- **FoxHound Query DSL** - Fluent query builder that generates dialect-specific SQL
- **Automatic Audit Tracking** - Auto-populated create/update/delete timestamps and user stamps
- **Soft Deletes** - Built-in logical deletion with automatic query filtering
- **GUID Uniqueness** - Automatic GUID generation and uniqueness enforcement on create
- **Raw Query Overrides** - Escape hatch for custom SQL when the DSL isn't enough
- **Fable Integration** - First-class service in the Fable ecosystem with logging and configuration

## Quick Start

```javascript
const libFable = require('fable').new();
const libMeadow = require('meadow');

// Create a Meadow DAL for the "Book" entity
const meadow = libMeadow.new(libFable, 'Book')
	.setProvider('MySQL')
	.setDefaultIdentifier('IDBook')
	.setSchema([
		{ Column: 'IDBook', Type: 'AutoIdentity' },
		{ Column: 'GUIDBook', Type: 'AutoGUID' },
		{ Column: 'Title', Type: 'String', Size: '255' },
		{ Column: 'Author', Type: 'String', Size: '128' },
		{ Column: 'CreateDate', Type: 'CreateDate' },
		{ Column: 'CreatingIDUser', Type: 'CreateIDUser' },
		{ Column: 'UpdateDate', Type: 'UpdateDate' },
		{ Column: 'UpdatingIDUser', Type: 'UpdateIDUser' },
		{ Column: 'DeleteDate', Type: 'DeleteDate' },
		{ Column: 'DeletingIDUser', Type: 'DeleteIDUser' },
		{ Column: 'Deleted', Type: 'Deleted' }
	]);

// Read a single record
meadow.doRead(meadow.query.addFilter('IDBook', 42),
	(pError, pQuery, pBook) =>
	{
		if (pError)
		{
			return console.log('Error reading book:', pError);
		}
		console.log('Found:', pBook.Title, 'by', pBook.Author);
	});
```

## Installation

```bash
npm install meadow
```

## How It Works

Meadow follows the Fable service provider pattern. You create a DAL instance for each entity in your data model, configure its schema and provider, then use the CRUD methods to interact with your database. Meadow handles query generation, data marshalling, schema validation, and audit stamping automatically.

```
Fable (Core)
  └── Meadow (Data Access Layer)
        ├── Schema (Column definitions, validation, defaults)
        ├── FoxHound Query DSL (Dialect-specific SQL generation)
        ├── Behaviors (Create, Read, Reads, Update, Delete, Count, Undelete)
        └── Provider (MySQL, MSSQL, SQLite, ALASQL, MeadowEndpoints, None)
              └── Database Connection
```

## CRUD Operations

All operations follow an async waterfall pattern with a consistent callback signature.

### Create

```javascript
const tmpQuery = meadow.query.addRecord({ Title: 'Dune', Author: 'Frank Herbert' });
meadow.doCreate(tmpQuery,
	(pError, pCreateQuery, pReadQuery, pRecord) =>
	{
		console.log('Created book with ID:', pRecord.IDBook);
	});
```

### Read

```javascript
// Single record
meadow.doRead(meadow.query.addFilter('IDBook', 1),
	(pError, pQuery, pRecord) =>
	{
		console.log('Book:', pRecord.Title);
	});

// Multiple records
meadow.doReads(meadow.query.setCap(25).setBegin(0),
	(pError, pQuery, pRecords) =>
	{
		console.log('Found', pRecords.length, 'books');
	});
```

### Update

```javascript
const tmpQuery = meadow.query
	.addFilter('IDBook', 1)
	.addRecord({ Title: 'Updated Title' });
meadow.doUpdate(tmpQuery,
	(pError, pUpdateQuery, pReadQuery, pRecord) =>
	{
		console.log('Updated:', pRecord.Title);
	});
```

### Delete

```javascript
meadow.doDelete(meadow.query.addFilter('IDBook', 1),
	(pError, pQuery, pResult) =>
	{
		console.log('Deleted:', pResult, 'record(s)');
	});
```

### Count

```javascript
meadow.doCount(meadow.query,
	(pError, pQuery, pCount) =>
	{
		console.log('Total books:', pCount);
	});
```

## Schema

Meadow schemas define your data model with special column types that enable automatic behavior.

### Column Types

| Type | Description |
|------|-------------|
| `AutoIdentity` | Auto-increment primary key |
| `AutoGUID` | Automatically generated GUID |
| `CreateDate` | Auto-populated timestamp on create |
| `CreateIDUser` | Auto-populated user ID on create |
| `UpdateDate` | Auto-populated timestamp on update |
| `UpdateIDUser` | Auto-populated user ID on update |
| `DeleteDate` | Auto-populated timestamp on delete |
| `DeleteIDUser` | Auto-populated user ID on delete |
| `Deleted` | Soft delete flag (enables logical deletion) |
| `String` | String field with optional `Size` |
| `Text` | Long text field |
| `Numeric` | Integer field |
| `Decimal` | Decimal field with `Size` as `"precision,scale"` |
| `Boolean` | Boolean field |
| `DateTime` | Date/time field |

### JSON Schema Validation

Meadow also supports JSON Schema (v4) for object validation:

```javascript
meadow.setJsonSchema({
	title: 'Book',
	type: 'object',
	properties:
	{
		IDBook: { type: 'integer' },
		Title: { type: 'string' },
		Author: { type: 'string' }
	},
	required: ['Title']
});

const result = meadow.schemaFull.validateObject({ Title: 'Dune' });
// { Valid: true, Errors: [] }
```

## Configuration

Meadow reads database configuration from the Fable settings object:

```json
{
	"Product": "MyApp",
	"ProductVersion": "1.0.0",
	"MySQL": {
		"Server": "localhost",
		"Port": 3306,
		"User": "root",
		"Password": "",
		"Database": "myapp",
		"ConnectionPoolLimit": 20
	},
	"QueryThresholdWarnTime": 200
}
```

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `MySQL` | object | - | MySQL connection settings |
| `QueryThresholdWarnTime` | number | `200` | Slow query warning threshold (ms) |
| `MeadowProvider` | string | - | Default provider name |
| `MeadowRoleNames` | array | `['Unauthenticated', 'User', 'Manager', 'Director', 'Executive', 'Administrator']` | Role name mapping |

## Providers

Meadow supports multiple database backends through its provider system.

| Provider | Description | Connection |
|----------|-------------|------------|
| `MySQL` | MySQL/MariaDB via mysql2 | `fable.MeadowMySQLConnectionPool` or `fable.MeadowMySQLProvider` |
| `MSSQL` | Microsoft SQL Server | `fable.MeadowMSSQLProvider` |
| `SQLite` | SQLite database | Via meadow-connection-sqlite |
| `ALASQL` | In-browser IndexedDB | `fable.ALASQL` |
| `MeadowEndpoints` | REST proxy to remote Meadow API | Via `MeadowEndpoints` settings |
| `None` | Null provider for testing | No connection required |

## Raw Query Overrides

For complex queries that exceed the DSL capabilities:

```javascript
// Set a custom query for Read operations
meadow.rawQueries.setQuery('Read',
	'SELECT b.*, a.Name AS AuthorName FROM Book b JOIN Author a ON b.IDAuthor = a.IDAuthor WHERE b.IDBook = :IDBook');

// Load from file
meadow.rawQueries.loadQuery('CustomReport', './queries/book-report.sql');

// Check and use
if (meadow.rawQueries.checkQuery('CustomReport'))
{
	const sql = meadow.rawQueries.getQuery('CustomReport');
}
```

## Testing

```bash
npm test
```

## Documentation

- [Architecture](architecture.md) - System architecture and design patterns
- [Schema](schema/README.md) - Column definitions, JSON Schema validation, default objects, authorization
- [Query DSL](query-dsl.md) - FoxHound query building
- [Query Operations](query/README.md) - Query object overview and CRUD operations
  - [Create](query/create.md) - Insert new records
  - [Read](query/read.md) - Retrieve single and multiple records
  - [Update](query/update.md) - Modify existing records
  - [Delete](query/delete.md) - Soft delete and undelete records
  - [Count](query/count.md) - Count records matching criteria
- [Providers](providers/README.md) - Database provider system
  - [MySQL](providers/mysql.md) - Connection pooling, named placeholders
  - [MSSQL](providers/mssql.md) - Prepared statements, type mapping
  - [SQLite](providers/sqlite.md) - Embedded database
  - [ALASQL](providers/alasql.md) - In-memory SQL, browser support

## Related Packages

- [foxhound](https://github.com/stevenvelozo/foxhound) - Query DSL for SQL generation
- [stricture](https://github.com/stevenvelozo/stricture) - Schema definition language
- [meadow-endpoints](https://github.com/stevenvelozo/meadow-endpoints) - Automatic REST endpoint generation
- [meadow-connection-mysql](https://github.com/stevenvelozo/meadow-connection-mysql) - MySQL connection provider
- [meadow-connection-mssql](https://github.com/stevenvelozo/meadow-connection-mssql) - MSSQL connection provider
- [meadow-connection-sqlite](https://github.com/stevenvelozo/meadow-connection-sqlite) - SQLite connection provider
- [fable](https://github.com/stevenvelozo/fable) - Service provider framework
- [orator](https://github.com/stevenvelozo/orator) - API server abstraction
