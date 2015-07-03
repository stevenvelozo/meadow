/**
* Meadow Behavior - Reads
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Meadow
*/
var libAsync = require('async');

/**
* Meadow Behavior - Read multiple records
*
* @function meadowBehaviorReads
*/
var meadowBehaviorReads = function(pMeadow, pQuery, fCallBack)
{
	// Read the record(s) from the source
	libAsync.waterfall(
		[
			// Step 1: Get the record(s) from the data source
			function (fStageComplete)
			{
				if (pMeadow.rawQueries.checkQuery('Reads'))
				{
					pQuery.parameters.queryOverride = pMeadow.rawQueries.getQuery('Reads');
				}
				pMeadow.provider.Read(pQuery, function(){ fStageComplete(pQuery.result.error, pQuery); });
			},
			// Step 2: Marshal all the records into an array of POJOs
			function (pQuery, fStageComplete)
			{
				var tmpRecords = [];

				libAsync.each
				(
					pQuery.parameters.result.value,
					function(pRow, pQueueCallback)
					{
						tmpRecords.push(pMeadow.marshalRecordFromSourceToObject(pRow));
						pQueueCallback();
					},
					function()
					{
						// After we've pushed every record into the array in order, complete the waterfall
						fStageComplete(pQuery.result.error, pQuery, tmpRecords);
					}
				);
			}
		],
		function(pError, pQuery, pRecords)
		{
			if (pError)
			{
				pMeadow.fable.log.warn('Error during the read multiple waterfall', {Error:pError, Query: pQuery.query});
			}
			fCallBack(pError, pQuery, pRecords);
		}
	);

	return pMeadow;
};

module.exports = meadowBehaviorReads;