# JSON Columns

> Store structured data as JSON in SQL databases with automatic serialization

Meadow supports two column types for storing structured JSON data: `JSON` and `JSONProxy`. Both store data as `TEXT` in SQL databases and handle serialization/deserialization automatically. Object-store providers (MongoDB, RocksDB) store these values as native objects.

## JSON Type

The `JSON` type stores structured data in a column where the SQL name and JavaScript property name are identical.

### Schema Definition

```javascript
{ Column: 'Metadata', Type: 'JSON' }
```

### MicroDDL Syntax

```
{Metadata
```

### Behavior

| Operation | What Happens |
|-----------|-------------|
| **Create** | `record.Metadata` is `JSON.stringify`'d into the `Metadata` TEXT column |
| **Read** | The `Metadata` TEXT column is `JSON.parse`'d into `record.Metadata` (an object) |
| **Update** | Same as Create -- the value is serialized before writing |
| **Default** | `{}` (empty object) |

### Example

```javascript
// Schema
const schema = [
	{ Column: 'IDProduct', Type: 'AutoIdentity' },
	{ Column: 'Name', Type: 'String', Size: '128' },
	{ Column: 'Metadata', Type: 'JSON' },
	// ... audit columns
];

// Create with JSON data
meadow.doCreate(
	meadow.query.addRecord({
		Name: 'Widget',
		Metadata: { color: 'blue', weight: 1.5, tags: ['sale', 'new'] }
	}),
	(pError, pCreateQuery, pReadQuery, pRecord) =>
	{
		console.log(pRecord.Metadata);
		// => { color: 'blue', weight: 1.5, tags: ['sale', 'new'] }
		console.log(typeof pRecord.Metadata);
		// => 'object'
	});
```

## JSONProxy Type

The `JSONProxy` type stores JSON in a SQL column with a different name than the JavaScript property. This is useful when you want a clean API surface while keeping an explicit naming convention in the database.

### Schema Definition

```javascript
{ Column: 'Preferences', Type: 'JSONProxy', StorageColumn: 'PreferencesJSON' }
```

| Property | Description |
|----------|-------------|
| `Column` | The JavaScript property name (virtual) -- what API consumers see |
| `StorageColumn` | The actual SQL column name -- what the database stores |

### MicroDDL Syntax

```
{Preferences PreferencesJSON
```

### Behavior

| Operation | What Happens |
|-----------|-------------|
| **Create** | `record.Preferences` is `JSON.stringify`'d into the `PreferencesJSON` SQL column |
| **Read** | The `PreferencesJSON` column is `JSON.parse`'d and mapped to `record.Preferences`; `PreferencesJSON` is **not** exposed on the result |
| **Update** | Same as Create -- serialized to the storage column |
| **Default** | `{}` (empty object) |

### Example

```javascript
// Schema
const schema = [
	{ Column: 'IDUser', Type: 'AutoIdentity' },
	{ Column: 'Name', Type: 'String', Size: '128' },
	{ Column: 'Preferences', Type: 'JSONProxy', StorageColumn: 'PreferencesJSON' },
	// ... audit columns
];

// Create
meadow.doCreate(
	meadow.query.addRecord({
		Name: 'Alice',
		Preferences: { theme: 'dark', language: 'en', notifications: true }
	}),
	(pError, pCreateQuery, pReadQuery, pRecord) =>
	{
		console.log(pRecord.Preferences);
		// => { theme: 'dark', language: 'en', notifications: true }

		console.log(pRecord.PreferencesJSON);
		// => undefined (storage column is hidden)
	});
```

## SQL Storage

In SQL databases, both JSON types are stored as text columns. MySQL uses `LONGTEXT` (up to 4GB) to avoid the 64KB limit of `TEXT`. Other databases use `TEXT` (unlimited in PostgreSQL and SQLite) or `NVARCHAR(MAX)` (MSSQL).

| Provider | JSON DDL | JSONProxy DDL |
|----------|----------|---------------|
| MySQL | `Metadata LONGTEXT` | `PreferencesJSON LONGTEXT` |
| PostgreSQL | `"Metadata" TEXT` | `"PreferencesJSON" TEXT` |
| SQLite | `Metadata TEXT` | `PreferencesJSON TEXT` |
| MSSQL | `[Metadata] NVARCHAR(MAX)` | `[PreferencesJSON] NVARCHAR(MAX)` |

## Filtering on JSON Properties

FoxHound supports filtering on nested JSON properties using dot notation:

```javascript
// Filter by a JSON property
meadow.doReads(
	meadow.query.addFilter('Metadata.color', 'blue'),
	(pError, pQuery, pRecords) =>
	{
		// Returns records where Metadata contains { color: 'blue' }
	});

// Comparison operators work too
meadow.doReads(
	meadow.query.addFilter('Metadata.weight', 2.0, '>='),
	(pError, pQuery, pRecords) =>
	{
		// Returns records where Metadata.weight >= 2.0
	});
```

The generated SQL uses dialect-specific JSON path functions:

| Dialect | Generated SQL |
|---------|---------------|
| MySQL | `JSON_EXTRACT(Metadata, '$.color') = :Metadata_color_w0` |
| PostgreSQL | `Metadata->>'color' = :Metadata_color_w0` |
| SQLite | `json_extract(Metadata, '$.color') = :Metadata_color_w0` |
| MSSQL | `JSON_VALUE(Metadata, '$.color') = :Metadata_color_w0` |

Nested paths are supported (e.g., `Metadata.dimensions.width`).

For `JSONProxy` columns, the storage column is used in the SQL expression automatically. Filtering on `Preferences.theme` produces `json_extract(PreferencesJSON, '$.theme')` in SQLite.

## Package File Format

When using a JSON package file to define your schema:

```json
{
	"Scope": "Product",
	"DefaultIdentifier": "IDProduct",
	"Schema": [
		{ "Column": "IDProduct", "Type": "AutoIdentity" },
		{ "Column": "Name", "Type": "String", "Size": "128" },
		{ "Column": "Metadata", "Type": "JSON" },
		{ "Column": "Preferences", "Type": "JSONProxy", "StorageColumn": "PreferencesJSON" }
	],
	"DefaultObject": {
		"IDProduct": null,
		"Name": "",
		"Metadata": {},
		"Preferences": {}
	}
}
```

Note that `DefaultObject` uses the virtual property name (`Preferences`), not the storage column name.

## Object Store Providers

MongoDB and RocksDB store JSON values as native objects -- no serialization or deserialization is needed. The `JSON` and `JSONProxy` types work transparently with these providers; the marshaling layer simply passes the objects through.
