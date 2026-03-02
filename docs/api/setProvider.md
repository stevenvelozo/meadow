# setProvider

Set the database provider used for query execution.

## Signature

```javascript
meadow.setProvider(pProviderName)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pProviderName` | `string` | The name of the database provider |

## Returns

Returns the Meadow instance for chaining.

## Description

`setProvider` loads a database provider module by name and binds it to the
Meadow instance. After loading, it calls `updateProviderState()` to synchronize
the current scope, schema, and identifier settings with the new provider.

If `pProviderName` is not a string, or if the provider module fails to load,
Meadow falls back to the `'None'` provider and logs an error.

The provider is also initialized during Meadow construction from the
`MeadowProvider` Fable setting (default `'None'`).

## Valid Provider Names

| Provider | Description |
|----------|-------------|
| `'MySQL'` | MySQL / MariaDB |
| `'MSSQL'` | Microsoft SQL Server |
| `'PostgreSQL'` | PostgreSQL |
| `'SQLite'` | SQLite |
| `'MongoDB'` | MongoDB |
| `'RocksDB'` | RocksDB |
| `'DGraph'` | Dgraph |
| `'Solr'` | Apache Solr |
| `'ALASQL'` | AlaSQL (in-memory / browser) |
| `'MeadowEndpoints'` | Remote Meadow REST endpoints |
| `'None'` | No-op provider (default) |

## Examples

### Set provider explicitly

```javascript
var meadow = libMeadow.new(tmpFable, 'Book')
	.setProvider('MySQL');
```

### Set provider via Fable settings

```javascript
var tmpFable = libFable.new({ MeadowProvider: 'PostgreSQL' });
var meadow = libMeadow.new(tmpFable, 'Book');
// Provider is already PostgreSQL from settings
```

### Chain with other configuration

```javascript
var meadow = libMeadow.new(tmpFable, 'Book')
	.setProvider('MySQL')
	.setSchema(bookSchema)
	.setDefaultIdentifier('IDBook');
```

## Notes

- Provider names are **case sensitive**. `'MySQL'` is valid; `'mysql'` is not.

- When a provider fails to load, Meadow logs the error and silently falls back
  to `'None'`. The `'None'` provider is a no-op that does not execute any
  database operations.

- Changing the provider calls `updateProviderState()`, which passes the current
  scope, schema, default identifier, and GUID identifier to the new provider.

- The provider can be changed at any time, but in practice it is typically set
  once during initialization.
