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

// Multiple records with pagination
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

### Delete and Count

```javascript
// Delete (soft delete if schema supports it)
meadow.doDelete(meadow.query.addFilter('IDBook', 1),
	(pError, pQuery, pResult) =>
	{
		console.log('Deleted:', pResult, 'record(s)');
	});

// Count records
meadow.doCount(meadow.query,
	(pError, pQuery, pCount) =>
	{
		console.log('Total books:', pCount);
	});
```

## Schema

Meadow schemas define your data model with special column types that enable automatic behavior:

| Type | Description |
|------|-------------|
| `AutoIdentity` | Auto-increment primary key |
| `AutoGUID` | Automatically generated GUID |
| `CreateDate` / `CreateIDUser` | Auto-populated on create |
| `UpdateDate` / `UpdateIDUser` | Auto-populated on update |
| `DeleteDate` / `DeleteIDUser` | Auto-populated on delete |
| `Deleted` | Soft delete flag |
| `String`, `Text`, `Numeric`, `Decimal`, `Boolean`, `DateTime` | Standard data types |

## Providers

| Provider | Description |
|----------|-------------|
| `MySQL` | MySQL/MariaDB via mysql2 |
| `MSSQL` | Microsoft SQL Server with prepared statements |
| `SQLite` | SQLite via meadow-connection-sqlite |
| `ALASQL` | In-browser IndexedDB via ALASQL |
| `MeadowEndpoints` | REST proxy to remote Meadow API |
| `None` | Null provider for testing |

## ALASQL Provider Example

```javascript
const libFable = require('fable').new();
const libALASQL = require('alasql');

libALASQL('CREATE INDEXEDDB DATABASE IF NOT EXISTS example;');
libALASQL('ATTACH INDEXEDDB DATABASE example;');
libALASQL('USE example;');
libFable.ALASQL = libALASQL;

const meadow = require('meadow').new(libFable, 'Customers')
	.setProvider('ALASQL')
	.setDefaultIdentifier('customerID');
```

## MSSQL Docker Image

To run Microsoft SQL Server tests locally:

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=1234567890abc." \
  -p 14333:1433 --name meadow-mssql-test --hostname meadowsqltest \
  -d mcr.microsoft.com/mssql/server:2022-latest

docker exec meadow-mssql-test sh -c \
  "/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P '1234567890abc.' -Q 'CREATE DATABASE bookstore;'"
```

## Testing

```bash
npm test
```

## Documentation

Detailed documentation is available in the `docs/` folder and can be served locally:

```bash
npx docsify-cli serve docs
```

## Related Packages

- [foxhound](https://github.com/stevenvelozo/foxhound) - Query DSL for SQL generation
- [stricture](https://github.com/stevenvelozo/stricture) - Schema definition language
- [meadow-endpoints](https://github.com/stevenvelozo/meadow-endpoints) - Auto-generated REST endpoints
- [fable](https://github.com/stevenvelozo/fable) - Application services framework

## License

MIT

## Contributing

Pull requests are welcome. For details on our code of conduct, contribution process, and testing requirements, see the [Retold Contributing Guide](https://github.com/stevenvelozo/retold/blob/main/docs/contributing.md).
