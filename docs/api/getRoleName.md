# getRoleName

Get the human-readable role name for a numeric role index.

## Signature

```javascript
meadow.getRoleName(pRoleIndex)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pRoleIndex` | `number` | The zero-based index of the role |

## Returns

| Type | Description |
|------|-------------|
| `string` | The role name corresponding to the index |

## Description

`getRoleName` maps a numeric role index to a human-readable role name string.
If the index is out of range (negative or beyond the array length), it returns
`'Unauthenticated'`.

## Default Role Names

| Index | Role Name |
|-------|-----------|
| 0 | `'Unauthenticated'` |
| 1 | `'User'` |
| 2 | `'Manager'` |
| 3 | `'Director'` |
| 4 | `'Executive'` |
| 5 | `'Administrator'` |

## Examples

### Get a role name

```javascript
console.log(meadow.getRoleName(0)); // 'Unauthenticated'
console.log(meadow.getRoleName(1)); // 'User'
console.log(meadow.getRoleName(5)); // 'Administrator'
```

### Out-of-range index

```javascript
console.log(meadow.getRoleName(-1));  // 'Unauthenticated'
console.log(meadow.getRoleName(99));  // 'Unauthenticated'
```

### Custom role names via Fable settings

```javascript
var tmpFable = libFable.new({
	MeadowRoleNames: [
		'Anonymous',
		'Reader',
		'Editor',
		'Admin',
		'SuperAdmin'
	]
});

var meadow = libMeadow.new(tmpFable, 'Book');
console.log(meadow.getRoleName(0)); // 'Anonymous'
console.log(meadow.getRoleName(3)); // 'Admin'
```

## Notes

- The default role names can be overridden by providing an array as
  `MeadowRoleNames` in the Fable settings. The array must be provided at
  Meadow construction time.

- The role names are used by the authorizer system (set via `setAuthorizer`)
  to map numeric user roles to permission sets.

- If `MeadowRoleNames` is not an array, the default six-role set is used.
