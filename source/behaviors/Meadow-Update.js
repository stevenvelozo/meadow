/**
* Meadow Behavior - Update
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Meadow
*/
var libAsync = require('async');

/**
* Meadow Behavior - Update a single record
*
* @function meadowBehaviorUpdate
*/
var meadowBehaviorUpdate = function(pMeadow, pQuery, fCallBack)
{
	// Update the record(s) from the source
	libAsync.waterfall(
		[
			// Step 1: Update the record
			function (fStageComplete)
			{
				pQuery.query.IDUser = pMeadow.userIdentifier;
				// Make sure the developer submitted a record
				if (!pQuery.query.records)
				{
					return fStageComplete('No record submitted', pQuery, false);
				}
				// Make sure there is a default identifier
				if (!pQuery.query.records[0].hasOwnProperty(pMeadow.defaultIdentifier))
				{
					return fStageComplete('Automated update missing default identifier', pQuery, false);
				}

				// Now see if there is anything in the schema that is an Update action that isn't in this query
				for (var i = 0; i < pMeadow.schema.length; i++)
				{
					switch (pMeadow.schema[i].Type)
					{
						case 'UpdateIDUser':
						case 'UpdateDate':
							pQuery.query.records[0][pMeadow.schema[i].Column] = false;
							break;
					}
				}
				// Set the update filter
				pQuery.addFilter(pMeadow.defaultIdentifier, pQuery.query.records[0][pMeadow.defaultIdentifier]);

				// Sanity check on update to make sure we don't update EVERY record.
				if ((pQuery.parameters.filter === false) || (pQuery.parameters.filter.length < 1))
				{
					return fStageComplete('Automated update missing filters... aborting!', pQuery, false);
				}

				// Updates are too complex to override for now, punting on this feature.
				//if (pMeadow.rawQueries.checkQuery('Update'))
				//	pQuery.parameters.queryOverride = pMeadow.rawQueries.getQuery('Update');
				pMeadow.provider.Update(pQuery, function(){ fStageComplete(pQuery.result.error, pQuery); });
			},
			// Step 2: Check that the record was updated
			function (pQuery, fStageComplete)
			{
				if (
						// The query wasn't run yet
						(pQuery.parameters.result.executed === false) || 
						// The value is not an object
						(typeof(pQuery.parameters.result.value) !== 'object')
					)
				{
					return fStageComplete('No record updated.', pQuery, false);
				}

				fStageComplete(pQuery.result.error, pQuery);
			},
			// Step 3: Read the record
			function (pQuery, fStageComplete)
			{
				// We can clone the query, since it has the criteria for the update in it already (filters survive a clone)
				var tmpQueryRead = pQuery.clone();
				// Make sure to load the record with the custom query if necessary.
				if (pMeadow.rawQueries.checkQuery('Read'))
				{
					tmpQueryRead.parameters.queryOverride = pMeadow.rawQueries.getQuery('Read');
				}
				pMeadow.provider.Read(tmpQueryRead, function(){ fStageComplete(tmpQueryRead.result.error, pQuery, tmpQueryRead); });
			},
			// Step 4: Marshal the record into a POJO
			function (pQuery, pQueryRead, fStageComplete)
			{
				var tmpRecord = pMeadow.marshalRecordFromSourceToObject(pQueryRead.result.value[0]);
				fStageComplete(pQuery.result.error, pQuery, pQueryRead, tmpRecord);
			}
		],
		function(pError, pQuery, pQueryRead, pRecord)
		{
			if (pError)
			{
				pMeadow.fable.log.warn('Error during Update waterfall', {Error:pError, Query: pQuery.query});
			}
			fCallBack(pError, pQuery, pQueryRead, pRecord);
		}
	);

	return pMeadow;
};

module.exports = meadowBehaviorUpdate;