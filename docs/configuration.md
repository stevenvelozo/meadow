# Configuration

Meadow is configured through the Fable settings object. All settings are passed when constructing the Fable instance and are available to Meadow and its providers at runtime.

## Core Meadow Settings

### MeadowProvider

The name of the database provider to use by default when creating new Meadow instances.

- **Type:** `String`
- **Default:** `'None'`
- **Valid values:** `'MySQL'`, `'MSSQL'`, `'PostgreSQL'`, `'SQLite'`, `'MongoDB'`, `'RocksDB'`, `'ALASQL'`, `'MeadowEndpoints'`, `'None'`

```javascript
var _Fable = new libFable(
	{
		MeadowProvider: 'MySQL'
	});
```

When set, every `libMeadow.new(_Fable, 'SomeEntity')` call automatically uses this provider. You can override it per-DAL with `meadow.setProvider('OtherProvider')`.

### MeadowRoleNames

An ordered array of role names used by the authorization system. Role indices map to positions in this array.

- **Type:** `Array<String>`
- **Default:**
  ```javascript
  [
  	'Unauthenticated',
  	'User',
  	'Manager',
  	'Director',
  	'Executive',
  	'Administrator'
  ]
  ```

```javascript
var _Fable = new libFable(
	{
		MeadowRoleNames:
		[
			'Anonymous',
			'Viewer',
			'Editor',
			'Admin',
			'SuperAdmin'
		]
	});
```

Role names are retrieved with `meadow.getRoleName(pRoleIndex)`. If the index is out of bounds, `'Unauthenticated'` (or your first role name) is returned.

### QueryThresholdWarnTime

The threshold in milliseconds for slow query warnings. When a `doReads` or `doCount` operation exceeds this time, Meadow logs a warning with the full query details.

- **Type:** `Number`
- **Default:** `200`
- **Unit:** milliseconds

```javascript
var _Fable = new libFable(
	{
		QueryThresholdWarnTime: 500
	});
```

## MySQL Connection Settings

The `MySQL` settings object configures the MySQL provider and connection pool.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `Server` | `String` | `'localhost'` | Database server hostname |
| `Port` | `Number` | `3306` | Database server port |
| `User` | `String` | `'root'` | Database user |
| `Password` | `String` | `''` | Database password |
| `Database` | `String` | `''` | Database name |
| `ConnectionPoolLimit` | `Number` | `20` | Maximum connections in the pool |
| `GlobalLogLevel` | `Number` | `0` | Set to `> 0` to trace all query bodies |

```javascript
var _Fable = new libFable(
	{
		MeadowProvider: 'MySQL',
		MySQL:
		{
			Server: 'db.example.com',
			Port: 3306,
			User: 'app_user',
			Password: 'secret',
			Database: 'my_application',
			ConnectionPoolLimit: 20,
			GlobalLogLevel: 0
		}
	});
```

## MSSQL Connection Settings

The `MSSQL` settings object configures the Microsoft SQL Server provider. The connection pool is managed by the `meadow-connection-mssql` module.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `Server` | `String` | `'localhost'` | Database server hostname |
| `Port` | `Number` | `1433` | Database server port |
| `User` | `String` | `'sa'` | Database user |
| `Password` | `String` | `''` | Database password |
| `Database` | `String` | `''` | Database name |
| `ConnectionPoolLimit` | `Number` | `20` | Maximum connections in the pool |
| `GlobalLogLevel` | `Number` | `0` | Set to `> 0` to trace all query bodies |

```javascript
var _Fable = new libFable(
	{
		MeadowProvider: 'MSSQL',
		MSSQL:
		{
			Server: 'sqlserver.example.com',
			Port: 1433,
			User: 'sa',
			Password: 'secret',
			Database: 'my_application',
			ConnectionPoolLimit: 20,
			GlobalLogLevel: 0
		}
	});
```

## PostgreSQL Connection Settings

The `PostgreSQL` settings object configures the PostgreSQL provider.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `Server` | `String` | `'localhost'` | Database server hostname |
| `Port` | `Number` | `5432` | Database server port |
| `User` | `String` | `'postgres'` | Database user |
| `Password` | `String` | `''` | Database password |
| `Database` | `String` | `''` | Database name |
| `GlobalLogLevel` | `Number` | `0` | Set to `> 0` to trace all query bodies |

```javascript
var _Fable = new libFable(
	{
		MeadowProvider: 'PostgreSQL',
		PostgreSQL:
		{
			Server: 'pg.example.com',
			Port: 5432,
			User: 'postgres',
			Password: 'secret',
			Database: 'my_application',
			GlobalLogLevel: 0
		}
	});
```

## MeadowEndpoints Settings

The `MeadowEndpoints` settings object configures the REST API proxy provider. This provider translates CRUD operations into HTTP requests against a remote Meadow-Endpoints server.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `ServerProtocol` | `String` | `'http'` | Protocol (`'http'` or `'https'`) |
| `ServerAddress` | `String` | `'127.0.0.1'` | Remote server hostname |
| `ServerPort` | `String` | `'8086'` | Remote server port |
| `ServerEndpointPrefix` | `String` | `'1.0/'` | URL prefix for API endpoints |

```javascript
var _Fable = new libFable(
	{
		MeadowProvider: 'MeadowEndpoints',
		MeadowEndpoints:
		{
			ServerProtocol: 'https',
			ServerAddress: 'api.example.com',
			ServerPort: '443',
			ServerEndpointPrefix: '1.0/'
		}
	});
```

## SQLite Settings

SQLite is configured through the `meadow-connection-sqlite` connection module. The connection provider manages the `better-sqlite3` database instance.

```javascript
var _Fable = new libFable(
	{
		MeadowProvider: 'SQLite'
	});

var libMeadowConnectionSQLite = require('meadow-connection-sqlite');
var tmpConnection = libMeadowConnectionSQLite.new(_Fable);
tmpConnection.connectAsync(':memory:');
```

SQLite supports both file-based databases (pass a file path) and in-memory databases (pass `':memory:'`).

## MongoDB Settings

The `MongoDB` settings object configures the MongoDB provider.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `URL` | `String` | `''` | MongoDB connection URL |
| `Database` | `String` | `''` | Database name |
| `GlobalLogLevel` | `Number` | `0` | Set to `> 0` to trace all query bodies |

```javascript
var _Fable = new libFable(
	{
		MeadowProvider: 'MongoDB',
		MongoDB:
		{
			URL: 'mongodb://localhost:27017',
			Database: 'my_application',
			GlobalLogLevel: 0
		}
	});
```

## RocksDB Settings

The `RocksDB` settings object configures the RocksDB key-value provider.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `KeyMode` | `String` | `'GUID'` | Key strategy: `'GUID'` or `'ID'` |
| `GlobalLogLevel` | `Number` | `0` | Set to `> 0` to trace all operations |

```javascript
var _Fable = new libFable(
	{
		MeadowProvider: 'RocksDB',
		RocksDB:
		{
			KeyMode: 'GUID',
			GlobalLogLevel: 0
		}
	});
```

## Full Example

A complete Fable settings object showing all available Meadow options:

```json
{
	"MeadowProvider": "MySQL",

	"MeadowRoleNames": [
		"Unauthenticated",
		"User",
		"Manager",
		"Director",
		"Executive",
		"Administrator"
	],

	"QueryThresholdWarnTime": 200,

	"MySQL": {
		"Server": "localhost",
		"Port": 3306,
		"User": "app_user",
		"Password": "secret",
		"Database": "my_application",
		"ConnectionPoolLimit": 20,
		"GlobalLogLevel": 0
	},

	"MSSQL": {
		"Server": "localhost",
		"Port": 1433,
		"User": "sa",
		"Password": "secret",
		"Database": "my_application",
		"ConnectionPoolLimit": 20,
		"GlobalLogLevel": 0
	},

	"PostgreSQL": {
		"Server": "localhost",
		"Port": 5432,
		"User": "postgres",
		"Password": "secret",
		"Database": "my_application",
		"GlobalLogLevel": 0
	},

	"MeadowEndpoints": {
		"ServerProtocol": "https",
		"ServerAddress": "api.example.com",
		"ServerPort": "443",
		"ServerEndpointPrefix": "1.0/"
	},

	"MongoDB": {
		"URL": "mongodb://localhost:27017",
		"Database": "my_application",
		"GlobalLogLevel": 0
	},

	"RocksDB": {
		"KeyMode": "GUID",
		"GlobalLogLevel": 0
	}
}
```

Note that you only need to include configuration for the provider you are using. Including unused provider settings has no effect.
