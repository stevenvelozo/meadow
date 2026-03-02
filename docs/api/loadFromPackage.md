# loadFromPackage / loadFromPackageObject

Load a complete Meadow configuration from a JSON package file or a JavaScript
object.

## Signatures

```javascript
meadow.loadFromPackage(pPackage)
meadow.loadFromPackageObject(pPackage)
```

## Parameters

### loadFromPackage

| Name | Type | Description |
|------|------|-------------|
| `pPackage` | `string` | File path to a JSON package (resolved via `require()`) |

### loadFromPackageObject

| Name | Type | Description |
|------|------|-------------|
| `pPackage` | `Object` | A JavaScript object containing the package definition |

## Returns

Returns a **new** Meadow instance configured from the package, or `false` on
error. This does **not** modify the calling instance.

## Description

These methods create a brand-new Meadow instance and configure it from a
package definition. The package can contain all of the following properties:

| Property | Type | Method Called |
|----------|------|--------------|
| `Scope` | `string` | `setScope()` |
| `Domain` | `string` | `setDomain()` |
| `DefaultIdentifier` | `string` | `setDefaultIdentifier()` |
| `Schema` | `Array` | `setSchema()` |
| `JsonSchema` | `Object` | `setJsonSchema()` |
| `DefaultObject` | `Object` | `setDefault()` |
| `Authorization` | `Object` | `setAuthorizer()` |

`loadFromPackage` uses `require()` to load the file, so relative paths are
resolved relative to the module. `loadFromPackageObject` takes the object
directly.

The new Meadow instance inherits the Fable context from the calling instance.

## Package File Format

```json
{
	"Scope": "Book",
	"Domain": "Library",
	"DefaultIdentifier": "IDBook",
	"Schema": [
		{ "Column": "IDBook", "Type": "AutoIdentity" },
		{ "Column": "GUIDBook", "Type": "AutoGUID" },
		{ "Column": "Title", "Type": "String", "Size": "256" },
		{ "Column": "Created", "Type": "CreateDate" },
		{ "Column": "CreatingIDUser", "Type": "CreateIDUser" },
		{ "Column": "Modified", "Type": "UpdateDate" },
		{ "Column": "ModifyingIDUser", "Type": "UpdateIDUser" },
		{ "Column": "Deleted", "Type": "Deleted" },
		{ "Column": "DeletingIDUser", "Type": "DeleteIDUser" },
		{ "Column": "DeleteDate", "Type": "DeleteDate" }
	],
	"JsonSchema": {
		"title": "Book",
		"type": "object",
		"properties": {
			"Title": { "type": "string" }
		},
		"required": ["Title"]
	},
	"DefaultObject": {
		"IDBook": 0,
		"GUIDBook": "",
		"Title": ""
	},
	"Authorization": {
		"User": {
			"Create": "Allow",
			"Read": "Allow",
			"Update": "Allow",
			"Delete": "Allow"
		}
	}
}
```

## Examples

### Load from a file path

```javascript
var tmpBookMeadow = libMeadow.new(tmpFable)
	.loadFromPackage(__dirname + '/schemas/Book.json');

if (!tmpBookMeadow)
{
	console.error('Failed to load package');
}
else
{
	console.log(tmpBookMeadow.scope); // 'Book'
}
```

### Load from a JavaScript object

```javascript
var tmpPackage = {
	Scope: 'Author',
	DefaultIdentifier: 'IDAuthor',
	Schema: [
		{ Column: 'IDAuthor', Type: 'AutoIdentity' },
		{ Column: 'GUIDAuthor', Type: 'AutoGUID' },
		{ Column: 'Name', Type: 'String', Size: '128' }
	],
	DefaultObject: {
		IDAuthor: 0,
		GUIDAuthor: '',
		Name: ''
	}
};

var tmpAuthorMeadow = libMeadow.new(tmpFable)
	.loadFromPackageObject(tmpPackage);

console.log(tmpAuthorMeadow.scope); // 'Author'
```

## Notes

- Both methods return a **new** Meadow instance. They do not modify the
  calling instance. Assign the return value to use the configured instance.

- `loadFromPackage` returns `false` if the `require()` call fails (file not
  found, JSON parse error, etc.). An error is logged via the Fable logger.

- `loadFromPackageObject` logs a warning if the object does not have a `Scope`
  property but still creates the new instance.

- All package properties are optional. Only properties present in the package
  are applied to the new instance.

- The new instance inherits the Fable context (and therefore the provider
  setting from `MeadowProvider` in Fable settings) from the calling instance.
