# Delete

> Soft delete, hard delete, and undelete records

Meadow supports both soft deletes (logical deletion) and hard deletes (physical removal), depending on your schema. When your schema includes a `Deleted` column, delete operations set a flag rather than removing the record. Meadow also provides an undelete operation to restore soft-deleted records.

## doDelete

### Method Signature

```javascript
meadow.doDelete(pQuery, fCallBack)
```

### Callback

```javascript
fCallBack(pError, pQuery, pCount)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `pError` | object/null | Error object if the operation failed, null on success |
| `pQuery` | object | The query that was executed |
| `pCount` | number | Number of affected records |

### Basic Usage

```javascript
meadow.doDelete(meadow.query.addFilter('IDBook', 42),
	(pError, pQuery, pCount) =>
	{
		if (pError)
		{
			return console.log('Delete failed:', pError);
		}
		console.log('Deleted', pCount, 'record(s)');
	});
```

## Soft Delete vs Hard Delete

The behavior depends on whether your schema includes a `Deleted` column:

### Soft Delete (Schema has `Deleted` field)

When the schema includes `{ Column: 'Deleted', Type: 'Deleted' }`, the delete operation generates an UPDATE statement instead of a DELETE:

```sql
-- What Meadow generates for soft delete:
UPDATE Book SET Deleted = 1, DeleteDate = NOW(), DeletingIDUser = :IDUser,
  UpdateDate = NOW() WHERE IDBook = :IDBook
```

The record remains in the database but is excluded from normal queries.

```javascript
// Schema includes Deleted column
const meadow = libMeadow.new(libFable, 'Book')
	.setDefaultIdentifier('IDBook')
	.setSchema([
		{ Column: 'IDBook', Type: 'AutoIdentity' },
		{ Column: 'Title', Type: 'String', Size: '255' },
		{ Column: 'DeleteDate', Type: 'DeleteDate' },
		{ Column: 'DeletingIDUser', Type: 'DeleteIDUser' },
		{ Column: 'UpdateDate', Type: 'UpdateDate' },
		{ Column: 'UpdatingIDUser', Type: 'UpdateIDUser' },
		{ Column: 'Deleted', Type: 'Deleted' }
	]);

meadow.setIDUser(5);

meadow.doDelete(meadow.query.addFilter('IDBook', 42),
	(pError, pQuery, pCount) =>
	{
		// Record 42 now has:
		//   Deleted = 1
		//   DeleteDate = NOW()
		//   DeletingIDUser = 5
		//   UpdateDate = NOW()
		// The record is still in the database
	});
```

### Hard Delete (Schema without `Deleted` field)

When there is no `Deleted` column in the schema, the delete operation generates an actual DELETE statement:

```sql
-- What Meadow generates for hard delete:
DELETE FROM Book WHERE IDBook = :IDBook
```

The record is physically removed from the database.

### Auto-Populated Fields on Soft Delete

| Schema Type | Behavior on Delete |
|-------------|-------------------|
| `Deleted` | Set to `1` |
| `DeleteDate` | Set to `NOW()` |
| `DeleteIDUser` | Set to the current user ID |
| `UpdateDate` | Set to `NOW()` (a delete is an update) |
| `UpdateIDUser` | Set to the current user ID |
| All others | **Not modified** |

## Soft Delete and Read Queries

After soft deletion, the record is automatically excluded from normal reads:

```javascript
// This will NOT find the soft-deleted book
meadow.doRead(meadow.query.addFilter('IDBook', 42),
	(pError, pQuery, pRecord) =>
	{
		// pRecord is undefined -- the book appears "deleted"
	});

// To find soft-deleted records, disable delete tracking
meadow.doRead(meadow.query.addFilter('IDBook', 42).setDisableDeleteTracking(true),
	(pError, pQuery, pRecord) =>
	{
		// pRecord is the soft-deleted book with Deleted = 1
	});
```

---

## doUndelete

### Method Signature

```javascript
meadow.doUndelete(pQuery, fCallBack)
```

### Callback

```javascript
fCallBack(pError, pQuery, pCount)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `pError` | object/null | Error object if the operation failed, null on success |
| `pQuery` | object | The query that was executed |
| `pCount` | number | Number of affected records |

### Basic Usage

```javascript
meadow.doUndelete(meadow.query.addFilter('IDBook', 42),
	(pError, pQuery, pCount) =>
	{
		if (pError)
		{
			return console.log('Undelete failed:', pError);
		}
		console.log('Restored', pCount, 'record(s)');
	});
```

### How Undelete Works

The undelete operation generates an UPDATE statement that reverses the soft delete:

```sql
UPDATE Book SET Deleted = 0, UpdateDate = NOW(), UpdatingIDUser = :IDUser
  WHERE IDBook = :IDBook
```

Note that `DeleteDate` and `DeletingIDUser` are **not cleared** -- they remain as a historical record of when the record was deleted.

### Auto-Populated Fields on Undelete

| Schema Type | Behavior on Undelete |
|-------------|---------------------|
| `Deleted` | Set to `0` |
| `UpdateDate` | Set to `NOW()` |
| `UpdateIDUser` | Set to the current user ID |
| `DeleteDate` | **Not modified** (preserved as history) |
| `DeleteIDUser` | **Not modified** (preserved as history) |

---

## Raw Query Override

Both delete and undelete operations respect their respective raw query overrides:

```javascript
// Override the delete query
meadow.rawQueries.setQuery('Delete',
	'UPDATE Book SET Deleted = 1, DeleteDate = NOW() WHERE IDBook = :IDBook AND IDCustomer = :IDCustomer');

// Override the undelete query
meadow.rawQueries.setQuery('Undelete',
	'UPDATE Book SET Deleted = 0, UpdateDate = NOW() WHERE IDBook = :IDBook AND IDCustomer = :IDCustomer');
```

## Full Example: Delete and Restore Workflow

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
		{ Column: 'CreateDate', Type: 'CreateDate' },
		{ Column: 'CreatingIDUser', Type: 'CreateIDUser' },
		{ Column: 'UpdateDate', Type: 'UpdateDate' },
		{ Column: 'UpdatingIDUser', Type: 'UpdateIDUser' },
		{ Column: 'DeleteDate', Type: 'DeleteDate' },
		{ Column: 'DeletingIDUser', Type: 'DeleteIDUser' },
		{ Column: 'Deleted', Type: 'Deleted' }
	]);

meadow.setIDUser(5);

// Step 1: Soft delete book 42
meadow.doDelete(meadow.query.addFilter('IDBook', 42),
	(pError, pQuery, pCount) =>
	{
		console.log('Soft deleted', pCount, 'record(s)');

		// Step 2: Verify it's gone from normal queries
		meadow.doRead(meadow.query.addFilter('IDBook', 42),
			(pError, pQuery, pRecord) =>
			{
				console.log('Normal read found record:', !!pRecord);
				// false -- record appears deleted

				// Step 3: It's still there if we look for it
				meadow.doRead(
					meadow.query.addFilter('IDBook', 42).setDisableDeleteTracking(true),
					(pError, pQuery, pRecord) =>
					{
						console.log('With delete tracking disabled:', pRecord.Title);
						console.log('Deleted flag:', pRecord.Deleted);
						// Deleted = 1, record is still in DB

						// Step 4: Restore it
						meadow.doUndelete(meadow.query.addFilter('IDBook', 42),
							(pError, pQuery, pCount) =>
							{
								console.log('Restored', pCount, 'record(s)');

								// Step 5: Now it shows up in normal queries again
								meadow.doRead(meadow.query.addFilter('IDBook', 42),
									(pError, pQuery, pRecord) =>
									{
										console.log('Restored:', pRecord.Title);
										console.log('Deleted flag:', pRecord.Deleted);
										// Deleted = 0, record is visible again
									});
							});
					});
			});
	});
```
