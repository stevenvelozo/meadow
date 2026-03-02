# Audit Tracking

Meadow provides automatic audit tracking through special schema column types. When these columns are present in your schema, Meadow stamps them with timestamps and user identity during create, update, and delete operations -- without any manual intervention.

## Schema Types for Audit Tracking

The following schema column types enable automatic audit tracking:

| Column Type | Purpose | Stamped During | Value |
|------------|---------|----------------|-------|
| `CreateDate` | Records when a row was created | `doCreate` | Current timestamp (`NOW()`) |
| `CreateIDUser` | Records who created the row | `doCreate` | Current user ID |
| `UpdateDate` | Records when a row was last modified | `doUpdate` | Current timestamp (`NOW()`) |
| `UpdateIDUser` | Records who last modified the row | `doUpdate` | Current user ID |
| `DeleteDate` | Records when a row was soft-deleted | `doDelete` | Current timestamp (`NOW()`) |
| `DeleteIDUser` | Records who soft-deleted the row | `doDelete` | Current user ID |

### Schema Definition Example

A complete schema with all audit columns:

```javascript
var tmpSchema =
[
	{ Column: 'IDBook', Type: 'AutoIdentity' },
	{ Column: 'GUIDBook', Type: 'AutoGUID' },
	{ Column: 'Title', Type: 'String', Size: '255' },
	{ Column: 'Author', Type: 'String', Size: '128' },

	// Audit tracking columns
	{ Column: 'CreateDate', Type: 'CreateDate' },
	{ Column: 'CreatingIDUser', Type: 'CreateIDUser' },
	{ Column: 'UpdateDate', Type: 'UpdateDate' },
	{ Column: 'UpdatingIDUser', Type: 'UpdateIDUser' },
	{ Column: 'DeleteDate', Type: 'DeleteDate' },
	{ Column: 'DeletingIDUser', Type: 'DeleteIDUser' },
	{ Column: 'Deleted', Type: 'Deleted' }
];
```

You can name the columns whatever you like. The `Type` field determines the behavior, not the `Column` name. For example, `{ Column: 'ModifiedOn', Type: 'UpdateDate' }` works just as well.

## How Each Column Is Populated

### During Create (`doCreate`)

When a record is created, Meadow merges the submitted record with the default object and passes it to the provider. The provider (via FoxHound query generation) handles `CreateDate` and `CreateIDUser`:

- **CreateDate** -- FoxHound generates `NOW()` (or the database-specific equivalent) in the INSERT statement for this column.
- **CreateIDUser** -- The current user ID is written into the record before the INSERT. The user ID comes from `meadow.userIdentifier` (set via `setIDUser`) or from `pQuery.query.IDUser` if set on the query.

```javascript
tmpBookDAL.setIDUser(42);

tmpBookDAL.doCreate(tmpBookDAL.query.addRecord({ Title: 'Dune' }),
	function (pError, pCreateQuery, pReadQuery, pRecord)
	{
		// pRecord.CreateDate is set to the current timestamp
		// pRecord.CreatingIDUser is 42
	});
```

### During Update (`doUpdate`)

The update behavior iterates through the schema looking for `UpdateDate` and `UpdateIDUser` column types. It sets these values to `false` in the record, which signals FoxHound to generate `NOW()` for dates and to use the current user ID:

- **UpdateDate** -- Set to `false` in the record before the UPDATE, which FoxHound interprets as "use `NOW()`".
- **UpdateIDUser** -- Set to `false` in the record, which FoxHound populates with the `IDUser` from the query.

```javascript
tmpBookDAL.setIDUser(99);

tmpBookDAL.doUpdate(tmpBookDAL.query.addRecord({ IDBook: 1, Title: 'Dune (Revised)' }),
	function (pError, pUpdateQuery, pReadQuery, pRecord)
	{
		// pRecord.UpdateDate is set to the current timestamp
		// pRecord.UpdatingIDUser is 99
	});
```

### During Delete (`doDelete`)

When the schema includes a `Deleted` column (type `'Deleted'`), the delete operation is a soft delete -- an UPDATE that sets `Deleted = 1`. FoxHound also populates the `DeleteDate` and `DeleteIDUser` columns during this operation:

- **DeleteDate** -- Set to `NOW()` in the generated UPDATE statement.
- **DeleteIDUser** -- Set to the current user ID in the generated UPDATE statement.

```javascript
tmpBookDAL.setIDUser(7);

tmpBookDAL.doDelete(tmpBookDAL.query.addFilter('IDBook', 1),
	function (pError, pQuery, pResult)
	{
		// The record now has:
		//   Deleted = 1
		//   DeleteDate = current timestamp
		//   DeletingIDUser = 7
	});
```

## Setting User Identity

### DAL-Level Identity with setIDUser

Set the user ID on the Meadow DAL instance. This value applies to all subsequent operations on that DAL:

```javascript
tmpBookDAL.setIDUser(42);
```

The value is accessible through `meadow.userIdentifier`.

### Per-Query Identity

Override the user ID for a single operation by setting `IDUser` on the query object:

```javascript
var tmpQuery = tmpBookDAL.query
	.addRecord({ Title: 'New Book' });

tmpQuery.query.IDUser = 99;

tmpBookDAL.doCreate(tmpQuery,
	function (pError, pCreateQuery, pReadQuery, pRecord)
	{
		// CreatingIDUser is 99, not the DAL-level value
	});
```

The per-query `IDUser` takes precedence. The behavior first checks `pQuery.query.IDUser`, and only falls back to `meadow.userIdentifier` if the query-level value is not set.

### Identity Resolution Order

1. If `pQuery.query.IDUser` is already set (non-falsy), use it as-is.
2. If the query has `pQuery.userID` set as a valid non-negative integer, use that.
3. Otherwise, use `meadow.userIdentifier` (from `setIDUser`).

## Disabling Auto-Stamps

In some cases you may need to prevent Meadow from overwriting date or user columns -- for example, during data migrations or when synchronizing records from an external system.

### disableAutoDateStamp

Prevents the update behavior from overwriting `UpdateDate` columns:

```javascript
var tmpQuery = tmpBookDAL.query
	.addRecord(
		{
			IDBook: 1,
			Title: 'Migrated Record',
			UpdateDate: '2020-01-15 10:30:00'
		});

tmpQuery.query.disableAutoDateStamp = true;

tmpBookDAL.doUpdate(tmpQuery,
	function (pError, pUpdateQuery, pReadQuery, pRecord)
	{
		// UpdateDate retains the value '2020-01-15 10:30:00'
		// instead of being overwritten with NOW()
	});
```

### disableAutoUserStamp

Prevents the update behavior from overwriting `UpdateIDUser` columns:

```javascript
var tmpQuery = tmpBookDAL.query
	.addRecord(
		{
			IDBook: 1,
			Title: 'Imported Record',
			UpdatingIDUser: 500
		});

tmpQuery.query.disableAutoUserStamp = true;

tmpBookDAL.doUpdate(tmpQuery,
	function (pError, pUpdateQuery, pReadQuery, pRecord)
	{
		// UpdatingIDUser retains the value 500
		// instead of being overwritten with the current user ID
	});
```

### Combining Both Flags

You can disable both auto-stamps simultaneously:

```javascript
var tmpQuery = tmpBookDAL.query
	.addRecord(
		{
			IDBook: 1,
			Title: 'Full Migration',
			UpdateDate: '2019-06-01 08:00:00',
			UpdatingIDUser: 200
		});

tmpQuery.query.disableAutoDateStamp = true;
tmpQuery.query.disableAutoUserStamp = true;
```

## Use Cases

### Compliance and Audit Trails

Including all six audit columns in your schema creates a complete record of who did what and when:

- **Who created this record?** Check `CreatingIDUser` and `CreateDate`.
- **Who last modified it?** Check `UpdatingIDUser` and `UpdateDate`.
- **Who deleted it and when?** Check `DeletingIDUser` and `DeleteDate`.

This information is populated automatically with no additional application code.

### Change History

Combine audit columns with soft deletes for a complete change history. Since deleted records are preserved in the database (just flagged with `Deleted = 1`), you always have a trail of when records were removed and by whom.

For more granular change tracking, consider logging the full before/after state of records using Meadow behaviors in conjunction with your application logic.

### Data Migration

When importing historical data, use `disableAutoDateStamp` and `disableAutoUserStamp` to preserve the original timestamps and user identity from the source system instead of overwriting them with current values.
