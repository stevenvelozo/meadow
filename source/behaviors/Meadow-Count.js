/**
* Meadow Behavior - Count
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Meadow
*/
var libAsync = require('async');

/**
* Meadow Behavior - Count multiple records
*
* @function meadowBehaviorCount
*/
var meadowBehaviorCount = function(pMeadow, pQuery, fCallBack)
{
	// Count the record(s) from the source
	libAsync.waterfall(
		[
			// Step 1: Get the record countfrom the data source
			function (fStageComplete)
			{
				if (pMeadow.rawQueries.checkQuery('Count'))
					pQuery.parameters.queryOverride = pMeadow.rawQueries.getQuery('Count');
				pMeadow.provider.Count(pQuery, function(){ fStageComplete(pQuery.result.error, pQuery); });
			},
			// Step 2: Validate the resulting value
			function (pQuery, fStageComplete)
			{
				// Validate that the return value is a number
				if (typeof(pQuery.parameters.result.value) !== 'number')
				{
					return fStageComplete('Count did not return valid results.', pQuery, false);
				}

				fStageComplete(pQuery.result.error, pQuery, pQuery.result.value);
			}
		],
		function(pError, pQuery, pCount)
		{
			fCallBack(pError, pQuery, pCount);
		}
	);

	return pMeadow;
}

module.exports = meadowBehaviorCount;