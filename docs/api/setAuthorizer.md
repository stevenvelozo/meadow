# setAuthorizer

Set the role-based authorization rules for this Meadow instance.

## Signature

```javascript
meadow.setAuthorizer(pAuthorizer)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pAuthorizer` | `Object` | An object mapping role names to operation permissions |

## Returns

Returns the Meadow instance for chaining.

## Description

`setAuthorizer` sets the authorization rules used by Meadow-Endpoints to
enforce role-based access control on CRUD operations. Each key in the object is
a role name, and each value is an object mapping operations to permission
strings.

The authorizer is stored on the schema object and is accessible via
`meadow.schemaFull.authorizer`.

## Authorizer Structure

```javascript
{
	"Role Name": {
		"Create": "Allow" | "Deny" | <custom>,
		"Read": "Allow" | "Deny" | <custom>,
		"Reads": "Allow" | "Deny" | <custom>,
		"Update": "Allow" | "Deny" | <custom>,
		"Delete": "Allow" | "Deny" | <custom>,
		"Undelete": "Allow" | "Deny" | <custom>,
		"Count": "Allow" | "Deny" | <custom>
	}
}
```

## Examples

### Basic role configuration

```javascript
meadow.setAuthorizer({
	"Unauthenticated": {
		"Create": "Deny",
		"Read": "Allow",
		"Reads": "Allow",
		"Update": "Deny",
		"Delete": "Deny",
		"Undelete": "Deny",
		"Count": "Allow"
	},
	"User": {
		"Create": "Allow",
		"Read": "Allow",
		"Reads": "Allow",
		"Update": "Allow",
		"Delete": "Allow",
		"Undelete": "Deny",
		"Count": "Allow"
	},
	"Administrator": {
		"Create": "Allow",
		"Read": "Allow",
		"Reads": "Allow",
		"Update": "Allow",
		"Delete": "Allow",
		"Undelete": "Allow",
		"Count": "Allow"
	}
});
```

### Access after setting

```javascript
console.log(meadow.schemaFull.authorizer);
// { "Unauthenticated": { ... }, "User": { ... }, ... }
```

## Notes

- If `pAuthorizer` is not an object, it falls back to an empty object `{}`.

- The authorizer is primarily consumed by Meadow-Endpoints, which checks
  permissions before executing CRUD operations on HTTP routes. Meadow itself
  does not enforce authorization during direct `doCreate`, `doRead`, etc. calls.

- Role names should match the names returned by `getRoleName()`. The default
  role names are: `'Unauthenticated'`, `'User'`, `'Manager'`, `'Director'`,
  `'Executive'`, `'Administrator'`.

- When loading from a package file or object, the `Authorization` property of
  the package is passed to `setAuthorizer` automatically.
