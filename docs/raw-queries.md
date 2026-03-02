# Raw Queries

Raw queries let you bypass FoxHound's query generation and provide your own SQL strings directly. This is an escape hatch for complex queries -- JOINs, subqueries, custom reports, and anything the DSL does not natively support.

## What Raw Queries Are

When Meadow executes a CRUD operation, FoxHound normally generates the SQL query body from your filters, sort directives, and schema. A raw query override replaces that generated SQL with a string you provide. The override is stored by tag name and is automatically applied when the corresponding behavior runs.

Raw queries are managed through the `meadow.rawQueries` object, which is an instance of `Meadow-RawQuery`.

## Setting a Raw Query

Use `setQuery` to register a SQL override string by tag name:

```javascript
var tmpBookDAL = libMeadow.new(_Fable, 'Book')
	.setProvider('MySQL')
	.setDefaultIdentifier('IDBook')
	.setSchema(tmpBookSchema);

tmpBookDAL.rawQueries.setQuery('Reads',
	'SELECT b.IDBook, b.Title, b.Author, a.Name AS AuthorName ' +
	'FROM Book b ' +
	'INNER JOIN Author a ON b.IDAuthor = a.IDAuthor ' +
	'WHERE b.Deleted = 0');
```

After setting this override, every `doReads` call on this DAL uses your custom SQL instead of the auto-generated query.

The `setQuery` method returns the Meadow instance, so you can chain it if desired.

## Loading a Raw Query from a File

Use `loadQuery` to read a SQL override from a file on disk. This is useful for keeping complex queries in their own `.sql` files:

```javascript
tmpBookDAL.rawQueries.loadQuery('Reads', __dirname + '/queries/BookReads.sql',
	function (pSuccess)
	{
		if (pSuccess)
		{
			console.log('Custom Reads query loaded');
		}
		else
		{
			console.log('Failed to load custom Reads query');
		}
	});
```

The callback receives `true` if the file was loaded successfully, or `false` if there was an error. On failure, the query tag is set to an empty string (which means FoxHound will generate an empty query body rather than falling back to auto-generation).

## Retrieving a Raw Query

Use `getQuery` to retrieve a previously stored raw query by tag:

```javascript
var tmpSQL = tmpBookDAL.rawQueries.getQuery('Reads');
// Returns the SQL string, or false if no query is set for this tag
```

## Checking if a Raw Query Exists

Use `checkQuery` to test whether a query has been registered for a given tag:

```javascript
if (tmpBookDAL.rawQueries.checkQuery('Reads'))
{
	console.log('Custom Reads query is set');
}
else
{
	console.log('Using auto-generated Reads query');
}
```

Returns `true` if a query has been set for the tag, `false` otherwise.

## Override Tags

Meadow behaviors check for raw query overrides using specific tag names. The following tags are recognized:

| Tag | Behavior | Description |
|-----|----------|-------------|
| `Read` | `doRead` | Override the single-record read query |
| `Reads` | `doReads` | Override the multi-record read query |
| `Delete` | `doDelete` | Override the delete query |
| `Undelete` | `doUndelete` | Override the undelete query |
| `Count` | `doCount` | Override the count query |

Additionally, the `Read` override is also used during `doCreate` and `doUpdate` when they read the record back after writing. This means setting a `Read` override affects the read-back step of create and update operations as well.

### Create and Update Do Not Support Raw Query Overrides

The `Create` and `Update` tags are **not** supported for raw query overrides. The insert and update SQL generation involves complex parameter binding and column mapping that is tightly coupled to FoxHound's query builder. Attempting to set a `Create` or `Update` override will have no effect.

If you need custom insert or update behavior, consider using the provider's database connection directly for those specific operations.

## Examples

### JOIN Query for Reads

Create a file `queries/BookWithAuthor.sql`:

```sql
SELECT
	b.IDBook,
	b.GUIDBook,
	b.Title,
	b.YearPublished,
	b.CreateDate,
	b.CreatingIDUser,
	b.UpdateDate,
	b.UpdatingIDUser,
	b.Deleted,
	b.DeleteDate,
	b.DeletingIDUser,
	a.Name AS AuthorName,
	a.Country AS AuthorCountry
FROM Book b
	LEFT JOIN Author a ON b.IDAuthor = a.IDAuthor
WHERE b.Deleted = 0
ORDER BY b.Title ASC
```

Load and use it:

```javascript
tmpBookDAL.rawQueries.loadQuery('Reads', __dirname + '/queries/BookWithAuthor.sql',
	function (pSuccess)
	{
		tmpBookDAL.doReads(tmpBookDAL.query.setCap(50),
			function (pError, pQuery, pRecords)
			{
				for (var i = 0; i < pRecords.length; i++)
				{
					console.log(pRecords[i].Title, 'by', pRecords[i].AuthorName);
				}
			});
	});
```

### Custom Count Query

```javascript
tmpBookDAL.rawQueries.setQuery('Count',
	'SELECT COUNT(DISTINCT Author) AS RowCount ' +
	'FROM Book ' +
	'WHERE Deleted = 0');

tmpBookDAL.doCount(tmpBookDAL.query,
	function (pError, pQuery, pCount)
	{
		console.log('Unique authors:', pCount);
	});
```

Note that the count query must return a result with a `RowCount` column for the MySQL provider (or `Row_Count` for MSSQL) so the provider can extract the numeric value.

### Custom Read Override for Single Records

```javascript
tmpBookDAL.rawQueries.setQuery('Read',
	'SELECT b.*, GROUP_CONCAT(t.TagName) AS Tags ' +
	'FROM Book b ' +
	'LEFT JOIN BookTag bt ON b.IDBook = bt.IDBook ' +
	'LEFT JOIN Tag t ON bt.IDTag = t.IDTag ' +
	'WHERE b.IDBook = :IDBook AND b.Deleted = 0 ' +
	'GROUP BY b.IDBook');

tmpBookDAL.doRead(tmpBookDAL.query.addFilter('IDBook', 42),
	function (pError, pQuery, pRecord)
	{
		console.log(pRecord.Title, '- Tags:', pRecord.Tags);
	});
```

### Using Arbitrary Tags

You can store any number of custom queries under arbitrary tag names for your own use, even though Meadow only checks the standard tags automatically:

```javascript
tmpBookDAL.rawQueries.setQuery('TopAuthors',
	'SELECT Author, COUNT(*) AS BookCount ' +
	'FROM Book ' +
	'WHERE Deleted = 0 ' +
	'GROUP BY Author ' +
	'ORDER BY BookCount DESC ' +
	'LIMIT 10');

// Retrieve later for manual use
var tmpSQL = tmpBookDAL.rawQueries.getQuery('TopAuthors');
```
