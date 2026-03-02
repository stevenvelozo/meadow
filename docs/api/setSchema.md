# setSchema

Set the column schema array for this Meadow instance.

## Signature

```javascript
meadow.setSchema(pSchema)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pSchema` | `Array` | An array of schema column definition objects |

## Returns

Returns the Meadow instance for chaining.

## Description

`setSchema` replaces the current column schema with a new array of column
definitions. Each element describes a column and its behavior during CRUD
operations. After setting the schema, `updateProviderState()` is called to
synchronize the schema with the active provider.

## Schema Column Object

Each element in the schema array is an object with the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `Column` | `string` | Yes | The column name |
| `Type` | `string` | Yes | The column type (see below) |
| `Size` | `string` | No | Size constraint (e.g. `'128'` for VARCHAR(128)) |

## Column Types

| Type | Description |
|------|-------------|
| `AutoIdentity` | Auto-incrementing primary key |
| `AutoGUID` | Automatically generated GUID |
| `CreateDate` | Timestamp set on record creation |
| `CreateIDUser` | User ID stamped on record creation |
| `UpdateDate` | Timestamp set on record update |
| `UpdateIDUser` | User ID stamped on record update |
| `Deleted` | Soft-delete flag (0 or 1) |
| `DeleteIDUser` | User ID stamped on soft delete |
| `DeleteDate` | Timestamp set on soft delete |
| `String` | String/VARCHAR column |
| `Number` | Numeric column |
| `DateTime` | Date/time column |

## Examples

### Full schema definition

```javascript
meadow.setSchema([
	{ Column: 'IDBook', Type: 'AutoIdentity' },
	{ Column: 'GUIDBook', Type: 'AutoGUID' },
	{ Column: 'Title', Type: 'String', Size: '256' },
	{ Column: 'Author', Type: 'String', Size: '128' },
	{ Column: 'PageCount', Type: 'Number' },
	{ Column: 'Created', Type: 'CreateDate' },
	{ Column: 'CreatingIDUser', Type: 'CreateIDUser' },
	{ Column: 'Modified', Type: 'UpdateDate' },
	{ Column: 'ModifyingIDUser', Type: 'UpdateIDUser' },
	{ Column: 'Deleted', Type: 'Deleted' },
	{ Column: 'DeletingIDUser', Type: 'DeleteIDUser' },
	{ Column: 'DeleteDate', Type: 'DeleteDate' }
]);
```

### Minimal schema without soft delete

```javascript
meadow.setSchema([
	{ Column: 'IDWidget', Type: 'AutoIdentity' },
	{ Column: 'GUIDWidget', Type: 'AutoGUID' },
	{ Column: 'Name', Type: 'String', Size: '64' }
]);
```

### Access the schema after setting it

```javascript
console.log(meadow.schema);
// [{ Column: 'IDBook', Type: 'AutoIdentity' }, ...]
```

## Notes

- If `pSchema` is not an object, the schema falls back to a minimal default:
  `{ title: 'Unknown', type: 'object', required: [] }`.

- The schema determines whether soft delete or hard delete is used. If the
  schema contains a column with `Type: 'Deleted'`, all `doDelete` calls perform
  soft deletes.

- The schema is passed to the provider via `updateProviderState()` so the
  provider can use it for query generation and marshalling.

- The `schema` property returns the raw schema array. The `schemaFull` property
  returns the full Meadow-Schema object which includes `validateObject`,
  `defaultObject`, and `authorizer`.
