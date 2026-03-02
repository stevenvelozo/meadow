# setDefaultIdentifier

Set the primary key column name for this Meadow instance.

## Signature

```javascript
meadow.setDefaultIdentifier(pDefaultIdentifier)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pDefaultIdentifier` | `string` | The primary key column name (e.g. `'IDBook'`) |

## Returns

Returns the Meadow instance for chaining.

## Description

`setDefaultIdentifier` sets the primary key column name used for automated
queries. It also derives the GUID identifier by prepending `'GU'` to the value.
For example, setting the identifier to `'IDBook'` automatically sets the GUID
identifier to `'GUIDBook'`.

After setting the identifier, `updateProviderState()` is called to synchronize
with the active provider.

By default, the identifier is derived from the scope at construction time:
`'ID' + scope` (e.g., scope `'Book'` produces identifier `'IDBook'`).

## Examples

### Default behavior

```javascript
var meadow = libMeadow.new(tmpFable, 'Book');
console.log(meadow.defaultIdentifier);   // 'IDBook'
console.log(meadow.defaultGUIdentifier); // 'GUIDBook'
```

### Custom identifier

```javascript
var meadow = libMeadow.new(tmpFable, 'Book')
	.setDefaultIdentifier('BookID');

console.log(meadow.defaultIdentifier);   // 'BookID'
console.log(meadow.defaultGUIdentifier); // 'GUBookID'
```

### Use with non-standard naming

```javascript
var meadow = libMeadow.new(tmpFable, 'UserProfile')
	.setDefaultIdentifier('ProfileID');

// doUpdate will require records to have a 'ProfileID' property
var tmpQuery = meadow.query
	.addRecord({ ProfileID: 5, DisplayName: 'Alice' });

meadow.doUpdate(tmpQuery,
	function (pError, pUpdateQuery, pReadQuery, pRecord)
	{
		console.log(pRecord);
	});
```

## Notes

- The GUID identifier is always `'GU' + pDefaultIdentifier`. This is a fixed
  convention and cannot be set independently.

- The default identifier is used by `doUpdate` to determine which column
  identifies the record to update. If the record does not contain this column,
  the update is aborted.

- The default identifier is also used by `doCreate` to read back the newly
  created record after insertion.

- Changing the default identifier calls `updateProviderState()` to synchronize
  with the active provider.
