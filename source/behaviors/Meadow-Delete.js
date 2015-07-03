/**
* Meadow Behavior - Delete
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Meadow
*/
var libAsync = require('async');

/**
* Meadow Behavior - Delete a single record
*
* @function meadowBehaviorDelete
*/
var meadowBehaviorDelete = function(pMeadow, pQuery, fCallBack)
{
	// TODO: Check if this recordset has implicit delete tracking, branch in this module.
	// Delete the record(s) from the source
	libAsync.waterfall(
		[
			// Step 1: Delete the record
			function (fStageComplete)
			{
				if (pMeadow.rawQueries.checkQuery('Delete'))
				{
					pQuery.parameters.queryOverride = pMeadow.rawQueries.getQuery('Delete');
				}
				pMeadow.provider.Delete(pQuery, function(){ fStageComplete(pQuery.result.error, pQuery, pQuery.result.value); });
			}
		],
		function(pError, pQuery, pRecord)
		{
			fCallBack(pError, pQuery, pRecord);
		}
	);

	return pMeadow;
};

module.exports = meadowBehaviorDelete;