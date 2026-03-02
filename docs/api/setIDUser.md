# setIDUser

Set the user ID used for create, update, and delete audit stamps.

## Signature

```javascript
meadow.setIDUser(pIDUser)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pIDUser` | `number` | The user ID to stamp on records |

## Returns

Returns the Meadow instance for chaining.

## Description

`setIDUser` sets the fallback user ID that Meadow uses when stamping audit
columns (`CreatingIDUser`, `ModifyingIDUser`, `DeletingIDUser`) during create,
update, and delete operations.

The user ID resolution order for CRUD operations is:

1. `pQuery.query.IDUser` -- if already set directly on the query
2. `pQuery.userID` -- if set on the query and is a non-negative integer
3. `meadow.userIdentifier` -- the fallback value set by `setIDUser`

The default value is `0`.

## Examples

### Set a global user ID

```javascript
var meadow = libMeadow.new(tmpFable, 'Book')
	.setIDUser(42);

console.log(meadow.userIdentifier); // 42
```

### Override per-query

```javascript
meadow.setIDUser(1); // Default user

// This query uses user 99 instead
var tmpQuery = meadow.query
	.setIDUser(99)
	.addRecord({ Title: 'Dune' });

meadow.doCreate(tmpQuery,
	function (pError, pCreateQuery, pReadQuery, pRecord)
	{
		// CreatingIDUser will be 99, not 1
		console.log(pRecord.CreatingIDUser);
	});
```

### Typical use in a web server

```javascript
// In a request handler, set the user from the session
app.get('/api/Books',
	function (pRequest, pResponse)
	{
		var tmpMeadow = meadow.setIDUser(pRequest.session.UserID);
		var tmpQuery = tmpMeadow.query;

		tmpMeadow.doReads(tmpQuery,
			function (pError, pQuery, pRecords)
			{
				pResponse.send(pRecords);
			});
	});
```

## Notes

- The value set by `setIDUser` is accessible via the `userIdentifier`
  read-only property.

- `setIDUser` sets a fallback. If the query already has `IDUser` set, the
  query-level value takes precedence.

- The default value is `0`, which typically represents an unauthenticated or
  system user.
