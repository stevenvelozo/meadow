# Meadow API Reference

Meadow is a data access layer for the Retold ecosystem. It wraps database
providers behind a consistent CRUD interface, with schema-driven marshalling,
audit stamping, and role-based authorization.

## Factory

```javascript
var libMeadow = require('meadow');
var meadow = libMeadow.new(pFable, 'Book');
```

`require('meadow')` returns a constructor object. Call `.new(pFable, pScope)` to
create an instance bound to a Fable service context and an entity scope.

## CRUD Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| [doCreate](doCreate.md) | `doCreate(pQuery, fCallBack)` | Insert a record, read it back, return marshalled object |
| [doRead](doRead.md) | `doRead(pQuery, fCallBack)` | Read a single record by filter |
| [doReads](doReads.md) | `doReads(pQuery, fCallBack)` | Read multiple records with pagination and filtering |
| [doUpdate](doUpdate.md) | `doUpdate(pQuery, fCallBack)` | Update a record by primary key, read it back |
| [doDelete](doDelete.md) | `doDelete(pQuery, fCallBack)` | Soft-delete or hard-delete a record |
| [doUndelete](doUndelete.md) | `doUndelete(pQuery, fCallBack)` | Restore a soft-deleted record |
| [doCount](doCount.md) | `doCount(pQuery, fCallBack)` | Count records matching filters |

All CRUD methods accept a FoxHound query object (obtained from `meadow.query`)
and a Node-style callback. They return the Meadow instance for chaining.

## Configuration Methods

All configuration methods are chainable (they return `this`).

| Method | Signature | Description |
|--------|-----------|-------------|
| [setProvider](setProvider.md) | `setProvider(pProviderName)` | Set the database provider by name |
| [setScope](setScope.md) | `setScope(pScope)` | Set the entity scope (table name) |
| [setSchema](setSchema.md) | `setSchema(pSchema)` | Set the column schema array |
| [setDefaultIdentifier](setDefaultIdentifier.md) | `setDefaultIdentifier(pDefaultIdentifier)` | Set the primary key column name |
| [setIDUser](setIDUser.md) | `setIDUser(pIDUser)` | Set the user ID for audit stamps |
| [setJsonSchema](setJsonSchema.md) | `setJsonSchema(pJsonSchema)` | Set JSON Schema for validation |
| [setDefault](setDefault.md) | `setDefault(pDefault)` | Set the default object template |
| [setAuthorizer](setAuthorizer.md) | `setAuthorizer(pAuthorizer)` | Set role-based authorization rules |
| [setDomain](setDomain.md) | `setDomain(pDomain)` | Set the entity domain grouping |
| [loadFromPackage](loadFromPackage.md) | `loadFromPackage(pPackage)` | Load schema from a JSON file path |
| [loadFromPackage](loadFromPackage.md) | `loadFromPackageObject(pPackage)` | Load schema from a JS object |

## Utility Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| [validateObject](validateObject.md) | `validateObject(pObject)` | Validate an object against JSON Schema |
| [marshalRecordFromSourceToObject](marshalRecordFromSourceToObject.md) | `marshalRecordFromSourceToObject(pRecord)` | Convert a database row to a plain object |
| [getRoleName](getRoleName.md) | `getRoleName(pRoleIndex)` | Get the role name for a numeric index |
| logSlowQuery | `logSlowQuery(pProfileTime, pQuery)` | Log a warning for slow queries |

## Properties

All properties are read-only.

| Property | Type | Description |
|----------|------|-------------|
| `scope` | `string` | The entity scope (table name) |
| `schema` | `Array` | The column schema array |
| `schemaFull` | `Object` | The full Meadow-Schema object (includes `validateObject`, `defaultObject`, `authorizer`) |
| `jsonSchema` | `Object` | The JSON Schema object |
| `defaultIdentifier` | `string` | The primary key column name (e.g. `'IDBook'`) |
| `defaultGUIdentifier` | `string` | The GUID column name (e.g. `'GUIDBook'`) |
| `userIdentifier` | `number` | The current user ID for audit stamps |
| [query](query.md) | `Object` | A cloned FoxHound query with scope and schema pre-set |
| [rawQueries](rawQueries.md) | `Object` | The raw query manager for SQL overrides |
| `provider` | `Object` | The active database provider instance |
| `providerName` | `string` | The name of the active provider (e.g. `'MySQL'`) |

## Fable Services

Meadow instances also expose the following properties inherited from the Fable
service context:

| Property | Type | Description |
|----------|------|-------------|
| `fable` | `Object` | The parent Fable instance |
| `settings` | `Object` | The Fable settings object |
| `log` | `Object` | The Fable logger |

## Quick Start

```javascript
var libFable = require('fable');
var libMeadow = require('meadow');

var tmpFable = libFable.new({ MeadowProvider: 'MySQL' });
var tmpMeadow = libMeadow.new(tmpFable, 'Book')
	.setSchema([
		{ Column: 'IDBook', Type: 'AutoIdentity' },
		{ Column: 'GUIDBook', Type: 'AutoGUID' },
		{ Column: 'Title', Type: 'String', Size: '128' },
		{ Column: 'Created', Type: 'CreateDate' },
		{ Column: 'CreatingIDUser', Type: 'CreateIDUser' },
		{ Column: 'Modified', Type: 'UpdateDate' },
		{ Column: 'ModifyingIDUser', Type: 'UpdateIDUser' },
		{ Column: 'Deleted', Type: 'Deleted' },
		{ Column: 'DeletingIDUser', Type: 'DeleteIDUser' },
		{ Column: 'DeleteDate', Type: 'DeleteDate' }
	])
	.setIDUser(1);

// Create a record
var tmpQuery = tmpMeadow.query.addRecord({ Title: 'The Hobbit' });
tmpMeadow.doCreate(tmpQuery,
	function (pError, pCreateQuery, pReadQuery, pRecord)
	{
		console.log('Created:', pRecord);
	});
```
