# setScope

Set the entity scope (table name) for this Meadow instance.

## Signature

```javascript
meadow.setScope(pScope)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pScope` | `string` | The entity scope, typically a database table name (e.g. `'Book'`) |

## Returns

Returns the Meadow instance for chaining.

## Description

`setScope` updates the internal scope and synchronizes it with the FoxHound
query object and the active provider. The scope is used as the table name (or
collection name) in generated queries.

The scope is also set during construction via the second argument to
`libMeadow.new(pFable, pScope)`. If no scope is provided at construction time,
it defaults to `'Unknown'`.

## Examples

### Set scope at construction

```javascript
var meadow = libMeadow.new(tmpFable, 'Book');
console.log(meadow.scope); // 'Book'
```

### Change scope after construction

```javascript
var meadow = libMeadow.new(tmpFable, 'Book');
meadow.setScope('Author');
console.log(meadow.scope); // 'Author'
```

### Chain with other configuration

```javascript
var meadow = libMeadow.new(tmpFable)
	.setScope('Book')
	.setSchema(bookSchema)
	.setProvider('MySQL');
```

## Notes

- Changing the scope calls `updateProviderState()` to synchronize the new scope
  with the active provider.

- The scope also updates the internal FoxHound query object via
  `_Query.setScope(pScope)`, so that all subsequent cloned queries inherit the
  new scope.

- The `defaultIdentifier` is **not** automatically updated when the scope
  changes. If you change the scope, you may also need to call
  `setDefaultIdentifier` to match the new table's primary key column.
