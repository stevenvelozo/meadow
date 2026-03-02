# Meadow

> A data access library providing magic where you want it, programmability where you don't

Meadow is a JavaScript data broker that handles repetitive CRUD operations through a consistent, provider-agnostic interface. It abstracts database communication behind a unified API -- whether your data lives in MySQL, MSSQL, PostgreSQL, SQLite, MongoDB, RocksDB, or an in-browser ALASQL store, Meadow provides schema management, query generation, data marshalling, and automatic audit stamping while you focus on business logic.

## Features

- **Provider-Agnostic Design** -- pluggable database backends through a consistent CRUD interface
- **Schema-Driven** -- define your data model once and get validation, default objects, and audit tracking for free
- **FoxHound Query DSL** -- fluent query builder that generates dialect-specific SQL, MongoDB queries, or key-value lookups
- **Automatic Audit Tracking** -- auto-populated create, update, and delete timestamps with user identity stamps
- **Soft Deletes** -- built-in logical deletion with automatic query filtering and undelete support
- **GUID Uniqueness** -- automatic GUID generation and uniqueness enforcement on record creation
- **Raw Query Overrides** -- escape hatch for custom SQL when the DSL is not enough
- **Role-Based Authorization** -- declarative access control per operation integrated with Meadow-Endpoints
- **Fable Integration** -- first-class service in the Fable ecosystem with logging, configuration, and dependency injection
- **Browser Support** -- ALASQL provider enables the same data access patterns in the browser via IndexedDB

## Install

```bash
npm install meadow
```

## Quick Example

```javascript
const libFable = require('fable').new();
const libMeadow = require('meadow');

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

// Create
meadow.doCreate(meadow.query.addRecord({ Title: 'Dune', Author: 'Frank Herbert' }),
	(pError, pCreateQuery, pReadQuery, pRecord) =>
	{
		console.log('Created:', pRecord.IDBook, '-', pRecord.Title);
	});

// Read
meadow.doRead(meadow.query.addFilter('IDBook', 1),
	(pError, pQuery, pRecord) =>
	{
		console.log('Found:', pRecord.Title);
	});

// Read multiple with pagination
meadow.doReads(meadow.query.setCap(25).setBegin(0),
	(pError, pQuery, pRecords) =>
	{
		console.log('Found', pRecords.length, 'books');
	});
```

## Learn More

- [Quick Start](quick-start.md) -- setup and first operations
- [Architecture](architecture.md) -- how the service is structured
- [Schema](schema/README.md) -- column definitions, validation, default objects, authorization
- [Query DSL](query-dsl.md) -- FoxHound query building
- [CRUD Operations](query/README.md) -- detailed guides for each operation
- [Providers](providers/README.md) -- database provider system
- [Configuration](configuration.md) -- settings reference
- [API Reference](api/reference.md) -- full method documentation
