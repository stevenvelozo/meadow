# doCount

Count records matching the query filters.

## Signature

```javascript
meadow.doCount(pQuery, fCallBack)
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| `pQuery` | `Object` | A FoxHound query object with optional filters |
| `fCallBack` | `Function` | Callback invoked when the operation completes |

## Callback

```javascript
function (pError, pQuery, pCount)
```

| Name | Type | Description |
|------|------|-------------|
| `pError` | `string\|null` | Error message, or falsy on success |
| `pQuery` | `Object` | The FoxHound query used for the count operation |
| `pCount` | `number\|false` | The integer count of matching records, or `false` on failure |

## Returns

Returns the Meadow instance for chaining.

## Description

`doCount` executes a two-step asynchronous waterfall:

1. **Count** -- If a `Count` raw query override is set via
   `rawQueries.setQuery('Count', ...)`, it is used. Otherwise, the provider's
   `Count` method executes the query.

2. **Validate and profile** -- The result is verified to be a number. If the
   provider returned a non-numeric value, the callback receives
   `'Count did not return valid results.'`. The elapsed time is checked against
   the `QueryThresholdWarnTime` setting (default 200ms). If the query exceeded
   the threshold, `logSlowQuery` emits a warning.

Soft-deleted records are excluded by default unless delete tracking is disabled
on the query.

## Examples

### Count all records

```javascript
var tmpQuery = meadow.query;

meadow.doCount(tmpQuery,
	function (pError, pQuery, pCount)
	{
		if (pError)
		{
			console.error('Count error:', pError);
			return;
		}
		console.log('Total books:', pCount);
	});
```

### Count with filters

```javascript
var tmpQuery = meadow.query
	.addFilter('Author', 'Tolkien');

meadow.doCount(tmpQuery,
	function (pError, pQuery, pCount)
	{
		console.log('Books by Tolkien:', pCount);
	});
```

### Count including soft-deleted records

```javascript
var tmpQuery = meadow.query
	.setDisableDeleteTracking(true);

meadow.doCount(tmpQuery,
	function (pError, pQuery, pCount)
	{
		console.log('Total including deleted:', pCount);
	});
```

## Notes

- The `Count` raw query override applies to this method. Set it via
  `meadow.rawQueries.setQuery('Count', pQueryString)`.

- Slow query profiling measures elapsed wall time from the start of `doCount`
  through provider completion. The threshold defaults to 200ms and can be
  configured via the `QueryThresholdWarnTime` Fable setting.

- The result is always an integer. If the provider returns a non-number, the
  callback receives an error and `pCount` is `false`.

- Soft-deleted records are excluded by default. Use
  `setDisableDeleteTracking(true)` on the query to include them in the count.
