/**
* Meadow Behavior - Read
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Meadow
*/
var libAsync = require('async');

/**
* Meadow Behavior - Read a single record
*
* @function meadowBehaviorRead
*/
var meadowBehaviorRead = function(pMeadow, pQuery, fCallBack)
{
	// Read the record from the source
	libAsync.waterfall(
		[
			// Step 1: Get the record from the data source
			function (fStageComplete)
			{
				// If there is a Read override query, use it!
				if (pMeadow.rawQueries.checkQuery('Read'))
				{
					pQuery.parameters.queryOverride = pMeadow.rawQueries.getQuery('Read');
				}
				pMeadow.provider.Read(pQuery, function(){ fStageComplete(pQuery.result.error, pQuery); });
			},
			// Step 2: Marshal the record into a POJO
			function (pQuery, fStageComplete)
			{
				// Check that a record was returned
				if (pQuery.parameters.result.value.length < 1)
				{
					return fStageComplete(false, pQuery, false);
				}

				var tmpRecord = pMeadow.marshalRecordFromSourceToObject(pQuery.result.value[0]);

				fStageComplete(pQuery.result.error, pQuery, tmpRecord);
			}
		],
		function(pError, pQuery, pRecord)
		{
			if (pError)
			{
				pMeadow.fable.log.warn('Error during the read waterfall', {Error:pError, Query: pQuery.query});
			}
			fCallBack(pError, pQuery, pRecord);
		}
	);

	return pMeadow;
};

module.exports = meadowBehaviorRead;