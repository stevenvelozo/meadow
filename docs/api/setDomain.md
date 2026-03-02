# setDomain

Set the entity domain for organizational grouping.

## Signature

```javascript
meadow.setDomain(pDomain)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pDomain` | `string` | The domain name for this entity |

## Returns

Returns the Meadow instance for chaining.

## Description

`setDomain` sets an organizational grouping label for the Meadow instance.
Domains allow multiple entities to be grouped logically, which is useful in
multi-tenant or modular applications.

The default domain is `'Default'`.

## Examples

### Set a custom domain

```javascript
var meadow = libMeadow.new(tmpFable, 'Book')
	.setDomain('Library');
```

### Set domain from a package

```javascript
// In a package JSON file:
// { "Scope": "Book", "Domain": "Library", ... }

var meadow = libMeadow.new(tmpFable)
	.loadFromPackage('./Book.json');
// Domain is set to 'Library' from the package
```

## Notes

- The domain is a free-form string with no restrictions on content.

- The default value is `'Default'` if not explicitly set.

- When loading from a package file or object, the `Domain` property of the
  package is passed to `setDomain` automatically.
