# query (Property)

Access a fresh, cloned FoxHound query object pre-configured with the current
scope and schema.

## Signature

```javascript
var tmpQuery = meadow.query;
```

## Returns

| Type | Description |
|------|-------------|
| `Object` | A cloned FoxHound query with scope and schema pre-set |

## Description

The `query` property returns a **new clone** of the internal FoxHound query
every time it is accessed. This ensures that each query operation gets an
independent query object with no shared mutable state.

The cloned query inherits:

- The current **scope** (table name)
- The current **schema** (column definitions)
- Any **filters**, **cap**, **begin**, and **data elements** from the base
  query (these are cloned values, not references)

Because each access creates a fresh clone, it is safe to write:

```javascript
var tmpQuery = meadow.query;
```

without worrying about leakage between subsequent queries.

## Key Methods on the Returned Query

| Method | Description |
|--------|-------------|
| `addFilter(pColumn, pValue, pOperator, pConnector, pType)` | Add a WHERE filter |
| `addRecord(pRecord)` | Add a record for Create/Update operations |
| `setCap(pCap)` | Set the maximum number of records (LIMIT) |
| `setBegin(pBegin)` | Set the starting offset (OFFSET) |
| `addSort(pSort)` | Add a sort clause (e.g. `{ Column: 'Title', Direction: 'ASC' }`) |
| `setDataElements(pDataElements)` | Set which columns to return (SELECT list) |
| `setDistinct(pDistinct)` | Enable DISTINCT on the query |
| `setDisableDeleteTracking(pDisable)` | Include soft-deleted records when `true` |
| `setIDUser(pIDUser)` | Set the user ID on the query |
| `clone()` | Create another independent clone of this query |

## Examples

### Basic query for a read

```javascript
var tmpQuery = meadow.query
	.addFilter('IDBook', 42);

meadow.doRead(tmpQuery,
	function (pError, pQuery, pRecord)
	{
		console.log(pRecord);
	});
```

### Query with pagination and sorting

```javascript
var tmpQuery = meadow.query
	.addFilter('Author', 'Tolkien')
	.setCap(25)
	.setBegin(0)
	.addSort({ Column: 'Title', Direction: 'ASC' });

meadow.doReads(tmpQuery,
	function (pError, pQuery, pRecords)
	{
		console.log(pRecords.length, 'results');
	});
```

### Query with specific columns

```javascript
var tmpQuery = meadow.query
	.setDataElements(['IDBook', 'Title', 'Author']);

meadow.doReads(tmpQuery,
	function (pError, pQuery, pRecords)
	{
		console.log(pRecords);
	});
```

### Query for create with a record

```javascript
var tmpQuery = meadow.query
	.addRecord({ Title: 'Dune', Author: 'Herbert' });

meadow.doCreate(tmpQuery,
	function (pError, pCreateQuery, pReadQuery, pRecord)
	{
		console.log('New ID:', pRecord.IDBook);
	});
```

### Independent queries from the same meadow

```javascript
var tmpQueryA = meadow.query.addFilter('IDBook', 1);
var tmpQueryB = meadow.query.addFilter('IDBook', 2);

// tmpQueryA and tmpQueryB are completely independent
// Modifying one does not affect the other
```

## Notes

- Every access to `meadow.query` creates a new clone. Do not access it in a
  loop if you need the same query object -- assign it to a variable first.

- The query object is a FoxHound instance. See the FoxHound documentation for
  the full query API.

- The schema is attached to the cloned query at `tmpQuery.query.schema`, which
  providers use for query generation.

- Filters, cap, begin, and data elements survive cloning. Records do not
  survive cloning by default.
