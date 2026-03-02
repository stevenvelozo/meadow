# Soft Deletes

Meadow supports soft deletes (logical deletion) out of the box. When enabled, deleting a record marks it as deleted rather than removing it from the database. This preserves data for audit trails, recovery, and referential integrity.

## The Deleted Column

Soft deletes are activated by including a column with type `'Deleted'` in your schema:

```javascript
var tmpSchema =
[
	{ Column: 'IDBook', Type: 'AutoIdentity' },
	{ Column: 'GUIDBook', Type: 'AutoGUID' },
	{ Column: 'Title', Type: 'String', Size: '255' },
	{ Column: 'CreateDate', Type: 'CreateDate' },
	{ Column: 'CreatingIDUser', Type: 'CreateIDUser' },
	{ Column: 'UpdateDate', Type: 'UpdateDate' },
	{ Column: 'UpdatingIDUser', Type: 'UpdateIDUser' },
	{ Column: 'Deleted', Type: 'Deleted' },
	{ Column: 'DeleteDate', Type: 'DeleteDate' },
	{ Column: 'DeletingIDUser', Type: 'DeleteIDUser' }
];
```

The `Deleted` column should be an integer (typically `TINYINT` in MySQL) with a default value of `0`. A value of `0` means the record is active; `1` means it is deleted.

The corresponding default object should initialize `Deleted` to `0`:

```javascript
var tmpDefault =
{
	IDBook: null,
	GUIDBook: '',
	Title: '',
	CreateDate: false,
	CreatingIDUser: 0,
	UpdateDate: false,
	UpdatingIDUser: 0,
	Deleted: 0,
	DeleteDate: false,
	DeletingIDUser: 0
};
```

## How doDelete Generates UPDATE Instead of DELETE

When FoxHound detects a `Deleted` column in the schema, the `buildDeleteQuery` method generates an `UPDATE` statement instead of a `DELETE` statement. For example, calling `doDelete` with a filter on `IDBook = 1` produces SQL equivalent to:

```sql
UPDATE Book
SET Deleted = 1, DeleteDate = NOW(), DeletingIDUser = :IDUser
WHERE IDBook = :IDBook
```

This means the record remains in the database but is flagged as deleted.

```javascript
tmpBookDAL.setIDUser(42);

var tmpQuery = tmpBookDAL.query
	.addFilter('IDBook', 1);

tmpBookDAL.doDelete(tmpQuery,
	function (pError, pQuery, pResult)
	{
		// The record is not removed from the database.
		// Instead: Deleted = 1, DeleteDate = NOW(), DeletingIDUser = 42
		console.log('Affected rows:', pResult);
	});
```

## Automatic Query Filtering

When a schema contains a `Deleted` column, FoxHound automatically appends `WHERE Deleted = 0` to all read queries. This means soft-deleted records are invisible by default:

```javascript
// This query automatically excludes deleted records
tmpBookDAL.doReads(tmpBookDAL.query.setCap(100),
	function (pError, pQuery, pRecords)
	{
		// pRecords contains only records where Deleted = 0
	});
```

The same automatic filtering applies to `doRead`, `doReads`, and `doCount` operations. You do not need to add `Deleted = 0` filters manually.

## Viewing Deleted Records

To include soft-deleted records in your results, disable delete tracking on the query with `setDisableDeleteTracking(true)`:

```javascript
var tmpQuery = tmpBookDAL.query
	.setDisableDeleteTracking(true)
	.setCap(100);

tmpBookDAL.doReads(tmpQuery,
	function (pError, pQuery, pRecords)
	{
		// pRecords includes both active and soft-deleted records
		for (var i = 0; i < pRecords.length; i++)
		{
			var tmpStatus = pRecords[i].Deleted ? 'DELETED' : 'ACTIVE';
			console.log(tmpStatus, '-', pRecords[i].Title);
		}
	});
```

To retrieve only deleted records, combine `setDisableDeleteTracking` with a filter on the `Deleted` column:

```javascript
var tmpQuery = tmpBookDAL.query
	.setDisableDeleteTracking(true)
	.addFilter('Deleted', 1);

tmpBookDAL.doReads(tmpQuery,
	function (pError, pQuery, pRecords)
	{
		// pRecords contains only soft-deleted records
		console.log('Deleted books:', pRecords.length);
	});
```

## Restoring Deleted Records with doUndelete

The `doUndelete` method restores a soft-deleted record by setting `Deleted` back to `0`. FoxHound generates an `UPDATE` statement equivalent to:

```sql
UPDATE Book
SET Deleted = 0
WHERE IDBook = :IDBook
```

```javascript
var tmpQuery = tmpBookDAL.query
	.addFilter('IDBook', 1);

tmpBookDAL.doUndelete(tmpQuery,
	function (pError, pQuery, pResult)
	{
		console.log('Restored record, affected rows:', pResult);
		// The record is now visible in normal queries again
	});
```

After undelete, the record appears in standard queries that have the default `Deleted = 0` filter.

## DeleteDate and DeletingIDUser Columns

For a complete audit trail of deletions, include `DeleteDate` and `DeletingIDUser` columns alongside the `Deleted` column:

| Column Type | Purpose | Value on Delete | Value on Undelete |
|------------|---------|-----------------|-------------------|
| `Deleted` | Deletion flag | `1` | `0` |
| `DeleteDate` | When the record was deleted | `NOW()` | Not changed |
| `DeleteIDUser` | Who deleted the record | Current user ID | Not changed |

Note that `doUndelete` does not clear `DeleteDate` or `DeletingIDUser`. These columns retain their values from the last delete operation, providing a historical record even after restoration.

```javascript
// Full schema with delete tracking
var tmpSchema =
[
	{ Column: 'IDBook', Type: 'AutoIdentity' },
	{ Column: 'GUIDBook', Type: 'AutoGUID' },
	{ Column: 'Title', Type: 'String', Size: '255' },
	{ Column: 'Deleted', Type: 'Deleted' },
	{ Column: 'DeleteDate', Type: 'DeleteDate' },
	{ Column: 'DeletingIDUser', Type: 'DeleteIDUser' }
];
```

## Hard Delete (No Deleted Column)

If your schema does not include a column with type `'Deleted'`, then `doDelete` performs a true SQL `DELETE` statement. The record is permanently removed from the database:

```javascript
// Schema without a Deleted column
var tmpSchema =
[
	{ Column: 'IDLog', Type: 'AutoIdentity' },
	{ Column: 'GUIDLog', Type: 'AutoGUID' },
	{ Column: 'Message', Type: 'String', Size: '1024' },
	{ Column: 'CreateDate', Type: 'CreateDate' }
];

var tmpLogDAL = libMeadow.new(_Fable, 'Log')
	.setProvider('MySQL')
	.setDefaultIdentifier('IDLog')
	.setSchema(tmpSchema);

var tmpQuery = tmpLogDAL.query
	.addFilter('IDLog', 500);

tmpLogDAL.doDelete(tmpQuery,
	function (pError, pQuery, pResult)
	{
		// The record is permanently removed from the database.
		// This is a true DELETE FROM statement.
		console.log('Permanently deleted, affected rows:', pResult);
	});
```

With hard deletes:

- There is no automatic `Deleted = 0` filter on read queries.
- `doUndelete` has no meaningful effect (there is nothing to restore).
- Deleted data cannot be recovered through Meadow.

## Choosing Between Soft and Hard Deletes

Use **soft deletes** when:

- You need audit trails showing who deleted what and when.
- Users should be able to recover accidentally deleted records.
- Referential integrity depends on records existing even when "removed".
- Compliance requirements mandate data retention.

Use **hard deletes** when:

- Storage space is a concern and deleted data has no value.
- Privacy regulations require actual data removal (e.g., GDPR right to erasure).
- The table is for transient data (logs, sessions, caches) that has no recovery need.

Most Retold applications use soft deletes for business entities and hard deletes for ephemeral data.
