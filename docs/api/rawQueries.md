# rawQueries (Property)

Access the raw query manager for overriding auto-generated SQL with custom
query strings.

## Signature

```javascript
var tmpRawQueries = meadow.rawQueries;
```

## Returns

| Type | Description |
|------|-------------|
| `Object` | The Meadow-RawQuery manager instance |

## Description

The `rawQueries` property provides access to a manager that stores and
retrieves raw query strings. When a raw query override is set for a particular
operation tag, Meadow passes it to the provider as `queryOverride` instead of
auto-generating the SQL from the FoxHound query.

This is useful when you need hand-tuned SQL for performance, complex joins, or
database-specific features that the query builder does not support.

## Methods

### setQuery

```javascript
meadow.rawQueries.setQuery(pQueryTag, pQueryString)
```

| Name | Type | Description |
|------|------|-------------|
| `pQueryTag` | `string` | The operation tag (e.g. `'Read'`, `'Reads'`, `'Count'`) |
| `pQueryString` | `string` | The raw SQL query string |

**Returns:** The Meadow instance (for chaining off the parent).

Sets a raw query override for the given tag. When a CRUD method detects a raw
query for its tag, it passes the string to the provider.

### loadQuery

```javascript
meadow.rawQueries.loadQuery(pQueryTag, pFileName, fCallBack)
```

| Name | Type | Description |
|------|------|-------------|
| `pQueryTag` | `string` | The operation tag |
| `pFileName` | `string` | Path to a file containing the SQL query |
| `fCallBack` | `Function` | Callback: `function(pSuccess)` where `pSuccess` is `true` or `false` |

**Returns:** The Meadow instance (for chaining off the parent).

Loads a raw query from a file asynchronously using `fs.readFile`. On success,
the file contents are stored as the raw query for the given tag. On error, the
query is set to an empty string and `false` is passed to the callback.

### getQuery

```javascript
meadow.rawQueries.getQuery(pQueryTag)
```

| Name | Type | Description |
|------|------|-------------|
| `pQueryTag` | `string` | The operation tag |

**Returns:** The raw query string, or `false` if no override is set for that
tag.

### checkQuery

```javascript
meadow.rawQueries.checkQuery(pQueryTag)
```

| Name | Type | Description |
|------|------|-------------|
| `pQueryTag` | `string` | The operation tag |

**Returns:** `true` if a raw query override exists for the tag, `false`
otherwise.

## Supported Override Tags

| Tag | Used By | Description |
|-----|---------|-------------|
| `'Read'` | `doRead`, `doCreate` (read-back), `doUpdate` (read-back) | Override the single-record read query |
| `'Reads'` | `doReads` | Override the multi-record read query |
| `'Delete'` | `doDelete` | Override the delete query |
| `'Undelete'` | `doUndelete` | Override the undelete query |
| `'Count'` | `doCount` | Override the count query |

**Not supported for override:** `'Create'` and `'Update'` are not currently
supported. The source notes that these overrides are too complex and the
feature is deferred.

You can also store arbitrary custom query tags for your own use, but only the
tags listed above are automatically checked by Meadow's CRUD methods.

## Examples

### Override a read query

```javascript
meadow.rawQueries.setQuery('Read',
	'SELECT b.*, a.Name AS AuthorName ' +
	'FROM Book b ' +
	'JOIN Author a ON b.IDAuthor = a.IDAuthor ' +
	'WHERE b.IDBook = :IDBook AND b.Deleted = 0');

var tmpQuery = meadow.query.addFilter('IDBook', 42);
meadow.doRead(tmpQuery,
	function (pError, pQuery, pRecord)
	{
		// Uses the custom join query instead of auto-generated SQL
		console.log(pRecord);
	});
```

### Override a reads query with pagination

```javascript
meadow.rawQueries.setQuery('Reads',
	'SELECT b.IDBook, b.Title, COUNT(r.IDReview) AS ReviewCount ' +
	'FROM Book b ' +
	'LEFT JOIN Review r ON b.IDBook = r.IDBook ' +
	'WHERE b.Deleted = 0 ' +
	'GROUP BY b.IDBook, b.Title ' +
	'ORDER BY ReviewCount DESC ' +
	'LIMIT :Cap OFFSET :Begin');

var tmpQuery = meadow.query.setCap(10).setBegin(0);
meadow.doReads(tmpQuery,
	function (pError, pQuery, pRecords)
	{
		console.log(pRecords);
	});
```

### Load a query from a file

```javascript
meadow.rawQueries.loadQuery('Reads', __dirname + '/queries/BookList.sql',
	function (pSuccess)
	{
		if (!pSuccess)
		{
			console.error('Failed to load query file');
			return;
		}

		var tmpQuery = meadow.query;
		meadow.doReads(tmpQuery,
			function (pError, pQuery, pRecords)
			{
				console.log(pRecords);
			});
	});
```

### Check before using

```javascript
if (meadow.rawQueries.checkQuery('Count'))
{
	console.log('Custom count query:', meadow.rawQueries.getQuery('Count'));
}
else
{
	console.log('Using auto-generated count query');
}
```

## Notes

- Raw queries use FoxHound parameter placeholders (e.g. `:IDBook`, `:Cap`,
  `:Begin`, `:IDUser`). The provider substitutes these with actual values at
  execution time.

- The `Read` override is shared between `doRead`, the read-back step of
  `doCreate`, and the read-back step of `doUpdate`. Setting it affects all
  three operations.

- When a `loadQuery` file read fails, the query is set to an empty string
  `''` (not `false`). This means FoxHound will receive an empty override
  rather than generating a query. Be aware of this when handling file load
  errors.

- Raw query overrides are stored per-instance. Different Meadow instances
  (even for the same scope) maintain independent raw query sets.
