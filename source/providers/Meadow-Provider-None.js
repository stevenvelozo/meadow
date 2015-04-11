/**
* Meadow Provider - No Data
*
* @license MIT
*

Expects query parameters in the foxhound format:
{
		scope: false,        // The scope of the data
								// TSQL: the "Table" or "View"
								// MongoDB: the "Collection"

		dataElements: false, // The data elements to return
								// TSQL: the "Columns"
								// MongoDB: the "Fields"

		begin: false,        // Record index to start at
								// TSQL: n in LIMIT 1,n
								// MongoDB: n in Skip(n)

		cap: false,          // Maximum number of records to return
								// TSQL: n in LIMIT n
								// MongoDB: n in limit(n)

		filter: false,       // Data filter expression
								// TSQL: the WHERE clause
								// MongoDB: a find() expression

		sort: false          // The sort order
								// TSQL: ORDER BY
								// MongoDB: sort()

		records: []          // The records to be created or changed
								// (OPTIONAL)

		result: []           // The result of the last query run
								// (OPTIONAL)
}

* @author Steven Velozo <steven@velozo.com>
* @module Meadow-Schema
*/

var MeadowProvider = function()
{
	function createNew(pFable)
	{
		// If a valid Fable object isn't passed in, return a constructor
		if ((typeof(pFable) !== 'object') || (!pFable.hasOwnProperty('fable')))
		{
			return {new: createNew};
		}
		var _Fable = pFable;

		var createRecords = function(pQueryParameters, fCallback)
		{
			var tmpCallBack = (typeof(fCallBack) === 'function') ? fCallback : function() {};

			// Meadow providers expect an extra array in the query, "records" when creating
			pQueryParameters.Result = (
				{
					type:'None',
					affected:0,
					result: {}
				});

			tmpCallBack(pQueryParameters, false);
		};

		// This is a synchronous read, good for a few records.
		// TODO: Add a pipe-able read for huge sets
		var readRecords = function(pQueryParameters, fCallback)
		{
			var tmpCallBack = (typeof(fCallBack) === 'function') ? fCallback : function() {};

			// This returns nothing because it's the none data provider!
			pQueryParameters.Result = (
				{
					type:'None',
					affected:0,
					result: {}
				});

			tmpCallBack(pQueryParameters, false);
		};

		var updateRecords = function(pQueryParameters, fCallback)
		{
			var tmpCallBack = (typeof(fCallBack) === 'function') ? fCallback : function() {};

			// Meadow providers expect an extra array in the query, "records" when updating
			pQueryParameters.Result = (
				{
					type:'None',
					affected:0,
					result: {}
				});

			tmpCallBack(pQueryParameters, false);
		};

		var deleteRecords = function(pQueryParameters, fCallback)
		{
			var tmpCallBack = (typeof(fCallBack) === 'function') ? fCallback : function() {};

			pQueryParameters.Result = (
				{
					type:'None',
					affected:0,
					result: {}
				});

			tmpCallBack(pQueryParameters, false);
		};

		var tmpNewProvider = (
		{
			setSchema: setSchema,
			validateObject: validateObject,

			new: createNew
		});


		return tmpNewProvider;
	}

	return createNew();
};

module.exports = new MeadowProvider();
